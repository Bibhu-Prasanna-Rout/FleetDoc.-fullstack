# from datetime import datetime, timezone, timedelta
# from sqlalchemy.orm import Session
# from app.core.config import settings
# from app.core.security import hash_password
# from app.models.models import User, Vehicle, Document, EMI, Challan, RoadTax, Setting
# from app.data_seed import vehicles, documents, emis, challans, road_taxes

# def seed(db: Session):
#     if not db.query(User).filter(User.email==settings.admin_email.lower()).first():
#         db.add(User(name=settings.admin_name,email=settings.admin_email.lower(),password_hash=hash_password(settings.admin_password),role="Admin",status="Active",email_verified=True,phone_verified=False,permissions={}))
#     if db.query(Vehicle).count()==0:
#         for x in vehicles:
#             d=dict(x); d.pop("id",None); db.add(Vehicle(**d))
#     if db.query(Document).count()==0:
#         for x in documents:
#             d=dict(x); d.pop("id",None); db.add(Document(vehicle=d.pop("vehicle"),type=d.pop("type"),number=d.pop("number",None),start=d.pop("start",None),expiry=d.pop("expiry",None),amount=float(d.pop("amount",0) or 0),status=d.pop("status","Active"),data=d))
#     if db.query(EMI).count()==0:
#         for x in emis:
#             d=dict(x); d.pop("id",None); db.add(EMI(vehicle=d.pop("vehicle"),bank=d.pop("bank",None),due=d.pop("due"),amount=float(d.pop("amount",0) or 0),status=d.pop("status","Pending"),data=d))
#     if db.query(Challan).count()==0:
#         for x in challans:
#             d=dict(x); d.pop("id",None); db.add(Challan(vehicle=d.pop("vehicle"),challan_no=d.pop("challanNo",d.pop("challan",None)),date=d.pop("date",None),amount=float(d.pop("amount",0) or 0),status=d.pop("status","Pending"),reason=d.pop("reason",None),data=d))
#     if db.query(RoadTax).count()==0:
#         for x in road_taxes:
#             d=dict(x); d.pop("id",None); db.add(RoadTax(vehicle=d.pop("vehicle"),tax_type=d.pop("taxType",d.pop("type","Road Tax")),amount=float(d.pop("amount",0) or 0),start=d.pop("start",None),expiry=d.pop("expiry",None),status=d.pop("status","Active"),data=d))
#     if not db.query(Setting).filter(Setting.key=="global").first():
#         db.add(Setting(key="global",value={"companyName":"STEELS AND CARRIERS PRIVATE LIMITED","portalName":"TRANZOL","reminderDays":10,"emailNotifications":True,"smsNotifications":False,"whatsappNotifications":False,"inAppNotifications":True,"documentAlerts":True,"emiAlerts":True,"challanAlerts":True,"roadTaxAlerts":True,"timezone":"Asia/Kolkata","currency":"Indian Rupee (₹)","sessionTimeout":60}))
#     db.commit()




from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.models import (
    User,
    Vehicle,
    Document,
    EMI,
    Challan,
    RoadTax,
    Setting,
)
from app.data_seed import (
    vehicles,
    documents,
    emis,
    challans,
    road_taxes,
)


# ============================================================
# HELPERS
# ============================================================

def as_dict(value: Any) -> dict:
    """
    Safely convert a seed record into a dictionary.
    """
    if isinstance(value, dict):
        return dict(value)

    return {}


def pop_alias(data: dict, *keys, default=None):
    """
    Return the first available key and remove all aliases.

    Example:
        pop_alias(data, "challanNo", "number")
    """
    found = default

    for key in keys:
        if key in data:
            value = data.pop(key)

            if found == default:
                found = value

    return found


def to_float(value: Any, default: float = 0.0) -> float:
    """
    Safely convert a value to float.
    """
    if value is None or value == "":
        return default

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def clean_extra_data(data: dict, known_fields: set[str]) -> dict:
    """
    Store unsupported/frontend-only fields inside the JSON `data`
    column instead of passing them directly to SQLAlchemy.
    """
    existing_data = data.pop("data", None)

    if not isinstance(existing_data, dict):
        existing_data = {}

    extra = {
        key: value
        for key, value in data.items()
        if key not in known_fields
    }

    existing_data.update(extra)

    return existing_data


