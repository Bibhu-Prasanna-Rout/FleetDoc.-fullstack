
# from datetime import datetime, timezone, timedelta
# import re

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.core.database import get_db
# from app.core.config import settings
# from app.core.dependencies import get_current_user
# from app.core.security import (
#     verify_password,
#     hash_password,
#     create_access_token,
#     create_refresh_token,
#     decode_token,
#     generate_otp,
# )
# from app.models.models import (
#     User,
#     OTPRequest,
#     AuditLog,
#     Setting,
# )
# from app.schemas.schemas import (
#     LoginRequest,
#     Login2FAVerifyRequest,
#     ForgotPasswordStart,
#     ResetPassword,
#     VerifyForgotPasswordOTP,
#     ChangePasswordRequest,
#     RefreshRequest,
# )
# from app.services.messaging import (
#     otp_digest,
#     send_email,
#     normalize_phone,
# )


# router = APIRouter(
#     prefix="/api/v1/auth",
#     tags=["Authentication"],
# )


# # ============================================================
# # HELPERS
# # ============================================================

# def utc_now():
#     return datetime.now(timezone.utc)


# def normalize_email(email: str | None):
#     if not email:
#         return None

#     value = str(email).strip().lower()

#     return value or None


# def invalidate_password_otps(
#     db: Session,
#     user_id: int,
# ):
#     previous = (
#         db.query(OTPRequest)
#         .filter(
#             OTPRequest.user_id == user_id,
#             OTPRequest.purpose == "password_reset",
#             OTPRequest.channel == "email",
#             OTPRequest.verified == False,
#         )
#         .all()
#     )

#     for item in previous:
#         # verified=True is used here as a consumed/invalidated marker.
#         # This immediately makes every previous OTP unusable.
#         item.verified = True


# def get_password_attempt_record(db: Session, user_id: int):
#     return (
#         db.query(OTPRequest)
#         .filter(
#             OTPRequest.user_id == user_id,
#             OTPRequest.purpose == "login_password_attempts",
#             OTPRequest.channel == "system",
#             OTPRequest.target == str(user_id),
#         )
#         .order_by(OTPRequest.created_at.desc())
#         .first()
#     )


# def clear_password_attempts(db: Session, user_id: int):
#     records = (
#         db.query(OTPRequest)
#         .filter(
#             OTPRequest.user_id == user_id,
#             OTPRequest.purpose == "login_password_attempts",
#             OTPRequest.channel == "system",
#             OTPRequest.target == str(user_id),
#         )
#         .all()
#     )
#     for record in records:
#         db.delete(record)


# def register_wrong_password(db: Session, user: User):
#     now = utc_now()
#     record = get_password_attempt_record(db, user.id)

#     # Start a fresh 15-minute attempt window when the previous window ended.
#     if record:
#         created_at = record.created_at
#         if created_at.tzinfo is None:
#             created_at = created_at.replace(tzinfo=timezone.utc)
#         if created_at + timedelta(minutes=15) <= now:
#             record.attempts = 0
#             record.created_at = now
#             record.expires_at = now + timedelta(minutes=15)
#     else:
#         record = OTPRequest(
#             purpose="login_password_attempts",
#             channel="system",
#             target=str(user.id),
#             user_id=user.id,
#             otp_hash="",
#             expires_at=now + timedelta(minutes=15),
#             attempts=0,
#             verified=False,
#             created_at=now,
#         )
#         db.add(record)
#         db.flush()

#     record.attempts += 1

#     # Five failed passwords (after four allowed attempts) lock the account for 15 minutes.
#     if record.attempts >= 5:
#         record.expires_at = now + timedelta(minutes=15)

#     db.commit()
#     db.refresh(record)
#     return record


# def get_password_lockout(db: Session, user: User):
#     record = get_password_attempt_record(db, user.id)
#     if not record:
#         return None

#     now = utc_now()
#     expires_at = record.expires_at
#     if expires_at and expires_at.tzinfo is None:
#         expires_at = expires_at.replace(tzinfo=timezone.utc)

#     # A lockout expires after 15 minutes. Clear the old attempt window.
#     if record.attempts >= 5 and expires_at and expires_at > now:
#         return record

#     created_at = record.created_at
#     if created_at.tzinfo is None:
#         created_at = created_at.replace(tzinfo=timezone.utc)

#     if created_at + timedelta(minutes=15) <= now:
#         db.delete(record)
#         db.commit()

#     return None


# # ============================================================
# # PUBLIC USER
# # ============================================================

# def public_user(u):

#     return {
#         "id": u.id,
#         "name": u.name,
#         "email": u.email,
#         "contactNo": u.phone,
#         "role": u.role,
#         "status": u.status,
#         "photo": u.photo,

#         # Email verification is still important.
#         "emailVerified": u.email_verified,

#         # Phone number is informational only.
#         # It is NOT required for login or password reset.
#         "phoneVerified": u.phone_verified,

#         "permissions": u.permissions or {},
#     }


# # ============================================================
# # LOGIN
# # ============================================================

# @router.post("/login")
# def login(
#     payload: LoginRequest,
#     db: Session = Depends(get_db),
# ):

#     email = normalize_email(payload.email)

#     u = (
#         db.query(User)
#         .filter(User.email == email)
#         .first()
#     )

#     if not u:
#         raise HTTPException(
#             status_code=404,
#             detail="This email is not registered. Please contact the admin.",
#         )

