"""PostgreSQL backup and restore endpoints for FleetDoc.

The backup contains the complete application database state represented by
FleetDoc's SQLAlchemy models. Restore is deliberately restricted to Admin
users because it replaces the current database contents.
"""

from datetime import date, datetime, time
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import Session
from sqlalchemy.sql.sqltypes import Boolean, Date, DateTime, Float, Integer, Numeric
from sqlalchemy.types import JSON as JSONType

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.models import (
    AuditLog,
    Challan,
    Document,
    EMI,
    Loan,
    Notification,
    OTPRequest,
    Payment,
    RoadTax,
    Setting,
    Subscription,
    User,
    Vehicle,
)

router = APIRouter(prefix="/api/v1/backup", tags=["Backup & Restore"])

BACKUP_VERSION = 1
MAX_BACKUP_BYTES = 50 * 1024 * 1024

# Parent rows must be restored before child rows. Delete uses the reverse
# order. This is explicit so the behavior is stable and easy to audit.
TABLES = [
    ("users", User),
    ("vehicles", Vehicle),
    ("settings", Setting),
    ("loans", Loan),
    ("documents", Document),
    ("challans", Challan),
    ("road_taxes", RoadTax),
    ("emis", EMI),
    ("subscriptions", Subscription),
    ("notifications", Notification),
    ("payments", Payment),
    ("otp_requests", OTPRequest),
    ("audit_logs", AuditLog),
]

TABLE_MAP = dict(TABLES)


def _json_value(value: Any) -> Any:
    """Convert SQLAlchemy/Python values to JSON-safe values."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, dict):
        return {str(k): _json_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_json_value(v) for v in value]
    return str(value)


def _row_to_dict(obj: Any) -> dict[str, Any]:
    mapper = inspect(obj).mapper
    return {
        column.key: _json_value(getattr(obj, column.key))
        for column in mapper.columns
    }


def _parse_datetime(value: Any) -> datetime | None:
    if value is None or isinstance(value, datetime):
        return value
    if isinstance(value, str):
        text_value = value.strip()
        if text_value.endswith("Z"):
            text_value = text_value[:-1] + "+00:00"
        try:
            return datetime.fromisoformat(text_value)
        except ValueError:
            pass
    raise ValueError(f"Invalid datetime value: {value!r}")


def _parse_date(value: Any) -> date | None:
    if value is None or isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value.strip())
        except ValueError:
            pass
    raise ValueError(f"Invalid date value: {value!r}")


def _coerce_column_value(column: Any, value: Any) -> Any:
    if value is None:
        return None

    column_type = column.type

    if isinstance(column_type, DateTime):
        return _parse_datetime(value)
    if isinstance(column_type, Date):
        return _parse_date(value)
    if isinstance(column_type, Boolean):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on"}
        return bool(value)
    if isinstance(column_type, Integer):
        try:
            return int(value)
        except (TypeError, ValueError):
            raise ValueError(f"Invalid integer value for {column.key}: {value!r}")
    if isinstance(column_type, (Float, Numeric)):
        try:
            return float(value)
        except (TypeError, ValueError):
            raise ValueError(f"Invalid numeric value for {column.key}: {value!r}")
    if isinstance(column_type, JSONType):
        return value
    return value


def _validate_backup(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Backup must be a JSON object")

    if payload.get("backupType") != "FleetDoc PostgreSQL Backup":
        raise ValueError("This file is not a valid FleetDoc PostgreSQL backup")

    version = payload.get("version")
    if version != BACKUP_VERSION:
        raise ValueError(f"Unsupported FleetDoc backup version: {version}")

    tables = payload.get("tables")
    if not isinstance(tables, dict):
        raise ValueError("Backup tables section is missing or invalid")

    missing = [name for name, _ in TABLES if name not in tables]
    if missing:
        raise ValueError("Backup is incomplete; missing tables: " + ", ".join(missing))

    for table_name, model in TABLES:
        rows = tables.get(table_name)
        if not isinstance(rows, list):
            raise ValueError(f"Backup table '{table_name}' must be an array")

        valid_columns = {column.key for column in inspect(model).mapper.columns}
        for index, row in enumerate(rows):
            if not isinstance(row, dict):
                raise ValueError(f"Invalid row {index} in table '{table_name}'")
            unknown = set(row) - valid_columns
            if unknown:
                raise ValueError(
                    f"Unknown column(s) in {table_name} row {index}: {', '.join(sorted(unknown))}"
                )

    return payload


def _reset_postgres_sequences(db: Session) -> None:
    """Move PostgreSQL integer PK sequences after explicit-ID restores."""
    if db.bind is None or db.bind.dialect.name != "postgresql":
        return

    for table_name, _ in TABLES:
        sequence = db.execute(
            text("SELECT pg_get_serial_sequence(:table_name, 'id')"),
            {"table_name": table_name},
        ).scalar()
        if not sequence:
            continue

        max_id = db.execute(
            text(f'SELECT MAX(id) FROM "{table_name}"')
        ).scalar()

        if max_id is None:
            db.execute(
                text("SELECT setval(:sequence_name, 1, false)"),
                {"sequence_name": sequence},
            )
        else:
            db.execute(
                text("SELECT setval(:sequence_name, :value, true)"),
                {"sequence_name": sequence, "value": int(max_id)},
            )


def _export_database(db: Session) -> dict[str, Any]:
    tables: dict[str, list[dict[str, Any]]] = {}
    counts: dict[str, int] = {}

    for table_name, model in TABLES:
        rows = db.query(model).all()
        tables[table_name] = [_row_to_dict(row) for row in rows]
        counts[table_name] = len(rows)

    return {
        "backupType": "FleetDoc PostgreSQL Backup",
        "version": BACKUP_VERSION,
        "application": "FleetDoc",
        "database": "PostgreSQL",
        "exportedAt": datetime.now().astimezone().isoformat(),
        "tables": tables,
        "counts": counts,
    }


@router.get("/export")
def export_backup(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Export the complete FleetDoc database state as JSON."""
    try:
        backup = _export_database(db)
        return JSONResponse(content=backup)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to create database backup: {exc}",
        ) from exc


