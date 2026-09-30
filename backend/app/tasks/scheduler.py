from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import SessionLocal
from app.models.models import User, Document, EMI, Challan, RoadTax
from app.services.notifications import dispatch

def scan():
    db=SessionLocal()
    try:
        # This scheduler intentionally uses date parsing conservatively because FleetDoc stores
        # user-facing dates in multiple formats. Existing page logic remains the display authority.
        for user in db.query(User).filter(User.status=="Active").all():
            for d in db.query(Document).all():
                if not d.expiry: continue
                try:
                    exp=datetime.strptime(d.expiry,"%d %b %Y")
                except ValueError:
                    try: exp=datetime.strptime(d.expiry,"%d %B %Y")
                    except ValueError: continue
                days=(exp.date()-datetime.now().date()).days
                if days in (10,7,3,1,0,-1):
                    dispatch(db,user,f"{d.type} reminder",f"{d.type} for vehicle {d.vehicle} is due on {d.expiry}.","Documents",["email","sms","whatsapp"])
    finally: db.close()

def start_scheduler():
    scheduler=BackgroundScheduler()
    scheduler.add_job(scan,"interval",hours=24,id="fleetdoc_notifications",replace_existing=True)
    scheduler.start()
    return scheduler
