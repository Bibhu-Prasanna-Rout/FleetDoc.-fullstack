# import smtplib, hashlib
# from email.message import EmailMessage
# import httpx
# from app.core.config import settings

# def otp_digest(otp: str) -> str:
#     return hashlib.sha256((otp + settings.secret_key).encode()).hexdigest()

# def send_email(to: str, subject: str, body: str):
#     if not settings.smtp_host:
#         print(f"[DEV EMAIL] to={to} subject={subject}\n{body}")
#         return {"provider":"console","status":"sent"}
#     msg=EmailMessage()
#     msg["From"]=settings.smtp_from_email or settings.smtp_username
#     msg["To"]=to
#     msg["Subject"]=subject
#     msg.set_content(body)
#     with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
#         if settings.smtp_use_tls: smtp.starttls()
#         if settings.smtp_username: smtp.login(settings.smtp_username, settings.smtp_password)
#         smtp.send_message(msg)
#     return {"provider":"smtp","status":"sent"}

# def send_sms(to: str, message: str):
#     if settings.sms_provider == "twilio" and settings.twilio_account_sid:
#         url=f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
#         r=httpx.post(url,data={"From":settings.twilio_from_number,"To":to,"Body":message},auth=(settings.twilio_account_sid,settings.twilio_auth_token),timeout=20)
#         r.raise_for_status()
#         return {"provider":"twilio","status":"sent"}
#     if settings.sms_provider == "msg91" and settings.msg91_auth_key:
#         r=httpx.post("https://control.msg91.com/api/v5/flow/",headers={"authkey":settings.msg91_auth_key,"Content-Type":"application/json"},json={"template_id":settings.msg91_template_id,"short_url":"0","recipients":[{"mobiles":to,"VAR1":message}]},timeout=20)
#         r.raise_for_status()
#         return {"provider":"msg91","status":"sent"}
#     print(f"[DEV SMS] to={to} message={message}")
#     return {"provider":"console","status":"sent"}

# def send_whatsapp(to: str, message: str):
#     if not settings.whatsapp_enabled or not settings.whatsapp_access_token or not settings.whatsapp_phone_number_id:
#         print(f"[DEV WHATSAPP] to={to} message={message}")
#         return {"provider":"console","status":"sent"}
#     url=f"{settings.meta_graph_url}/{settings.whatsapp_phone_number_id}/messages"
#     payload={"messaging_product":"whatsapp","to":to,"type":"template","template":{"name":settings.whatsapp_template_name,"language":{"code":"en_US"},"components":[{"type":"body","parameters":[{"type":"text","text":message}]}]}}
#     r=httpx.post(url,headers={"Authorization":f"Bearer {settings.whatsapp_access_token}"},json=payload,timeout=20)
#     r.raise_for_status()
#     return {"provider":"meta-whatsapp","status":"sent"}







import hashlib
import re
import smtplib
from email.message import EmailMessage

import httpx

from app.core.config import settings


# ============================================================
# OTP HASH
# ============================================================

def otp_digest(otp: str) -> str:
    """
    Store only a hashed OTP in the database.
    """
    return hashlib.sha256(
        (str(otp) + settings.secret_key).encode("utf-8")
    ).hexdigest()


# ============================================================
# PHONE NORMALIZATION
# ============================================================

def normalize_phone(phone: str | None) -> str | None:
    """
    Normalize an Indian phone number.

    Examples:
        9876543210
        919876543210
        +91 98765 43210
        +91-98765-43210

    Internal result:
        919876543210
    """

    if not phone:
        return None

    digits = re.sub(r"\D", "", str(phone))

    if not digits:
        return None

    # 10 digit Indian number
    if len(digits) == 10:
        return f"91{digits}"

    # 11 digit number beginning with 0
    if len(digits) == 11 and digits.startswith("0"):
        return f"91{digits[1:]}"

    # Already contains India country code
    if len(digits) == 12 and digits.startswith("91"):
        return digits

    return digits


def sms_destination(phone: str | None) -> str | None:
    """
    Return the phone number in international format for SMS providers.
    """

    normalized = normalize_phone(phone)

    if not normalized:
        return None

    if normalized.startswith("+"):
        return normalized

    if normalized.startswith("91") and len(normalized) == 12:
        return f"+{normalized}"

    return f"+{normalized}"