#     # A fourth wrong password starts a 15-minute lockout.
#     lockout = get_password_lockout(db, u)
#     if lockout:
#         locked_until = lockout.expires_at
#         if locked_until.tzinfo is None:
#             locked_until = locked_until.replace(tzinfo=timezone.utc)
#         raise HTTPException(
#             status_code=423,
#             detail={
#                 "message": "You reached the maximum password attempts. Please try again after 15 minutes and contact the admin.",
#                 "locked_until": locked_until.isoformat(),
#                 "attempts": int(lockout.attempts),
#             },
#         )

#     if not verify_password(payload.password, u.password_hash):
#         attempt = register_wrong_password(db, u)
#         remaining = max(0, 4 - int(attempt.attempts))

#         if attempt.attempts >= 5:
#             locked_until = attempt.expires_at
#             if locked_until.tzinfo is None:
#                 locked_until = locked_until.replace(tzinfo=timezone.utc)
#             raise HTTPException(
#                 status_code=423,
#                 detail={
#                     "message": "You reached the maximum password attempts. Please try again after 15 minutes and contact the admin.",
#                     "locked_until": locked_until.isoformat(),
#                     "attempts": int(attempt.attempts),
#                 },
#             )

#         warning = (
#             "Please use the correct password. This was your 4th incorrect attempt; "
#             "one more incorrect attempt will lock login for 15 minutes."
#             if attempt.attempts == 4
#             else "Please use the correct password."
#         )
#         raise HTTPException(
#             status_code=401,
#             detail={
#                 "message": warning,
#                 "attempts_remaining": remaining,
#             },
#         )

#     # Correct password resets the failed-attempt counter.
#     clear_password_attempts(db, u.id)
#     db.commit()

#     # --------------------------------------------------------
#     # Account must be active
#     # --------------------------------------------------------

#     if u.status != "Active":
#         raise HTTPException(
#             status_code=403,
#             detail="Your account is inactive",
#         )

#     # --------------------------------------------------------
#     # Email must be verified
#     #
#     # IMPORTANT:
#     # Email verification is required.
#     # Phone verification is NOT required.
#     # --------------------------------------------------------

#     if not u.email_verified:
#         raise HTTPException(
#             status_code=403,
#             detail=(
#                 "Your email address has not been verified."
#             ),
#         )

#     # --------------------------------------------------------
#     # PHONE VERIFICATION REMOVED
#     # --------------------------------------------------------

#     # 2FA is controlled by the same global Security setting
#     # used by Settings.jsx.  No schema migration is required:
#     # the one-time challenge is stored in otp_requests.
#     global_setting = (
#         db.query(Setting)
#         .filter(Setting.key == "global")
#         .first()
#     )
#     global_values = global_setting.value if global_setting else {}
#     # Settings.jsx stores the canonical key as twoFactorAuthentication,
#     # while older saved settings may still contain twoFactor. Accept both
#     # and normalize common string values so the toggle is reliably enforced.
#     raw_two_factor = global_values.get(
#         "twoFactorAuthentication",
#         global_values.get("twoFactor", False),
#     )
#     if isinstance(raw_two_factor, str):
#         two_factor_enabled = raw_two_factor.strip().lower() in {
#             "true", "1", "yes", "on",
#         }
#     else:
#         two_factor_enabled = bool(raw_two_factor)

#     if two_factor_enabled:
#         # Invalidate older login challenges for this user.
#         previous = (
#             db.query(OTPRequest)
#             .filter(
#                 OTPRequest.user_id == u.id,
#                 OTPRequest.purpose == "login_2fa",
#                 OTPRequest.verified == False,
#             )
#             .all()
#         )
#         for item in previous:
#             item.verified = True

#         otp = generate_otp()
#         challenge = OTPRequest(
#             purpose="login_2fa",
#             channel="email",
#             target=u.email,
#             user_id=u.id,
#             otp_hash=otp_digest(otp),
#             expires_at=utc_now() + timedelta(minutes=settings.otp_expire_minutes),
#             attempts=0,
#             verified=False,
#         )
#         db.add(challenge)
#         db.flush()

#         body = (
#             f"Hello {u.name},\n\n"
#             f"Your FleetDoc login verification code is:\n\n"
#             f"{otp}\n\n"
#             f"This code expires in {settings.otp_expire_minutes} minutes.\n\n"
#             f"If you did not attempt to sign in, please secure your account.\n\n"
#             f"Regards,\nFleetDoc"
#         )
#         try:
#             # Login 2FA always uses real email delivery.
#             # There is intentionally NO development OTP fallback here.
#             send_email(
#                 u.email,
#                 "FleetDoc Login Verification Code",
#                 body,
#             )
#         except Exception as exc:
#             db.rollback()
#             raise HTTPException(
#                 status_code=502,
#                 detail=(
#                     "Unable to send the 2FA verification code to your email. "
#                     "Please check the SMTP configuration and try again."
#                 ),
#             ) from exc

#         db.add(
#             AuditLog(
#                 user_id=u.id,
#                 action="login_2fa_requested",
#                 entity="Authentication",
#                 entity_id=str(u.id),
#                 details={"channel": "email"},
#             )
#         )
#         db.commit()

#         return {
#             "requires_2fa": True,
#             "challenge_id": challenge.id,
#             "message": "A verification code has been sent to your registered email.",
#             "expires_at": challenge.expires_at.isoformat(),
#         }

#     db.add(
#         AuditLog(
#             user_id=u.id,
#             action="login",
#             entity="Authentication",
#             entity_id=str(u.id),
#             details={"two_factor": False},
#         )
#     )
#     db.commit()

#     return {
#         "access_token": create_access_token(u.id),
#         "refresh_token": create_refresh_token(u.id),
#         "token_type": "bearer",
#         "user": public_user(u),
#     }


# # ============================================================
# # LOGIN - VERIFY 2FA
# # ============================================================