# ============================================================
# USER SEED
# ============================================================

def seed_admin_user(db: Session):
    """
    Create the default administrator if it does not exist.
    """

    email = settings.admin_email.lower().strip()

    existing = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing:
        return

    admin = User(
        name=settings.admin_name,
        email=email,
        password_hash=hash_password(settings.admin_password),
        role="Admin",
        status="Active",
        email_verified=True,
        phone_verified=False,
        permissions={},
    )

    db.add(admin)


# ============================================================
# VEHICLES
# ============================================================

def seed_vehicles(db: Session):
    """
    Seed vehicles from the existing frontend data.

    Frontend-only fields such as:
        documents
        emi

    are NOT passed to Vehicle because they are not database
    columns. They are preserved inside the JSON `data` field.
    """

    if db.query(Vehicle).count() > 0:
        return

    known_fields = {
        "number",
        "type",
        "owner",
        "brand",
        "model",
        "year",
        "status",
    }

    for item in vehicles:
        source = as_dict(item)

        # Remove frontend/mock ID.
        source.pop("id", None)

        # Keep frontend-only fields in data instead of passing
        # them as SQLAlchemy constructor arguments.
        extra_data = clean_extra_data(
            source,
            known_fields,
        )

        vehicle = Vehicle(
            number=str(source.pop("number", "")).strip(),
            type=str(source.pop("type", "Truck") or "Truck"),
            owner=source.pop("owner", None),
            brand=source.pop("brand", None),
            model=source.pop("model", None),
            year=source.pop("year", None),
            status=str(source.pop("status", "Active") or "Active"),
            data=extra_data,
        )

        # Don't create an empty vehicle number.
        if not vehicle.number:
            continue

        db.add(vehicle)


# ============================================================
# DOCUMENTS
# ============================================================

def seed_documents(db: Session):
    """
    Seed vehicle documents.

    Supports the existing frontend fields:
        vehicle
        type
        number
        start
        expiry
        amount
        status

    Any additional fields are stored in `data`.
    """

    if db.query(Document).count() > 0:
        return

    known_fields = {
        "vehicle",
        "type",
        "number",
        "start",
        "expiry",
        "amount",
        "status",
        "file_name",
        "file_url",
    }

    for item in documents:
        source = as_dict(item)

        source.pop("id", None)

        vehicle = pop_alias(
            source,
            "vehicle",
            "vehicleNo",
            "vehicleNumber",
            default="",
        )

        document_type = pop_alias(
            source,
            "type",
            "documentType",
            default="Other",
        )

        number = pop_alias(
            source,
            "number",
            "documentNumber",
            default=None,
        )

        start = pop_alias(
            source,
            "start",
            "startDate",
            default=None,
        )

        expiry = pop_alias(
            source,
            "expiry",
            "expiryDate",
            default=None,
        )

        amount = pop_alias(
            source,
            "amount",
            default=0,
        )

        status = pop_alias(
            source,
            "status",
            default="Active",
        )

        file_name = pop_alias(
            source,
            "file_name",
            "fileName",
            default=None,
        )

        file_url = pop_alias(
            source,
            "file_url",
            "fileUrl",
            default=None,
        )

        data = clean_extra_data(
            source,
            known_fields,
        )

        if not vehicle:
            continue

        document = Document(
            vehicle=str(vehicle),
            type=str(document_type or "Other"),
            number=str(number) if number is not None else None,
            start=str(start) if start is not None else None,
            expiry=str(expiry) if expiry is not None else None,
            amount=to_float(amount),
            status=str(status or "Active"),
            file_name=file_name,
            file_url=file_url,
            data=data,
        )

        db.add(document)


# ============================================================
# EMI
# ============================================================

