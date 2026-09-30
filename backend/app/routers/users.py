# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from datetime import datetime, timezone, timedelta
# from app.core.database import get_db
# from app.core.dependencies import get_current_user, require_admin
# from app.core.security import hash_password, generate_otp
# from app.models.models import User, OTPRequest, AuditLog
# from app.schemas.schemas import UserCreate, UserUpdate, OTPVerify, OTPRequestIn, PermissionUpdate
# from app.services.messaging import otp_digest, send_email, send_sms
# from app.core.config import settings
# from app.utils.serialize import user_out

# router=APIRouter(prefix="/api/v1/users",tags=["Users"])

# @router.get("")
# def list_users(db: Session=Depends(get_db), user=Depends(get_current_user)):
#     return [user_out(x) for x in db.query(User).order_by(User.id.desc()).all()]

# @router.post("")
# def create_user(p: UserCreate, db: Session=Depends(get_db), admin=Depends(require_admin)):
#     if db.query(User).filter(User.email==p.email.lower()).first(): raise HTTPException(409,"Email already registered")
#     if p.phone and db.query(User).filter(User.phone==p.phone).first(): raise HTTPException(409,"Phone already registered")
#     u=User(name=p.name,email=p.email.lower(),phone=p.phone,password_hash=hash_password(p.password),role=p.role,status=p.status,photo=p.photo,permissions=p.permissions or {})
#     db.add(u); db.commit(); db.refresh(u)
#     return user_out(u)

# @router.patch("/{user_id}")
# def update_user(user_id:int,p:UserUpdate,db:Session=Depends(get_db),admin=Depends(require_admin)):
#     u=db.get(User,user_id)
#     if not u: raise HTTPException(404,"User not found")
#     data=p.model_dump(exclude_unset=True)
#     if "email" in data: u.email=data["email"].lower()
#     if "phone" in data: u.phone=data["phone"]
#     if "password" in data and data["password"]: u.password_hash=hash_password(data.pop("password"))
#     for k,v in data.items():
#         if hasattr(u,k): setattr(u,k,v)
#     db.commit(); db.refresh(u); return user_out(u)

# @router.delete("/{user_id}")
# def delete_user(user_id:int,db:Session=Depends(get_db),admin=Depends(require_admin)):
#     if user_id==admin.id: raise HTTPException(400,"You cannot delete your own administrator account")
#     u=db.get(User,user_id)
#     if not u: raise HTTPException(404,"User not found")
#     db.delete(u); db.commit(); return {"message":"User deleted"}

# @router.post("/{user_id}/verification/send")
# def send_verification(user_id:int,p:OTPRequestIn,db:Session=Depends(get_db),admin=Depends(require_admin)):
#     u=db.get(User,user_id)
#     if not u: raise HTTPException(404,"User not found")
#     target=u.email if p.channel=="email" else u.phone
#     if not target: raise HTTPException(400,f"No {p.channel} registered")
#     otp=generate_otp()
#     req=OTPRequest(purpose=p.purpose,channel=p.channel,target=target,user_id=u.id,otp_hash=otp_digest(otp),expires_at=datetime.now(timezone.utc)+timedelta(minutes=settings.otp_expire_minutes))
#     db.add(req); db.commit()
#     if p.channel=="email": send_email(target,"FleetDoc verification OTP",f"Your FleetDoc verification OTP is {otp}.")
#     else: send_sms(target,f"FleetDoc verification OTP: {otp}")
#     out={"message":f"OTP sent to {p.channel}"}
#     if settings.dev_return_otp: out["dev_otp"]=otp
#     return out