# @router.post(
#     "/login/2fa/verify",
#     operation_id="verifyLogin2FA",
#     summary="Verify login 2FA OTP",
# )
# def verify_login_2fa(
#     payload: Login2FAVerifyRequest,
#     db: Session = Depends(get_db),
# ):
#     challenge = (
#         db.query(OTPRequest)
#         .filter(
#             OTPRequest.id == payload.challenge_id,
#             OTPRequest.purpose == "login_2fa",
#             OTPRequest.channel == "email",
#             OTPRequest.verified == False,
#         )
#         .first()
#     )

#     if not challenge or not challenge.user_id:
#         raise HTTPException(status_code=400, detail="Invalid or expired 2FA challenge.")

#     if challenge.attempts >= 5:
#         challenge.verified = True
#         db.commit()
#         raise HTTPException(status_code=400, detail="Too many incorrect verification attempts. Please sign in again.")

#     expires_at = challenge.expires_at
#     if expires_at.tzinfo is None:
#         expires_at = expires_at.replace(tzinfo=timezone.utc)
#     if expires_at < utc_now():
#         challenge.verified = True
#         db.commit()
#         raise HTTPException(status_code=400, detail="The 2FA code has expired. Please sign in again.")

#     if challenge.otp_hash != otp_digest(payload.otp):
#         challenge.attempts += 1
#         if challenge.attempts >= 5:
#             challenge.verified = True
#         db.commit()
#         remaining = max(0, 5 - challenge.attempts)
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid 2FA code. {remaining} attempt(s) remaining.",
#         )

#     user = db.query(User).filter(User.id == challenge.user_id).first()
#     if not user or user.status != "Active" or not user.email_verified:
#         challenge.verified = True
#         db.commit()
#         raise HTTPException(status_code=403, detail="Your account cannot complete login.")

#     challenge.verified = True
#     db.add(
#         AuditLog(
#             user_id=user.id,
#             action="login_2fa_verified",
#             entity="Authentication",
#             entity_id=str(user.id),
#             details={"channel": "email"},
#         )
#     )
#     db.commit()

#     return {
#         "access_token": create_access_token(user.id),
#         "refresh_token": create_refresh_token(user.id),
#         "token_type": "bearer",
#         "user": public_user(user),
#     }


# # ============================================================
# # REFRESH
# # ============================================================

# @router.post("/refresh")
# def refresh(
#     payload: RefreshRequest,
# ):

#     try:

#         data = decode_token(
#             payload.refresh_token
#         )

#         if data.get("type") != "refresh":
#             raise ValueError()

#         uid = int(data["sub"])

#     except Exception:

#         raise HTTPException(
#             status_code=401,
#             detail="Invalid or expired refresh token",
#         )

#     return {
#         "access_token": create_access_token(uid),
#         "token_type": "bearer",
#     }


# # ============================================================
# # FORGOT PASSWORD - REQUEST OTP
# # ============================================================

# @router.post(
#     "/forgot-password/request",
#     operation_id="requestForgotPasswordOtp",
#     summary="Send forgot-password OTP",
# )
# def forgot(
#     payload: ForgotPasswordStart,
#     db: Session = Depends(get_db),
# ):

#     email = normalize_email(payload.email)

#     u = (
#         db.query(User)
#         .filter(User.email == email)
#         .first()
#     )

#     # The application explicitly tells the user whether the email exists.
#     if not u:
#         raise HTTPException(
#             status_code=404,
#             detail="This is not an existing email. Please contact the admin.",
#         )

#     # --------------------------------------------------------
#     # Invalidate every previous reset OTP immediately.
#     # This guarantees that after Resend, the old OTP can never
#     # be accepted again.
#     # --------------------------------------------------------

#     invalidate_password_otps(db, u.id)
#     db.commit()

#     # --------------------------------------------------------
#     # Generate a new OTP and store only its hash.
#     # The OTP is valid for the configured reset window (3 min
#     # in the production configuration).
#     # --------------------------------------------------------

#     otp = generate_otp()

#     expires_at = (
#         utc_now()
#         + timedelta(
#             minutes=settings.password_reset_otp_expire_minutes
#         )
#     )

#     req = OTPRequest(
#         purpose="password_reset",
#         channel="email",
#         target=u.email,
#         user_id=u.id,
#         otp_hash=otp_digest(otp),
#         expires_at=expires_at,
#         attempts=0,
#         verified=False,
#         created_at=utc_now(),
#     )

#     db.add(req)
#     db.commit()
#     db.refresh(req)

#     # --------------------------------------------------------
#     # Send the real OTP only to the registered email address.
#     # No development OTP is returned to the frontend.
#     # --------------------------------------------------------

#     body = (
#         f"Hello {u.name},\n\n"
#         f"Your FleetDoc password reset OTP is:\n\n"
#         f"{otp}\n\n"
#         f"This OTP will expire in "
#         f"{settings.password_reset_otp_expire_minutes} minutes.\n\n"
#         f"If you did not request a password reset, "
#         f"please ignore this email.\n\n"
#         f"Regards,\n"
#         f"FleetDoc"
#     )

#     try:
#         send_email(
#             u.email,
#             "FleetDoc Password Reset OTP",
#             body,
#         )
#     except Exception as exc:
#         # Do not leave an OTP usable when delivery failed.
#         req.verified = True
#         db.commit()

#         raise HTTPException(
#             status_code=502,
#             detail=(
#                 "Unable to send the password reset OTP. "
#                 "Please check the SMTP configuration and try again."
#             ),
#         ) from exc

#     return {
#         "message": "OTP sent to your registered email.",
#         "expires_at": expires_at.isoformat(),
#         "expires_in_seconds": settings.password_reset_otp_expire_minutes * 60,
#     }


