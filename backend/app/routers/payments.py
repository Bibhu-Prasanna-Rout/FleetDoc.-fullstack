from datetime import datetime, timezone, timedelta
from secrets import token_hex
import hashlib
import hmac

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import Subscription, Payment
from app.schemas.schemas import SubscriptionOrder, PaymentVerify
from app.services.payments import (
    PLAN_PRICES,
    create_order,
    verify_payment,
    razorpay_client,
)

router = APIRouter(prefix="/api/v1/payments", tags=["Premium & Payments"])


@router.get("/plans")
def plans():
    return [
        {"id": plan_id, "price": price, "currency": "INR", "billing": "month"}
        for plan_id, price in PLAN_PRICES.items()
    ]


@router.post("/create-order")
def order(
    payload: SubscriptionOrder,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    expected = PLAN_PRICES.get(payload.plan_id)
    if expected is None:
        raise HTTPException(status_code=400, detail="Unknown plan")

    # The browser may display the plan amount, but the backend is authoritative.
    # Do not trust a client-supplied price.
    if payload.currency != "INR":
        raise HTTPException(status_code=400, detail="Only INR payments are supported")

    try:
        receipt = (
            f"fd_{user.id}_{payload.plan_id}_{int(datetime.now(timezone.utc).timestamp())}_{token_hex(4)}"
        )
        razorpay_order = create_order(expected, "INR", receipt)
    except Exception as exc:
        # Keep the browser response generic, but log the real Razorpay error
        # in the backend terminal so configuration/API problems are diagnosable.
        print(
            f"[RAZORPAY CREATE ORDER ERROR] "
            f"{type(exc).__name__}: {exc}"
        )
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to create Razorpay order. "
                "Check the backend terminal for the exact Razorpay error."
            ),
        ) from exc

    subscription = Subscription(
        user_id=user.id,
        plan_id=payload.plan_id,
        status="pending",
        amount=expected,
        currency="INR",
        gateway="razorpay",
        gateway_order_id=razorpay_order["id"],
    )
    db.add(subscription)
    db.flush()

    payment = Payment(
        user_id=user.id,
        subscription_id=subscription.id,
        provider="razorpay",
        order_id=razorpay_order["id"],
        amount=expected,
        currency="INR",
        status="created",
        data=razorpay_order,
    )
    db.add(payment)
    db.commit()

    return {
        "order": razorpay_order,
        "subscriptionId": subscription.id,
        "keyId": settings.razorpay_key_id,
    }


@router.post("/verify")
def verify(
    payload: PaymentVerify,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    subscription = db.get(Subscription, payload.subscription_id)
    if not subscription or subscription.user_id != user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")

    payment = (
        db.query(Payment)
        .filter(Payment.subscription_id == subscription.id)
        .order_by(Payment.id.desc())
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    # The order/payment IDs must belong to the trusted server-side order we created.
    if payment.order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=400, detail="Payment order mismatch")
    if subscription.gateway_order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=400, detail="Subscription order mismatch")

    try:
        client = verify_payment(
            payload.razorpay_order_id,
            payload.razorpay_payment_id,
            payload.razorpay_signature,
        )

        # Confirm the payment belongs to this order and has the expected amount.
        razorpay_payment = client.payment.fetch(payload.razorpay_payment_id)
        expected_paise = int(round(float(subscription.amount) * 100))
        actual_paise = int(razorpay_payment.get("amount", 0))
        actual_order_id = razorpay_payment.get("order_id")

        if actual_order_id != payload.razorpay_order_id:
            raise HTTPException(status_code=400, detail="Payment order mismatch")
        if actual_paise != expected_paise:
            raise HTTPException(status_code=400, detail="Payment amount mismatch")
        if razorpay_payment.get("currency") != subscription.currency:
            raise HTTPException(status_code=400, detail="Payment currency mismatch")
        if razorpay_payment.get("status") not in {"captured", "authorized"}:
            raise HTTPException(status_code=400, detail="Payment is not successful")

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Payment signature or payment verification failed",
        ) from exc

    now = datetime.now(timezone.utc)
    subscription.status = "active"
    subscription.started_at = now
    subscription.expires_at = now + timedelta(days=30)
    subscription.gateway_payment_id = payload.razorpay_payment_id

    payment.status = "paid"
    payment.payment_id = payload.razorpay_payment_id
    payment.data = {
        **(payment.data or {}),
        "razorpay_payment_id": payload.razorpay_payment_id,
    }

    db.commit()

    return {
        "message": "Premium activated",
        "subscription": {
            "id": subscription.id,
            "planId": subscription.plan_id,
            "status": subscription.status,
            "expiresAt": subscription.expires_at.isoformat(),
        },
    }