@router.post("/restore")
async def restore_backup(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Replace the current FleetDoc database with a validated backup.

    The operation is transactional: if any row fails validation or insertion,
    the transaction is rolled back and the existing database remains intact.
    """
    body = await request.body()
    if len(body) > MAX_BACKUP_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Backup file is too large. Maximum allowed size is {MAX_BACKUP_BYTES // (1024 * 1024)} MB.",
        )

    try:
        import json

        payload = json.loads(body.decode("utf-8"))
        payload = _validate_backup(payload)
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="Backup file is not valid UTF-8 JSON") from exc
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Backup file contains invalid JSON") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        # Delete children before parents to satisfy foreign keys.
        for table_name, model in reversed(TABLES):
            db.query(model).delete(synchronize_session=False)
        db.flush()

        restored_counts: dict[str, int] = {}

        for table_name, model in TABLES:
            mapper = inspect(model).mapper
            columns = {column.key: column for column in mapper.columns}
            rows = payload["tables"][table_name]

            for row in rows:
                values = {
                    key: _coerce_column_value(columns[key], value)
                    for key, value in row.items()
                }
                db.add(model(**values))

            restored_counts[table_name] = len(rows)
            db.flush()

        _reset_postgres_sequences(db)
        db.commit()

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Restore failed. No database changes were kept: {exc}",
        ) from exc

    return {
        "success": True,
        "message": "FleetDoc PostgreSQL database restored successfully.",
        "restoredAt": datetime.now().astimezone().isoformat(),
        "counts": restored_counts,
        "restoredBy": current_user.email,
    }