# # ============================================================
# # FORGOT PASSWORD - VERIFY OTP
# # ============================================================

# @router.post(
#     "/forgot-password/verify",
#     operation_id="verifyForgotPasswordOtp",
#     summary="Verify forgot-password OTP",
#     description="Verifies the latest password-reset OTP sent to the registered email. OTP expires after the configured reset window.",
# )
# def verify_forgot_password_otp(
#     payload: VerifyForgotPasswordOTP,
#     db: Session = Depends(get_db),
# ):
#     email = normalize_email(payload.email)
#     user = db.query(User).filter(User.email == email).first()

#     if not user:
#         raise HTTPException(
#             status_code=404,
#             detail="This is not an existing email. Please contact the admin.",
#         )

#     req = (
#         db.query(OTPRequest)
#         .filter(
#             OTPRequest.user_id == user.id,
#             OTPRequest.purpose == "password_reset",
#             OTPRequest.channel == "email",
#             OTPRequest.target == email,
#             OTPRequest.verified == False,
#         )
#         .order_by(OTPRequest.created_at.desc())
#         .first()
#     )

#     if not req:
#         raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new OTP.")

#     if req.attempts >= 5:
#         req.verified = True
#         db.commit()
#         raise HTTPException(status_code=400, detail="Too many incorrect OTP attempts. Please request a new OTP.")

#     expires_at = req.expires_at
#     if expires_at.tzinfo is None:
#         expires_at = expires_at.replace(tzinfo=timezone.utc)
#     if expires_at <= utc_now():
#         req.verified = True
#         db.commit()
#         raise HTTPException(status_code=400, detail="This OTP has expired. Please request a new OTP.")

#     if req.otp_hash != otp_digest(payload.otp):
#         req.attempts += 1
#         if req.attempts >= 5:
#             req.verified = True
#         db.commit()
#         remaining = max(0, 5 - req.attempts)
#         if remaining == 0:
#             raise HTTPException(status_code=400, detail="Too many incorrect OTP attempts. Please request a new OTP.")
#         raise HTTPException(status_code=400, detail=f"Invalid OTP. {remaining} attempt(s) remaining.")

#     # Do not consume a valid OTP here. The reset endpoint consumes it when
#     # the new password is actually saved. Resend still invalidates it.
#     return {
#         "verified": True,
#         "message": "OTP verified successfully.",
#         "expires_at": expires_at.isoformat(),
#     }


# # ============================================================
# # FORGOT PASSWORD - RESET
# # ============================================================

# @router.post(
#     "/forgot-password/reset",
#     operation_id="resetForgotPassword",
#     summary="Reset password with OTP",
# )
# def reset(
#     payload: ResetPassword,
#     db: Session = Depends(get_db),
# ):

#     email = normalize_email(
#         payload.email
#     )

#     u = (
#         db.query(User)
#         .filter(User.email == email)
#         .first()
#     )

#     if not u:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid OTP or email",
#         )

#     target = normalize_email(
#         u.email
#     )

#     # --------------------------------------------------------
#     # Find latest valid EMAIL password-reset OTP
#     #
#     # IMPORTANT:
#     # Phone verification is NOT checked here.
#     # --------------------------------------------------------

#     req = (
#         db.query(OTPRequest)
#         .filter(
#             OTPRequest.user_id == u.id,
#             OTPRequest.purpose == "password_reset",
#             OTPRequest.channel == "email",
#             OTPRequest.target == target,
#             OTPRequest.verified == False,
#         )
#         .order_by(
#             OTPRequest.created_at.desc()
#         )
#         .first()
#     )

#     if not req:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid or expired OTP",
#         )

#     # --------------------------------------------------------
#     # Attempts
#     # --------------------------------------------------------

#     if req.attempts >= 5:

#         req.verified = True

#         db.commit()

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "Too many incorrect OTP attempts. "
#                 "Please request a new OTP."
#             ),
#         )

#     # --------------------------------------------------------
#     # Expiration
#     # --------------------------------------------------------

#     now_utc = utc_now()

#     expires_at = req.expires_at

#     if expires_at.tzinfo is None:
#         expires_at = expires_at.replace(
#             tzinfo=timezone.utc
#         )

#     if expires_at < now_utc:

#         req.verified = True

#         db.commit()

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "OTP has expired. "
#                 "Please request a new OTP."
#             ),
#         )

#     # --------------------------------------------------------
#     # OTP check
#     # --------------------------------------------------------

#     if req.otp_hash != otp_digest(
#         payload.otp
#     ):

#         req.attempts += 1

#         if req.attempts >= 5:
#             req.verified = True

#         db.commit()

#         remaining = max(
#             0,
#             5 - req.attempts,
#         )

#         if remaining == 0:

#             raise HTTPException(
#                 status_code=400,
#                 detail=(
#                     "Too many incorrect OTP attempts. "
#                     "Please request a new OTP."
#                 ),
#             )

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 f"Invalid OTP. "
#                 f"{remaining} attempt(s) remaining."
#             ),
#         )

#     # --------------------------------------------------------
#     # OTP valid
#     # --------------------------------------------------------

#     req.verified = True

#     # --------------------------------------------------------
#     # Reset password
#     #
#     # NO phone verification required.
#     # --------------------------------------------------------

#     u.password_hash = hash_password(
#         payload.new_password
#     )

#     db.add(
#         AuditLog(
#             user_id=u.id,
#             action="password_reset",
#             entity="User",
#             entity_id=str(u.id),
#         )
#     )

#     db.commit()