# @router.post("/{user_id}/verification/verify")
# def verify_verification(user_id:int,p:OTPVerify,db:Session=Depends(get_db),admin=Depends(require_admin)):
#     u=db.get(User,user_id)
#     req=db.query(OTPRequest).filter(OTPRequest.user_id==user_id,OTPRequest.target==p.target,OTPRequest.purpose==p.purpose,OTPRequest.verified==False).order_by(OTPRequest.created_at.desc()).first()
#     if not req or req.expires_at<datetime.now(timezone.utc) or req.attempts>=5 or req.otp_hash!=otp_digest(p.otp):
#         if req: req.attempts+=1; db.commit()
#         raise HTTPException(400,"Invalid or expired OTP")
#     req.verified=True
#     if req.channel=="email": u.email_verified=True
#     if req.channel=="sms": u.phone_verified=True
#     db.commit(); return {"message":"Verification successful","user":user_out(u)}

# @router.patch("/{user_id}/permissions")
# def permissions(user_id:int,p:PermissionUpdate,db:Session=Depends(get_db),admin=Depends(require_admin)):
#     u=db.get(User,user_id)
#     if not u: raise HTTPException(404,"User not found")
#     u.permissions=p.permissions; db.commit(); return user_out(u)






from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.core.security import hash_password, generate_otp
from app.models.models import User, OTPRequest
from app.schemas.schemas import (
    UserCreate,
    UserUpdate,
    OTPVerify,
    OTPRequestIn,
    PermissionUpdate,
)
from app.services.messaging import (
    otp_digest,
    send_email,
    send_sms,
    normalize_phone,
)
from app.core.config import settings
from app.utils.serialize import user_out


router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)


# ============================================================
# HELPERS
# ============================================================

def utc_now():
    return datetime.now(timezone.utc)


def normalize_email(email: str | None) -> str | None:
    if not email:
        return None

    value = str(email).strip().lower()

    return value or None


def invalidate_previous_otps(
    db: Session,
    user_id: int,
    purpose: str,
):
    """
    Make all previous unverified OTPs for this purpose unusable.
    """

    previous_requests = (
        db.query(OTPRequest)
        .filter(
            OTPRequest.user_id == user_id,
            OTPRequest.purpose == purpose,
            OTPRequest.verified == False,
        )
        .all()
    )

    for previous in previous_requests:
        previous.verified = True


# ============================================================
# LIST USERS
# ============================================================

