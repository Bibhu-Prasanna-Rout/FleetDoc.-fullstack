from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.models import Notification, Subscription, User
from app.services.messaging import send_email, send_sms, send_whatsapp

PREMIUM_PLANS={"notification":499,"reports":799,"analytics":999,"roles":699}

def premium_active(db: Session, user_id: int, plan_id="notification"):
    now=datetime.now(timezone.utc)
    s=db.query(Subscription).filter(Subscription.user_id==user_id, Subscription.plan_id==plan_id, Subscription.status=="active").order_by(Subscription.expires_at.desc()).first()
    return bool(s and (s.expires_at is None or s.expires_at >= now))

def create_in_app(db, user_id, title, message, type="System", reference_id=None):
    n=Notification(user_id=user_id,title=title,message=message,type=type,channel="in_app",status="unread",reference_id=reference_id)
    db.add(n); return n

def dispatch(db: Session, user: User, title: str, message: str, type="System", channels=None):
    channels=channels or ["in_app"]
    create_in_app(db,user.id,title,message,type)
    premium=premium_active(db,user.id)
    for ch in channels:
        if ch in ("email","sms","whatsapp") and not premium:
            continue
        try:
            if ch=="email" and user.email:
                send_email(user.email,title,message)
            elif ch=="sms" and user.phone:
                send_sms(user.phone,message)
            elif ch=="whatsapp" and user.phone:
                send_whatsapp(user.phone,message)
        except Exception as exc:
            print("Notification delivery failed:", exc)
    db.commit()