#     return {
#         "message": "Password reset successfully"
#     }


# # ============================================================
# # CHANGE PASSWORD - AUTHENTICATED USER
# # ============================================================

# @router.post("/change-password")
# def change_password(
#     payload: ChangePasswordRequest,
#     db: Session = Depends(get_db),
#     user: User = Depends(get_current_user),
# ):
#     """Change the password for the currently authenticated user.

#     The current password is always verified first.  The optional
#     global role permission named ``password`` is also enforced here
#     so the Settings permission cannot be bypassed by calling the API
#     directly.
#     """

#     # Admins are always allowed. Other roles must have the password
#     # permission enabled in the same global role-permission settings
#     # used by Settings.jsx.
#     if user.role != "Admin":
#         setting = (
#             db.query(Setting)
#             .filter(Setting.key == "global")
#             .first()
#         )
#         role_permissions = (setting.value or {}).get(
#             "rolePermissions",
#         ) if setting else {}
#         role_permissions = role_permissions or {}
#         role_block = role_permissions.get(user.role, {})

#         if not isinstance(role_block, dict) or not role_block.get("password", False):
#             raise HTTPException(
#                 status_code=403,
#                 detail="Password change permission denied",
#             )

#     # Never allow a password change without the current password.
#     if not verify_password(
#         payload.current_password,
#         user.password_hash,
#     ):
#         raise HTTPException(
#             status_code=400,
#             detail="Current password is incorrect",
#         )

#     if payload.current_password == payload.new_password:
#         raise HTTPException(
#             status_code=400,
#             detail="New password must be different from the current password",
#         )

#     # Respect the existing Strong Password Policy setting.
#     setting = (
#         db.query(Setting)
#         .filter(Setting.key == "global")
#         .first()
#     )
#     global_settings = setting.value or {} if setting else {}
#     strong_password = bool(
#         global_settings.get(
#             "strongPasswordRequired",
#             global_settings.get("strongPassword", True),
#         )
#     )

#     if strong_password:
#         if len(payload.new_password) < 6:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Password must be at least 6 characters.",
#             )
#         if not re.search(r"[A-Z]", payload.new_password):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Password must contain at least one capital letter.",
#             )
#         if not re.search(r"[0-9]", payload.new_password):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Password must contain at least one number.",
#             )
#         if not re.search(r"[^A-Za-z0-9]", payload.new_password):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Password must contain at least one special character.",
#             )

#     user.password_hash = hash_password(
#         payload.new_password,
#     )

#     db.add(
#         AuditLog(
#             user_id=user.id,
#             action="password_change",
#             entity="User",
#             entity_id=str(user.id),
#         )
#     )

#     db.commit()

#     return {
#         "message": "Password changed successfully",
#     }


# # ============================================================
# # LOGOUT
# # ============================================================

# @router.post("/logout")
# def logout():

#     return {
#         "message": (
#             "Logged out. Remove access/refresh "
#             "tokens on the client."
#         )
#     }