@router.get("")
def list_users(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return [
        user_out(x)
        for x in db.query(User)
        .order_by(User.id.desc())
        .all()
    ]


# ============================================================
# CREATE USER
# ============================================================

@router.post("")
def create_user(
    p: UserCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    email = normalize_email(p.email)
    phone = normalize_phone(p.phone)

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required",
        )

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    if phone:
        existing_phone = (
            db.query(User)
            .filter(User.phone == phone)
            .first()
        )

        if existing_phone:
            raise HTTPException(
                status_code=409,
                detail="Phone already registered",
            )

    u = User(
        name=p.name.strip(),
        email=email,
        phone=phone,
        password_hash=hash_password(p.password),
        role=p.role,
        status=p.status,
        photo=p.photo,
        permissions=p.permissions or {},
        email_verified=False,
        phone_verified=False,
    )

    db.add(u)
    db.commit()
    db.refresh(u)

    return user_out(u)


# ============================================================
# UPDATE USER
# ============================================================

@router.patch("/{user_id}")
def update_user(
    user_id: int,
    p: UserUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    u = db.get(User, user_id)

    if not u:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    data = p.model_dump(exclude_unset=True)

    # --------------------------------------------------------
    # NAME
    # --------------------------------------------------------

    if "name" in data and data["name"] is not None:
        u.name = str(data["name"]).strip()

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    if "email" in data and data["email"] is not None:

        new_email = normalize_email(data["email"])

        if new_email != u.email:

            existing_email = (
                db.query(User)
                .filter(
                    User.email == new_email,
                    User.id != u.id,
                )
                .first()
            )

            if existing_email:
                raise HTTPException(
                    status_code=409,
                    detail="Email already registered",
                )

            u.email = new_email
            u.email_verified = False

    # --------------------------------------------------------
    # PHONE
    # --------------------------------------------------------

    if "phone" in data:

        new_phone = normalize_phone(
            data["phone"]
        )

        if new_phone != u.phone:

            if new_phone:

                existing_phone = (
                    db.query(User)
                    .filter(
                        User.phone == new_phone,
                        User.id != u.id,
                    )
                    .first()
                )

                if existing_phone:
                    raise HTTPException(
                        status_code=409,
                        detail="Phone already registered",
                    )

            u.phone = new_phone
            u.phone_verified = False

    # --------------------------------------------------------
    # PASSWORD
    # --------------------------------------------------------

    if "password" in data:

        password = data.get("password")

        if password:
            u.password_hash = hash_password(
                password
            )

    # --------------------------------------------------------
    # ROLE
    # --------------------------------------------------------

    if "role" in data and data["role"] is not None:
        u.role = data["role"]

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    if "status" in data and data["status"] is not None:
        u.status = data["status"]

    # --------------------------------------------------------
    # PHOTO
    # --------------------------------------------------------

    if "photo" in data:
        u.photo = data["photo"]

    # --------------------------------------------------------
    # PERMISSIONS
    # --------------------------------------------------------

    if (
        "permissions" in data
        and data["permissions"] is not None
    ):
        u.permissions = data["permissions"]

    db.commit()
    db.refresh(u)

    return user_out(u)


# ============================================================
# DELETE USER
# ============================================================

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own administrator account",
        )

    u = db.get(User, user_id)

    if not u:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    db.delete(u)
    db.commit()

    return {
        "message": "User deleted",
    }


# ============================================================
# SEND USER VERIFICATION OTP
# ============================================================

@router.post("/{user_id}/verification/send")
def send_verification(
    user_id: int,
    p: OTPRequestIn,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    u = db.get(User, user_id)

    if not u:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    channel = (
        str(p.channel or "")
        .strip()
        .lower()
    )

    if channel == "phone":
        channel = "sms"

    if channel not in {"email", "sms"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification channel. Use email or phone.",
        )

    # --------------------------------------------------------
    # Get ACTUAL registered target
    # --------------------------------------------------------

    if channel == "email":

        target = normalize_email(u.email)

        if not target:
            raise HTTPException(
                status_code=400,
                detail="No email registered for this user",
            )

    else:

        target = normalize_phone(u.phone)

        if not target:
            raise HTTPException(
                status_code=400,
                detail="No phone number registered for this user",
            )

    # --------------------------------------------------------
    # Already verified?
    # --------------------------------------------------------

    if (
        channel == "email"
        and u.email_verified
    ):
        return {
            "message": "Email is already verified",
            "already_verified": True,
        }

    if (
        channel == "sms"
        and u.phone_verified
    ):
        return {
            "message": "Phone number is already verified",
            "already_verified": True,
        }

    # --------------------------------------------------------
    # Generate OTP
    # --------------------------------------------------------

    otp = generate_otp()

    expires_at = (
        utc_now()
        + timedelta(
            minutes=settings.otp_expire_minutes
        )
    )

    # --------------------------------------------------------
    # Invalidate previous OTPs
    # --------------------------------------------------------

    invalidate_previous_otps(
        db,
        u.id,
        p.purpose,
    )

    # --------------------------------------------------------
    # IMPORTANT:
    # Send OTP BEFORE committing the new OTP request.
    #
    # If Gmail/SMS fails, the request is not stored as valid.
    # --------------------------------------------------------

    try:

        if channel == "email":

            send_email(
                target,
                "FleetDoc Email Verification OTP",
                (
                    f"Hello {u.name},\n\n"
                    f"Your FleetDoc email verification OTP is:\n\n"
                    f"{otp}\n\n"
                    f"This OTP will expire in "
                    f"{settings.otp_expire_minutes} minutes.\n\n"
                    f"If you did not request this OTP, "
                    f"please ignore this email.\n\n"
                    f"Regards,\n"
                    f"FleetDoc"
                ),
            )

        else:

            send_sms(
                target,
                (
                    f"FleetDoc OTP: {otp}. "
                    f"Valid for "
                    f"{settings.otp_expire_minutes} minutes."
                ),
            )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )

    # --------------------------------------------------------
    # Save OTP only after successful provider call
    # --------------------------------------------------------

    req = OTPRequest(
        purpose=p.purpose,
        channel=channel,
        target=target,
        user_id=u.id,
        otp_hash=otp_digest(otp),
        expires_at=expires_at,
        attempts=0,
        verified=False,
    )

    db.add(req)
    db.commit()

    out = {
        "message": (
            "OTP sent to email"
            if channel == "email"
            else "OTP sent to phone"
        ),
        "channel": channel,
        "target": target,
    }

    # Development only
    if settings.dev_return_otp:
        out["dev_otp"] = otp

    return out


# ============================================================
# VERIFY USER OTP
# ============================================================

@router.post("/{user_id}/verification/verify")
def verify_verification(
    user_id: int,
    p: OTPVerify,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    u = db.get(User, user_id)

    if not u:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    target = str(
        p.target or ""
    ).strip()

    if "@" in target:
        target = normalize_email(target) or ""
    else:
        target = normalize_phone(target) or ""

    req = (
        db.query(OTPRequest)
        .filter(
            OTPRequest.user_id == user_id,
            OTPRequest.target == target,
            OTPRequest.purpose == p.purpose,
            OTPRequest.verified == False,
        )
        .order_by(
            OTPRequest.created_at.desc()
        )
        .first()
    )

    if not req:
        raise HTTPException(
            status_code=400,
            detail="No active verification code found for this target",
        )

    # --------------------------------------------------------
    # Maximum attempts
    # --------------------------------------------------------

    if req.attempts >= 5:
        raise HTTPException(
            status_code=400,
            detail=(
                "Too many incorrect OTP attempts. "
                "Please request a new OTP."
            ),
        )

    # --------------------------------------------------------
    # Expiration
    # --------------------------------------------------------

    now_utc = utc_now()

    expires_at = req.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if expires_at < now_utc:

        req.verified = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail=(
                "OTP has expired. "
                "Please request a new OTP."
            ),
        )

    # --------------------------------------------------------
    # Verify OTP
    # --------------------------------------------------------

    if req.otp_hash != otp_digest(p.otp):

        req.attempts += 1
        db.commit()

        remaining = max(
            0,
            5 - req.attempts,
        )

        if remaining == 0:
            req.verified = True
            db.commit()

            raise HTTPException(
                status_code=400,
                detail=(
                    "Too many incorrect OTP attempts. "
                    "Please request a new OTP."
                ),
            )

        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid OTP. "
                f"{remaining} attempt(s) remaining."
            ),
        )

    # --------------------------------------------------------
    # Mark OTP verified
    # --------------------------------------------------------

    req.verified = True

    # --------------------------------------------------------
    # Update verification state
    # --------------------------------------------------------

    if req.channel == "email":

        if normalize_email(u.email) != target:
            raise HTTPException(
                status_code=400,
                detail=(
                    "This OTP does not belong "
                    "to the current email address."
                ),
            )

        u.email_verified = True

    elif req.channel == "sms":

        if normalize_phone(u.phone) != target:
            raise HTTPException(
                status_code=400,
                detail=(
                    "This OTP does not belong "
                    "to the current phone number."
                ),
            )

        u.phone_verified = True

    # --------------------------------------------------------
    # Activate only after required verification
    # --------------------------------------------------------

    email_ok = bool(u.email_verified)

    phone_ok = (
        not u.phone
        or bool(u.phone_verified)
    )

    if email_ok and phone_ok:
        u.status = "Active"

    db.commit()
    db.refresh(u)

    return {
        "message": "Verification successful",
        "channel": req.channel,
        "user": user_out(u),
    }


# ============================================================
# UPDATE USER PERMISSIONS
# ============================================================

@router.patch("/{user_id}/permissions")
def permissions(
    user_id: int,
    p: PermissionUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    u = db.get(User, user_id)

    if not u:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    u.permissions = p.permissions

    db.commit()
    db.refresh(u)

    return user_out(u)