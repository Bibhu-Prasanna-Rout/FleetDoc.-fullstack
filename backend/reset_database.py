from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.database_url)

tables = [
    "vehicles",
    "documents",
    "challans",
    "road_taxes",
    "settings",
    "loans",
    "emis",
    "users",
    "otp_requests",
    "notifications",
    "subscriptions",
    "audit_logs",
    "payments",
]

print("\n========================================")
print("   FLEETDOC DATABASE RESET")
print("========================================\n")

with engine.begin() as connection:
    table_list = ", ".join(f'"{table}"' for table in tables)

    print("Clearing all FleetDoc application data...")

    connection.execute(
        text(f"TRUNCATE TABLE {table_list} RESTART IDENTITY CASCADE")
    )

print("\n✅ Database reset completed successfully.")
print("✅ All old FleetDoc data has been removed.")
print("✅ Database tables and schema were preserved.")
print("✅ Alembic migration table was preserved.")
print("\nFresh FleetDoc database is ready.")