from datetime import datetime, timezone, timedelta
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
)
from app.models.models import (
    User,
    OTPRequest,
    AuditLog,
    Setting,
)
from app.schemas.schemas import (
    LoginRequest,
    Login2FAVerifyRequest,
    ForgotPasswordStart,
    ResetPassword,
    VerifyForgotPasswordOTP,
    ChangePasswordRequest,
    RefreshRequest,
)
from app.services.messaging import (
    otp_digest,
    send_email,
    normalize_phone,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


# ============================================================
# HELPERS
# ============================================================

def utc_now():
    return datetime.now(timezone.utc)


def normalize_email(email: str | None):
    if not email:
        return None

    value = str(email).strip().lower()

    return value or None


def invalidate_password_otps(
    db: Session,
    user_id: int,
):
    previous = (
        db.query(OTPRequest)
        .filter(
            OTPRequest.user_id == user_id,
            OTPRequest.purpose == "password_reset",
            OTPRequest.channel == "email",
            OTPRequest.verified == False,
        )
        .all()
    )

    for item in previous:
        # verified=True is used here as a consumed/invalidated marker.
        # This immediately makes every previous OTP unusable.
        item.verified = True


def get_password_attempt_record(db: Session, user_id: int):
    return (
        db.query(OTPRequest)
        .filter(
            OTPRequest.user_id == user_id,
            OTPRequest.purpose == "login_password_attempts",
            OTPRequest.channel == "system",
            OTPRequest.target == str(user_id),
        )
        .order_by(OTPRequest.created_at.desc())
        .first()
    )


def clear_password_attempts(db: Session, user_id: int):
    records = (
        db.query(OTPRequest)
        .filter(
            OTPRequest.user_id == user_id,
            OTPRequest.purpose == "login_password_attempts",
            OTPRequest.channel == "system",
            OTPRequest.target == str(user_id),
        )
        .all()
    )
    for record in records:
        db.delete(record)


def register_wrong_password(db: Session, user: User):
    now = utc_now()
    record = get_password_attempt_record(db, user.id)

    # Start a fresh 15-minute attempt window when the previous window ended.
    if record:
        created_at = record.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        if created_at + timedelta(minutes=15) <= now:
            record.attempts = 0
            record.created_at = now
            record.expires_at = now + timedelta(minutes=15)
    else:
        record = OTPRequest(
            purpose="login_password_attempts",
            channel="system",
            target=str(user.id),
            user_id=user.id,
            otp_hash="",
            expires_at=now + timedelta(minutes=15),
            attempts=0,
            verified=False,
            created_at=now,
        )
        db.add(record)
        db.flush()

    record.attempts += 1

    # Four failed passwords lock the account for 15 minutes.
    if record.attempts >= 4:
        record.expires_at = now + timedelta(minutes=15)

    db.commit()
    db.refresh(record)
    return record


def get_password_lockout(db: Session, user: User):
    record = get_password_attempt_record(db, user.id)
    if not record:
        return None

    now = utc_now()
    expires_at = record.expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    # A lockout expires after 15 minutes. Clear the old attempt window.
    if record.attempts >= 4 and expires_at and expires_at > now:
        return record

    created_at = record.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    if created_at + timedelta(minutes=15) <= now:
        db.delete(record)
        db.commit()

    return None


# ============================================================
# PUBLIC USER
# ============================================================

def public_user(u):

    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "contactNo": u.phone,
        "role": u.role,
        "status": u.status,
        "photo": u.photo,

        # Email verification is still important.
        "emailVerified": u.email_verified,

        # Phone number is informational only.
        # It is NOT required for login or password reset.
        "phoneVerified": u.phone_verified,

        "permissions": u.permissions or {},
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):

    email = normalize_email(payload.email)

    u = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not u:
        raise HTTPException(
            status_code=404,
            detail="Invalid email.",
        )

    # The fourth wrong password starts a 15-minute lockout.
    lockout = get_password_lockout(db, u)
    if lockout:
        locked_until = lockout.expires_at
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        raise HTTPException(
            status_code=423,
            detail={
                "message": "You reached the maximum password attempts. Please try again after 15 minutes and contact the admin.",
                "locked_until": locked_until.isoformat(),
                "attempts": int(lockout.attempts),
            },
        )

    if not verify_password(payload.password, u.password_hash):
        attempt = register_wrong_password(db, u)
        remaining = max(0, 4 - int(attempt.attempts))

        if attempt.attempts >= 4:
            locked_until = attempt.expires_at
            if locked_until.tzinfo is None:
                locked_until = locked_until.replace(tzinfo=timezone.utc)
            raise HTTPException(
                status_code=423,
                detail={
                    "message": "You reached the maximum password attempts. Please try again after 15 minutes and contact the admin.",
                    "locked_until": locked_until.isoformat(),
                    "attempts": int(attempt.attempts),
                },
            )

        warning = "Please use the correct password."
        raise HTTPException(
            status_code=401,
            detail={
                "message": warning,
                "attempts_remaining": remaining,
            },
        )

    # Correct password resets the failed-attempt counter.
    clear_password_attempts(db, u.id)
    db.commit()

    # --------------------------------------------------------
    # Account must be active
    # --------------------------------------------------------

    if u.status != "Active":
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive",
        )

    # --------------------------------------------------------
    # Email must be verified
    #
    # IMPORTANT:
    # Email verification is required.
    # Phone verification is NOT required.
    # --------------------------------------------------------

    if not u.email_verified:
        raise HTTPException(
            status_code=403,
            detail=(
                "Your email address has not been verified."
            ),
        )

    # --------------------------------------------------------
    # PHONE VERIFICATION REMOVED
    # --------------------------------------------------------

    # 2FA is controlled by the same global Security setting
    # used by Settings.jsx.  No schema migration is required:
    # the one-time challenge is stored in otp_requests.
    global_setting = (
        db.query(Setting)
        .filter(Setting.key == "global")
        .first()
    )
    global_values = global_setting.value if global_setting else {}
    # Settings.jsx stores the canonical key as twoFactorAuthentication,
    # while older saved settings may still contain twoFactor. Accept both
    # and normalize common string values so the toggle is reliably enforced.
    raw_two_factor = global_values.get(
        "twoFactorAuthentication",
        global_values.get("twoFactor", False),
    )
    if isinstance(raw_two_factor, str):
        two_factor_enabled = raw_two_factor.strip().lower() in {
            "true", "1", "yes", "on",
        }
    else:
        two_factor_enabled = bool(raw_two_factor)

    if two_factor_enabled:
        # Invalidate older login challenges for this user.
        previous = (
            db.query(OTPRequest)
            .filter(
                OTPRequest.user_id == u.id,
                OTPRequest.purpose == "login_2fa",
                OTPRequest.verified == False,
            )
            .all()
        )
        for item in previous:
            item.verified = True

        otp = generate_otp()
        challenge = OTPRequest(
            purpose="login_2fa",
            channel="email",
            target=u.email,
            user_id=u.id,
            otp_hash=otp_digest(otp),
            expires_at=utc_now() + timedelta(minutes=settings.otp_expire_minutes),
            attempts=0,
            verified=False,
        )
        db.add(challenge)
        db.flush()

        body = (
            f"Hello {u.name},\n\n"
            f"Your FleetDoc login verification code is:\n\n"
            f"{otp}\n\n"
            f"This code expires in {settings.otp_expire_minutes} minutes.\n\n"
            f"If you did not attempt to sign in, please secure your account.\n\n"
            f"Regards,\nFleetDoc"
        )
        try:
            # Login 2FA always uses real email delivery.
            # There is intentionally NO development OTP fallback here.
            send_email(
                u.email,
                "FleetDoc Login Verification Code",
                body,
            )
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=502,
                detail=(
                    "Unable to send the 2FA verification code to your email. "
                    "Please check the SMTP configuration and try again."
                ),
            ) from exc

        db.add(
            AuditLog(
                user_id=u.id,
                action="login_2fa_requested",
                entity="Authentication",
                entity_id=str(u.id),
                details={"channel": "email"},
            )
        )
        db.commit()

        return {
            "requires_2fa": True,
            "challenge_id": challenge.id,
            "message": "A verification code has been sent to your registered email.",
            "expires_at": challenge.expires_at.isoformat(),
        }

    db.add(
        AuditLog(
            user_id=u.id,
            action="login",
            entity="Authentication",
            entity_id=str(u.id),
            details={"two_factor": False},
        )
    )
    db.commit()

    return {
        "access_token": create_access_token(u.id),
        "refresh_token": create_refresh_token(u.id),
        "token_type": "bearer",
        "user": public_user(u),
    }