# ============================================================
# EMAIL
# ============================================================

def send_email(
    to: str,
    subject: str,
    body: str,
):
    """
    Send an email using configured SMTP.

    Production behavior:
        SMTP must be configured.

    Development behavior:
        If SMTP is disabled and DEV_EMAIL_CONSOLE is enabled,
        the OTP is printed to the backend terminal.
    """

    recipient = str(to or "").strip().lower()

    if not recipient:
        raise RuntimeError("Email recipient is required")

    smtp_host = str(getattr(settings, "smtp_host", "") or "").strip()

    # --------------------------------------------------------
    # SMTP NOT CONFIGURED
    # --------------------------------------------------------

    if not smtp_host:
        dev_console = bool(
            getattr(settings, "dev_email_console", False)
        )

        if dev_console:
            print(
                "\n"
                "==================================================\n"
                "[DEV EMAIL]\n"
                f"To      : {recipient}\n"
                f"Subject : {subject}\n"
                f"Message :\n{body}\n"
                "==================================================\n"
            )

            return {
                "provider": "console",
                "status": "sent",
            }

        raise RuntimeError(
            "Email service is not configured. "
            "Configure SMTP settings before sending OTP."
        )

    # --------------------------------------------------------
    # SMTP CONFIGURATION
    # --------------------------------------------------------

    smtp_port = int(
        getattr(settings, "smtp_port", 587) or 587
    )

    smtp_username = (
        str(getattr(settings, "smtp_username", "") or "").strip()
    )

    smtp_password = (
        str(getattr(settings, "smtp_password", "") or "")
    )

    smtp_from_email = (
        str(
            getattr(settings, "smtp_from_email", "")
            or smtp_username
            or ""
        ).strip()
    )

    smtp_use_tls = bool(
        getattr(settings, "smtp_use_tls", True)
    )

    if not smtp_from_email:
        raise RuntimeError(
            "SMTP_FROM_EMAIL or SMTP_USERNAME must be configured."
        )

    msg = EmailMessage()
    msg["From"] = smtp_from_email
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        with smtplib.SMTP(
            smtp_host,
            smtp_port,
            timeout=30,
        ) as smtp:

            smtp.ehlo()

            if smtp_use_tls:
                smtp.starttls()
                smtp.ehlo()

            if smtp_username:
                smtp.login(
                    smtp_username,
                    smtp_password,
                )

            smtp.send_message(msg)

    except Exception as exc:
        print(
            f"[SMTP ERROR] Unable to send email to "
            f"{recipient}: {exc}"
        )

        raise RuntimeError(
            "Unable to send OTP email. "
            "Please check the SMTP configuration."
        ) from exc

    return {
        "provider": "smtp",
        "status": "sent",
    }


# ============================================================
# SMS
# ============================================================

