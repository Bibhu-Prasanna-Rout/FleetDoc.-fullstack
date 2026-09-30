from datetime import datetime

from app.core.config import settings


# Server-side source of truth for Premium pricing.
# Never trust the amount sent by the browser.
PLAN_PRICES = {
    "notification": 499.0,
    "reports": 799.0,
    "analytics": 999.0,
    "roles": 699.0,
    "security": 599.0,
    "api": 1499.0,
}


def razorpay_client():
    """Return a configured Razorpay client or raise a clear configuration error."""
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise RuntimeError(
            "Razorpay is not configured. Set RAZORPAY_KEY_ID and "
            "RAZORPAY_KEY_SECRET in the backend .env file."
        )

    import razorpay

    return razorpay.Client(
        auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
    )


def create_order(amount: float, currency: str = "INR", receipt: str = "fleetdoc"):
    """Create a real Razorpay order. There is intentionally no fake/dev payment fallback."""
    if currency != "INR":
        raise ValueError("Only INR payments are supported.")

    client = razorpay_client()
    return client.order.create(
        {
            "amount": int(round(amount * 100)),
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1,
        }
    )


def verify_payment(order_id: str, payment_id: str, signature: str):
    """Verify the Checkout signature using the server-side Razorpay secret."""
    client = razorpay_client()
    client.utility.verify_payment_signature(
        {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
    )
    return client


def utc_now():
    return datetime.now().astimezone()