@router.get("/subscriptions")
def subscriptions(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Return subscription history with real Razorpay transaction identifiers."""
    rows = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id)
        .order_by(Subscription.id.desc())
        .all()
    )

    result = []
    for subscription in rows:
        payment = (
            db.query(Payment)
            .filter(Payment.subscription_id == subscription.id)
            .order_by(Payment.id.desc())
            .first()
        )

        payment_data = payment.data if payment and isinstance(payment.data, dict) else {}
        subscription_data = (
            subscription.data
            if isinstance(subscription.data, dict)
            else {}
        )

        order_id = (
            subscription.gateway_order_id
            or payment_data.get("razorpay_order_id")
            or (payment.order_id if payment else None)
            or subscription_data.get("razorpayOrderId")
        )

        payment_id = (
            subscription.gateway_payment_id
            or payment_data.get("razorpay_payment_id")
            or (payment.payment_id if payment else None)
            or subscription_data.get("razorpayPaymentId")
        )

        payment_method = (
            subscription_data.get("paymentMethod")
            or payment_data.get("payment_method")
            or None
        )

        result.append({
            "id": subscription.id,
            "planId": subscription.plan_id,
            "status": subscription.status,
            "amount": subscription.amount,
            "currency": subscription.currency,
            "gateway": subscription.gateway,
            "gatewayOrderId": order_id,
            "gatewayPaymentId": payment_id,
            "paymentMethod": payment_method,
            "startedAt": subscription.started_at.isoformat()
            if subscription.started_at
            else None,
            "expiresAt": subscription.expires_at.isoformat()
            if subscription.expires_at
            else None,
        })

    return result


@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Process Razorpay payment events after validating the webhook signature."""
    if not settings.razorpay_webhook_secret:
        raise HTTPException(
            status_code=503,
            detail="Razorpay webhook secret is not configured",
        )

    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    expected = hmac.new(
        settings.razorpay_webhook_secret.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()
    if not signature or not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    event = payload.get("event", "")

    if event == "payment.captured":
        entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = entity.get("order_id")
        payment_id = entity.get("id")
    elif event == "order.paid":
        entity = payload.get("payload", {}).get("order", {}).get("entity", {})
        order_id = entity.get("id")
        payment_entities = (
            payload.get("payload", {}).get("order", {}).get("entity", {}).get("payments", {})
        )
        items = payment_entities.get("items", []) if isinstance(payment_entities, dict) else []
        payment_id = items[0].get("id") if items else None
    else:
        return {"received": True}

    if not order_id:
        return {"received": True}

    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order_id)
        .order_by(Payment.id.desc())
        .first()
    )
    if not payment:
        return {"received": True}

    # Idempotent webhook handling: don't recreate/extend an already-active subscription.
    if payment.status != "paid":
        payment.status = "paid"
        if payment_id:
            payment.payment_id = payment_id

        subscription = db.get(Subscription, payment.subscription_id)
        if subscription and subscription.status != "active":
            now = datetime.now(timezone.utc)
            subscription.status = "active"
            subscription.started_at = now
            subscription.expires_at = now + timedelta(days=30)
            if payment_id:
                subscription.gateway_payment_id = payment_id

        db.commit()

    return {"received": True}