def send_sms(
    to: str,
    message: str,
):
    """
    Send SMS using Twilio or MSG91.
    """

    destination = sms_destination(to)

    if not destination:
        raise RuntimeError(
            "A valid phone number is required."
        )

    provider = str(
        getattr(settings, "sms_provider", "") or ""
    ).strip().lower()

    # ========================================================
    # TWILIO
    # ========================================================

    if provider == "twilio":

        account_sid = str(
            getattr(
                settings,
                "twilio_account_sid",
                "",
            )
            or ""
        ).strip()

        auth_token = str(
            getattr(
                settings,
                "twilio_auth_token",
                "",
            )
            or ""
        ).strip()

        from_number = str(
            getattr(
                settings,
                "twilio_from_number",
                "",
            )
            or ""
        ).strip()

        if not account_sid:
            raise RuntimeError(
                "TWILIO_ACCOUNT_SID is not configured."
            )

        if not auth_token:
            raise RuntimeError(
                "TWILIO_AUTH_TOKEN is not configured."
            )

        if not from_number:
            raise RuntimeError(
                "TWILIO_FROM_NUMBER is not configured."
            )

        url = (
            "https://api.twilio.com/2010-04-01/"
            f"Accounts/{account_sid}/Messages.json"
        )

        try:
            response = httpx.post(
                url,
                data={
                    "From": from_number,
                    "To": destination,
                    "Body": message,
                },
                auth=(
                    account_sid,
                    auth_token,
                ),
                timeout=30,
            )

            response.raise_for_status()

        except Exception as exc:
            print(
                f"[TWILIO ERROR] Unable to send SMS "
                f"to {destination}: {exc}"
            )

            raise RuntimeError(
                "Unable to send SMS. "
                "Please check the Twilio configuration."
            ) from exc

        return {
            "provider": "twilio",
            "status": "sent",
        }

    # ========================================================
    # MSG91
    # ========================================================

    if provider == "msg91":

        auth_key = str(
            getattr(
                settings,
                "msg91_auth_key",
                "",
            )
            or ""
        ).strip()

        template_id = str(
            getattr(
                settings,
                "msg91_template_id",
                "",
            )
            or ""
        ).strip()

        if not auth_key:
            raise RuntimeError(
                "MSG91_AUTH_KEY is not configured."
            )

        if not template_id:
            raise RuntimeError(
                "MSG91_TEMPLATE_ID is not configured."
            )

        url = "https://control.msg91.com/api/v5/flow/"

        payload = {
            "template_id": template_id,
            "short_url": "0",
            "recipients": [
                {
                    "mobiles": destination,
                    "VAR1": message,
                }
            ],
        }

        try:
            response = httpx.post(
                url,
                headers={
                    "authkey": auth_key,
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=30,
            )

            response.raise_for_status()

        except Exception as exc:
            print(
                f"[MSG91 ERROR] Unable to send SMS "
                f"to {destination}: {exc}"
            )

            raise RuntimeError(
                "Unable to send SMS. "
                "Please check the MSG91 configuration."
            ) from exc

        return {
            "provider": "msg91",
            "status": "sent",
        }

    # ========================================================
    # DEVELOPMENT CONSOLE
    # ========================================================

    dev_console = bool(
        getattr(settings, "dev_sms_console", False)
    )

    if dev_console:
        print(
            "\n"
            "==================================================\n"
            "[DEV SMS]\n"
            f"To      : {destination}\n"
            f"Message : {message}\n"
            "==================================================\n"
        )

        return {
            "provider": "console",
            "status": "sent",
        }

    raise RuntimeError(
        "SMS service is not configured. "
        "Configure Twilio or MSG91 before sending OTP."
    )


# ============================================================
# WHATSAPP
# ============================================================

def send_whatsapp(
    to: str,
    message: str,
):
    """
    Send WhatsApp message through Meta WhatsApp Cloud API.
    """

    enabled = bool(
        getattr(
            settings,
            "whatsapp_enabled",
            False,
        )
    )

    access_token = str(
        getattr(
            settings,
            "whatsapp_access_token",
            "",
        )
        or ""
    ).strip()

    phone_number_id = str(
        getattr(
            settings,
            "whatsapp_phone_number_id",
            "",
        )
        or ""
    ).strip()

    if not enabled or not access_token or not phone_number_id:

        dev_console = bool(
            getattr(
                settings,
                "dev_whatsapp_console",
                False,
            )
        )

        if dev_console:
            print(
                f"[DEV WHATSAPP] "
                f"to={to} message={message}"
            )

            return {
                "provider": "console",
                "status": "sent",
            }

        raise RuntimeError(
            "WhatsApp service is not configured."
        )

    graph_url = str(
        getattr(
            settings,
            "meta_graph_url",
            "https://graph.facebook.com/v20.0",
        )
    ).rstrip("/")

    template_name = str(
        getattr(
            settings,
            "whatsapp_template_name",
            "",
        )
        or ""
    ).strip()

    if not template_name:
        raise RuntimeError(
            "WHATSAPP_TEMPLATE_NAME is not configured."
        )

    destination = sms_destination(to)

    url = (
        f"{graph_url}/"
        f"{phone_number_id}/messages"
    )

    payload = {
        "messaging_product": "whatsapp",
        "to": destination,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": "en_US",
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": message,
                        }
                    ],
                }
            ],
        },
    }

    try:
        response = httpx.post(
            url,
            headers={
                "Authorization": (
                    f"Bearer {access_token}"
                ),
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )

        response.raise_for_status()

    except Exception as exc:
        raise RuntimeError(
            "Unable to send WhatsApp message."
        ) from exc

    return {
        "provider": "meta-whatsapp",
        "status": "sent",
    }