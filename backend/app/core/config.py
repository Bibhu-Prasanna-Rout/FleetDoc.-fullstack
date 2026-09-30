# from datetime import datetime

# from app.core.config import settings


# # Server-side source of truth for Premium pricing.
# # Never trust the amount sent by the browser.
# PLAN_PRICES = {
#     "notification": 499.0,
#     "reports": 799.0,
#     "analytics": 999.0,
#     "roles": 699.0,
#     "security": 599.0,
#     "api": 1499.0,
# }


# def razorpay_client():
#     """Return a configured Razorpay client or raise a clear configuration error."""
#     if not settings.razorpay_key_id or not settings.razorpay_key_secret:
#         raise RuntimeError(
#             "Razorpay is not configured. Set RAZORPAY_KEY_ID and "
#             "RAZORPAY_KEY_SECRET in the backend .env file."
#         )

#     import razorpay

#     return razorpay.Client(
#         auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
#     )


# def create_order(amount: float, currency: str = "INR", receipt: str = "fleetdoc"):
#     """Create a real Razorpay order. There is intentionally no fake/dev payment fallback."""
#     if currency != "INR":
#         raise ValueError("Only INR payments are supported.")

#     client = razorpay_client()
#     # Razorpay's current Orders API requires amount/currency and accepts receipt.
#     # Payment capture should be controlled by the Razorpay Dashboard capture setting.
#     return client.order.create(
#         {
#             "amount": int(round(amount * 100)),
#             "currency": currency,
#             "receipt": receipt,
#         }
#     )


# def verify_payment(order_id: str, payment_id: str, signature: str):
#     """Verify the Checkout signature using the server-side Razorpay secret."""
#     client = razorpay_client()
#     client.utility.verify_payment_signature(
#         {
#             "razorpay_order_id": order_id,
#             "razorpay_payment_id": payment_id,
#             "razorpay_signature": signature,
#         }
#     )
#     return client


# def utc_now():
#     return datetime.now().astimezone()





from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


# ========================================================
# BACKEND ROOT
# ========================================================

# config.py:
# backend/app/core/config.py
#
# parents[0] = core
# parents[1] = app
# parents[2] = backend

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    # ========================================================
    # APPLICATION
    # ========================================================

    app_name: str = "FleetDoc API"
    environment: str = "development"

    # ========================================================
    # SECURITY / JWT
    # ========================================================

    secret_key: str = "change-me"

    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    # ========================================================
    # DATABASE
    # ========================================================

    database_url: str = "sqlite:///./fleetdoc.db"

    # ========================================================
    # CORS
    # ========================================================

    cors_origins: str = "http://localhost:5173"

    # ========================================================
    # FILE UPLOAD
    # ========================================================

    upload_dir: str = "uploads"
    max_upload_mb: int = 5

    # ========================================================
    # ADMIN
    # ========================================================

    admin_name: str = "FleetDoc Admin"
    admin_email: str = "admin@fleetdoc.com"
    admin_password: str = "Admin@123"

    # ========================================================
    # OTP
    # ========================================================

    otp_expire_minutes: int = 5
    otp_resend_seconds: int = 60
    password_reset_otp_expire_minutes: int = 3

    dev_return_otp: bool = False

    dev_email_console: bool = False
    dev_sms_console: bool = False
    dev_whatsapp_console: bool = False

    # ========================================================
    # SMTP / EMAIL
    # ========================================================

    smtp_host: str = ""
    smtp_port: int = 587

    smtp_username: str = ""
    smtp_password: str = ""

    smtp_from_email: str = ""

    smtp_use_tls: bool = True

    # ========================================================
    # SMS
    # ========================================================

    sms_provider: str = ""

    # ========================================================
    # TWILIO
    # ========================================================

    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""

    # ========================================================
    # MSG91
    # ========================================================

    msg91_auth_key: str = ""
    msg91_template_id: str = ""

    # ========================================================
    # WHATSAPP
    # ========================================================

    whatsapp_enabled: bool = False

    meta_graph_url: str = "https://graph.facebook.com/v22.0"

    whatsapp_access_token: str = ""
    whatsapp_phone_number_id: str = ""
    whatsapp_template_name: str = ""

    # ========================================================
    # RAZORPAY
    # ========================================================

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    # ========================================================
    # SCHEDULER
    # ========================================================

    scheduler_enabled: bool = True

    # ========================================================
    # PYDANTIC SETTINGS
    # ========================================================

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        case_sensitive=False,
        extra="ignore",
    )

    # ========================================================
    # CORS LIST
    # ========================================================

    @property
    def cors_list(self) -> List[str]:
        return [
            x.strip()
            for x in self.cors_origins.split(",")
            if x.strip()
        ]


settings = Settings()