# ============================================================
# LOGIN - VERIFY 2FA
# ============================================================

@router.post(
    "/login/2fa/verify",
    operation_id="verifyLogin2FA",
    summary="Verify login 2FA OTP",
)
def verify_login_2fa(
    payload: Login2FAVerifyRequest,
    db: Session = Depends(get_db),
):
    challenge = (
        db.query(OTPRequest)
        .filter(
            OTPRequest.id == payload.challenge_id,
            OTPRequest.purpose == "login_2fa",
            OTPRequest.channel == "email",
            OTPRequest.verified == False,
        )
        .first()
    )

    if not challenge or not challenge.user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired 2FA challenge.")

    if challenge.attempts >= 5:
        challenge.verified = True
        db.commit()
        raise HTTPException(status_code=400, detail="Too many incorrect verification attempts. Please sign in again.")

    expires_at = challenge.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < utc_now():
        challenge.verified = True
        db.commit()
        raise HTTPException(status_code=400, detail="The 2FA code has expired. Please sign in again.")

    if challenge.otp_hash != otp_digest(payload.otp):
        challenge.attempts += 1
        if challenge.attempts >= 5:
            challenge.verified = True
        db.commit()
        remaining = max(0, 5 - challenge.attempts)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid 2FA code. {remaining} attempt(s) remaining.",
        )

    user = db.query(User).filter(User.id == challenge.user_id).first()
    if not user or user.status != "Active" or not user.email_verified:
        challenge.verified = True
        db.commit()
        raise HTTPException(status_code=403, detail="Your account cannot complete login.")

    challenge.verified = True
    db.add(
        AuditLog(
            user_id=user.id,
            action="login_2fa_verified",
            entity="Authentication",
            entity_id=str(user.id),
            details={"channel": "email"},
        )
    )
    db.commit()

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "user": public_user(user),
    }


# ============================================================
# REFRESH
# ============================================================

@router.post("/refresh")
def refresh(
    payload: RefreshRequest,
):

    try:

        data = decode_token(
            payload.refresh_token
        )

        if data.get("type") != "refresh":
            raise ValueError()

        uid = int(data["sub"])

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token",
        )

    return {
        "access_token": create_access_token(uid),
        "token_type": "bearer",
    }


# ============================================================
# FORGOT PASSWORD - REQUEST OTP
# ============================================================

@router.post(
    "/forgot-password/request",
    operation_id="requestForgotPasswordOtp",
    summary="Send forgot-password OTP",
)
def forgot(
    payload: ForgotPasswordStart,
    db: Session = Depends(get_db),
):

    email = normalize_email(payload.email)

    u = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # The application explicitly tells the user whether the email exists.
    if not u:
        raise HTTPException(
            status_code=404,
            detail="This is not an existing email. Please contact the admin.",
        )

    # --------------------------------------------------------
    # Invalidate every previous reset OTP immediately.
    # This guarantees that after Resend, the old OTP can never
    # be accepted again.
    # --------------------------------------------------------

    invalidate_password_otps(db, u.id)
    db.commit()

    # --------------------------------------------------------
    # Generate a new OTP and store only its hash.
    # The OTP is valid for the configured reset window (3 min
    # in the production configuration).
    # --------------------------------------------------------

    otp = generate_otp()

    expires_at = (
        utc_now()
        + timedelta(
            minutes=settings.password_reset_otp_expire_minutes
        )
    )

    req = OTPRequest(
        purpose="password_reset",
        channel="email",
        target=u.email,
        user_id=u.id,
        otp_hash=otp_digest(otp),
        expires_at=expires_at,
        attempts=0,
        verified=False,
        created_at=utc_now(),
    )

    db.add(req)
    db.commit()
    db.refresh(req)

    # --------------------------------------------------------
    # Send the real OTP only to the registered email address.
    # No development OTP is returned to the frontend.
    # --------------------------------------------------------

    body = (
        f"Hello {u.name},\n\n"
        f"Your FleetDoc password reset OTP is:\n\n"
        f"{otp}\n\n"
        f"This OTP will expire in "
        f"{settings.password_reset_otp_expire_minutes} minutes.\n\n"
        f"If you did not request a password reset, "
        f"please ignore this email.\n\n"
        f"Regards,\n"
        f"FleetDoc"
    )

    try:
        send_email(
            u.email,
            "FleetDoc Password Reset OTP",
            body,
        )
    except Exception as exc:
        # Do not leave an OTP usable when delivery failed.
        req.verified = True
        db.commit()

        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to send the password reset OTP. "
                "Please check the SMTP configuration and try again."
            ),
        ) from exc

    return {
        "message": "OTP sent to your registered email.",
        "expires_at": expires_at.isoformat(),
        "expires_in_seconds": settings.password_reset_otp_expire_minutes * 60,
    }


# ============================================================
# FORGOT PASSWORD - VERIFY OTP
# ============================================================