def seed_emis(db: Session):
    """
    Seed EMI records.

    Existing frontend data:
        vehicle
        bank
        due
        amount
        status

    Additional fields are preserved inside data.
    """

    if db.query(EMI).count() > 0:
        return

    known_fields = {
        "vehicle",
        "bank",
        "due",
        "amount",
        "status",
        "loan_id",
        "paid_date",
    }

    for item in emis:
        source = as_dict(item)

        source.pop("id", None)

        vehicle = pop_alias(
            source,
            "vehicle",
            "vehicleNo",
            "vehicleNumber",
            default="",
        )

        bank = pop_alias(
            source,
            "bank",
            "bankName",
            default=None,
        )

        due = pop_alias(
            source,
            "due",
            "dueDate",
            default="",
        )

        amount = pop_alias(
            source,
            "amount",
            "emiAmount",
            default=0,
        )

        status = pop_alias(
            source,
            "status",
            default="Pending",
        )

        loan_id = pop_alias(
            source,
            "loan_id",
            "loanId",
            default=None,
        )

        paid_date = pop_alias(
            source,
            "paid_date",
            "paidDate",
            default=None,
        )

        data = clean_extra_data(
            source,
            known_fields,
        )

        if not vehicle:
            continue

        if not due:
            continue

        emi = EMI(
            loan_id=loan_id,
            vehicle=str(vehicle),
            bank=str(bank) if bank is not None else None,
            due=str(due),
            amount=to_float(amount),
            status=str(status or "Pending"),
            paid_date=(
                str(paid_date)
                if paid_date is not None
                else None
            ),
            data=data,
        )

        db.add(emi)


# ============================================================
# CHALLANS
# ============================================================

def seed_challans(db: Session):
    """
    Seed challans.

    Frontend uses:
        number
        type
        due

    Backend expects:
        challan_no
        reason
        date

    Therefore:
        number -> challan_no
        type   -> reason
        due    -> date
    """

    if db.query(Challan).count() > 0:
        return

    known_fields = {
        "vehicle",
        "challan_no",
        "date",
        "amount",
        "status",
        "reason",
        "payment_date",
    }

    for item in challans:
        source = as_dict(item)

        source.pop("id", None)

        vehicle = pop_alias(
            source,
            "vehicle",
            "vehicleNo",
            "vehicleNumber",
            default="",
        )

        challan_no = pop_alias(
            source,
            "challan_no",
            "challanNo",
            "challan",
            "number",
            default=None,
        )

        # Existing frontend seed uses `due`.
        # Backend has a `date` field, so use due as date
        # and preserve original values in data.
        date = pop_alias(
            source,
            "date",
            "due",
            "challanDate",
            default=None,
        )

        amount = pop_alias(
            source,
            "amount",
            "fineAmount",
            default=0,
        )

        status = pop_alias(
            source,
            "status",
            default="Pending",
        )

        reason = pop_alias(
            source,
            "reason",
            "type",
            "violationType",
            default=None,
        )

        payment_date = pop_alias(
            source,
            "payment_date",
            "paymentDate",
            default=None,
        )

        data = clean_extra_data(
            source,
            known_fields,
        )

        if not vehicle:
            continue

        challan = Challan(
            vehicle=str(vehicle),
            challan_no=(
                str(challan_no)
                if challan_no is not None
                else None
            ),
            date=(
                str(date)
                if date is not None
                else None
            ),
            amount=to_float(amount),
            status=str(status or "Pending"),
            reason=(
                str(reason)
                if reason is not None
                else None
            ),
            payment_date=(
                str(payment_date)
                if payment_date is not None
                else None
            ),
            data=data,
        )

        db.add(challan)


# ============================================================
# ROAD TAX
# ============================================================

def seed_road_taxes(db: Session):
    """
    Seed road tax / M.V. tax records.

    Supports:
        taxType
        type
        tax_type
        vehicle
        amount
        start
        expiry
        status
    """

    if db.query(RoadTax).count() > 0:
        return

    known_fields = {
        "vehicle",
        "tax_type",
        "amount",
        "start",
        "expiry",
        "status",
    }

    for item in road_taxes:
        source = as_dict(item)

        source.pop("id", None)

        vehicle = pop_alias(
            source,
            "vehicle",
            "vehicleNo",
            "vehicleNumber",
            default="",
        )

        tax_type = pop_alias(
            source,
            "tax_type",
            "taxType",
            "type",
            default="Road Tax",
        )

        amount = pop_alias(
            source,
            "amount",
            "taxAmount",
            default=0,
        )

        start = pop_alias(
            source,
            "start",
            "startDate",
            default=None,
        )

        expiry = pop_alias(
            source,
            "expiry",
            "expiryDate",
            "due",
            default=None,
        )

        status = pop_alias(
            source,
            "status",
            default="Active",
        )

        data = clean_extra_data(
            source,
            known_fields,
        )

        if not vehicle:
            continue

        road_tax = RoadTax(
            vehicle=str(vehicle),
            tax_type=str(tax_type or "Road Tax"),
            amount=to_float(amount),
            start=(
                str(start)
                if start is not None
                else None
            ),
            expiry=(
                str(expiry)
                if expiry is not None
                else None
            ),
            status=str(status or "Active"),
            data=data,
        )

        db.add(road_tax)