@router.post(
    "/forgot-password/verify",
    operation_id="verifyForgotPasswordOtp",
    summary="Verify forgot-password OTP",
    description="Verifies the latest password-reset OTP sent to the registered email. OTP expires after the configured reset window.",
)
def verify_forgot_password_otp(
    payload: VerifyForgotPasswordOTP,
    db: Session = Depends(get_db),
):
    email = normalize_email(payload.email)
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="This is not an existing email. Please contact the admin.",
        )

    req = (
        db.query(OTPRequest)
        .filter(
            OTPRequest.user_id == user.id,
            OTPRequest.purpose == "password_reset",
            OTPRequest.channel == "email",
            OTPRequest.target == email,
            OTPRequest.verified == False,
        )
        .order_by(OTPRequest.created_at.desc())
        .first()
    )

    if not req:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new OTP.")

    if req.attempts >= 5:
        req.verified = True
        db.commit()
        raise HTTPException(status_code=400, detail="Too many incorrect OTP attempts. Please request a new OTP.")

    expires_at = req.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= utc_now():
        req.verified = True
        db.commit()
        raise HTTPException(status_code=400, detail="This OTP has expired. Please request a new OTP.")

    if req.otp_hash != otp_digest(payload.otp):
        req.attempts += 1
        if req.attempts >= 5:
            req.verified = True
        db.commit()
        remaining = max(0, 5 - req.attempts)
        if remaining == 0:
            raise HTTPException(status_code=400, detail="Too many incorrect OTP attempts. Please request a new OTP.")
        raise HTTPException(status_code=400, detail=f"Invalid OTP. {remaining} attempt(s) remaining.")

    # Do not consume a valid OTP here. The reset endpoint consumes it when
    # the new password is actually saved. Resend still invalidates it.
    return {
        "verified": True,
        "message": "OTP verified successfully.",
        "expires_at": expires_at.isoformat(),
    }


# ============================================================
# FORGOT PASSWORD - RESET
# ============================================================

@router.post(
    "/forgot-password/reset",
    operation_id="resetForgotPassword",
    summary="Reset password with OTP",
)
def reset(
    payload: ResetPassword,
    db: Session = Depends(get_db),
):

    email = normalize_email(
        payload.email
    )

    u = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not u:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP or email",
        )

    target = normalize_email(
        u.email
    )

    # --------------------------------------------------------
    # Find latest valid EMAIL password-reset OTP
    #
    # IMPORTANT:
    # Phone verification is NOT checked here.
    # --------------------------------------------------------

    req = (
        db.query(OTPRequest)
        .filter(
            OTPRequest.user_id == u.id,
            OTPRequest.purpose == "password_reset",
            OTPRequest.channel == "email",
            OTPRequest.target == target,
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
            detail="Invalid or expired OTP",
        )

    # --------------------------------------------------------
    # Attempts
    # --------------------------------------------------------

    if req.attempts >= 5:

        req.verified = True

        db.commit()

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
    # OTP check
    # --------------------------------------------------------

    if req.otp_hash != otp_digest(
        payload.otp
    ):

        req.attempts += 1

        if req.attempts >= 5:
            req.verified = True

        db.commit()

        remaining = max(
            0,
            5 - req.attempts,
        )

        if remaining == 0:

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
    # OTP valid
    # --------------------------------------------------------

    req.verified = True

    # --------------------------------------------------------
    # Reset password
    #
    # NO phone verification required.
    # --------------------------------------------------------

    u.password_hash = hash_password(
        payload.new_password
    )

    db.add(
        AuditLog(
            user_id=u.id,
            action="password_reset",
            entity="User",
            entity_id=str(u.id),
        )
    )

    db.commit()

    return {
        "message": "Password reset successfully"
    }


# ============================================================
# CHANGE PASSWORD - AUTHENTICATED USER
# ============================================================

@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Change the password for the currently authenticated user.

    The current password is always verified first.  The optional
    global role permission named ``password`` is also enforced here
    so the Settings permission cannot be bypassed by calling the API
    directly.
    """

    # Admins are always allowed. Other roles must have the password
    # permission enabled in the same global role-permission settings
    # used by Settings.jsx.
    if user.role != "Admin":
        setting = (
            db.query(Setting)
            .filter(Setting.key == "global")
            .first()
        )
        role_permissions = (setting.value or {}).get(
            "rolePermissions",
        ) if setting else {}
        role_permissions = role_permissions or {}
        role_block = role_permissions.get(user.role, {})

        if not isinstance(role_block, dict) or not role_block.get("password", False):
            raise HTTPException(
                status_code=403,
                detail="Password change permission denied",
            )

    # Never allow a password change without the current password.
    if not verify_password(
        payload.current_password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current password",
        )

    # Respect the existing Strong Password Policy setting.
    setting = (
        db.query(Setting)
        .filter(Setting.key == "global")
        .first()
    )
    global_settings = setting.value or {} if setting else {}
    strong_password = bool(
        global_settings.get(
            "strongPasswordRequired",
            global_settings.get("strongPassword", True),
        )
    )

    if strong_password:
        if len(payload.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 6 characters.",
            )
        if not re.search(r"[A-Z]", payload.new_password):
            raise HTTPException(
                status_code=400,
                detail="Password must contain at least one capital letter.",
            )
        if not re.search(r"[0-9]", payload.new_password):
            raise HTTPException(
                status_code=400,
                detail="Password must contain at least one number.",
            )
        if not re.search(r"[^A-Za-z0-9]", payload.new_password):
            raise HTTPException(
                status_code=400,
                detail="Password must contain at least one special character.",
            )

    user.password_hash = hash_password(
        payload.new_password,
    )

    db.add(
        AuditLog(
            user_id=user.id,
            action="password_change",
            entity="User",
            entity_id=str(user.id),
        )
    )

    db.commit()

    return {
        "message": "Password changed successfully",
    }


# ============================================================
# LOGOUT
# ============================================================

@router.post("/logout")
def logout():

    return {
        "message": (
            "Logged out. Remove access/refresh "
            "tokens on the client."
        )
    }