# ============================================================
# SETTINGS
# ============================================================

def seed_settings(db: Session):
    """
    Create the initial global FleetDoc/TRANZOL settings.

    Existing settings are not overwritten.
    """

    existing = (
        db.query(Setting)
        .filter(Setting.key == "global")
        .first()
    )

    if existing:
        return

    default_settings = {
        # Branding
        "companyName": "STEELS AND CARRIERS PRIVATE LIMITED",
        "portalName": "TRANZOL",

        # Reminder configuration
        "reminderDays": 10,

        # Notifications
        "dashboardNotifications": True,
        "emailNotifications": True,
        "smsNotifications": False,
        "whatsappNotifications": False,
        "inAppNotifications": True,

        # Alert modules
        "documentAlerts": True,
        "emiAlerts": True,
        "challanAlerts": True,
        "roadTaxAlerts": True,

        # Regional settings
        "dateFormat": "DD MMM YYYY",
        "currency": "Indian Rupee (₹)",
        "timezone": "Asia/Kolkata",

        # Session
        "sessionTimeout": 60,

        # Dynamic role permissions.
        # Admin can configure these later from Settings.
        "rolePermissions": {},
    }

    db.add(
        Setting(
            key="global",
            value=default_settings,
        )
    )


# # ============================================================
# # MAIN SEED FUNCTION
# # ============================================================

# def seed(db: Session):
#     """
#     Main database seed function.

#     The order is intentional:

#         1. Admin user
#         2. Vehicles
#         3. Documents
#         4. EMI
#         5. Challans
#         6. Road Tax
#         7. Settings
#     """

#     try:
#         # ----------------------------------------------------
#         # ADMIN
#         # ----------------------------------------------------
#         seed_admin_user(db)

#         # ----------------------------------------------------
#         # FLEET DATA
#         # ----------------------------------------------------
#         seed_vehicles(db)
#         seed_documents(db)
#         seed_emis(db)
#         seed_challans(db)
#         seed_road_taxes(db)

#         # ----------------------------------------------------
#         # SETTINGS
#         # ----------------------------------------------------
#         seed_settings(db)

#         # ----------------------------------------------------
#         # SAVE EVERYTHING
#         # ----------------------------------------------------
#         db.commit()

#     except Exception:
#         # Important:
#         # If any seed operation fails, rollback the transaction
#         # so the SQLAlchemy Session is usable again.
#         db.rollback()
#         raise

# ============================================================
# MAIN SEED FUNCTION
# ============================================================

def seed(db: Session):
    """
    Initialize a fresh FleetDoc database.

    Only the default Admin account and application settings
    are created automatically.

    No demo fleet or financial data is inserted.
    """

    try:
        # ----------------------------------------------------
        # ADMIN
        # ----------------------------------------------------
        seed_admin_user(db)

        # ----------------------------------------------------
        # DEFAULT SETTINGS
        # ----------------------------------------------------
        seed_settings(db)

        # ----------------------------------------------------
        # DEMO DATA DISABLED
        # ----------------------------------------------------
        # These functions intentionally remain available in
        # seed.py, but are NOT executed automatically.
        #
        # seed_vehicles(db)
        # seed_documents(db)
        # seed_emis(db)
        # seed_challans(db)
        # seed_road_taxes(db)

        # ----------------------------------------------------
        # SAVE
        # ----------------------------------------------------
        db.commit()

    except Exception:
        db.rollback()
        raise