from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ============================================================
# USERS
# ============================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6)
    role: str = "User"

    # New users can be created first so that an ID exists
    # for email/phone OTP verification.
    status: str = "Pending"

    photo: Optional[str] = None
    permissions: dict[str, Any] = Field(default_factory=dict)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    photo: Optional[str] = None
    permissions: Optional[dict[str, Any]] = None


# ============================================================
# AUTHENTICATION
# ============================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember: bool = False


# ============================================================
# OTP
# ============================================================

class OTPRequestIn(BaseModel):
    """
    Used when requesting an OTP.

    target is retained for compatibility with the existing
    frontend, although the backend determines the actual
    registered target from the User record.
    """
    target: str
    channel: str = "email"
    purpose: str


class OTPVerify(BaseModel):
    """
    Used when verifying an OTP.
    """
    target: str
    otp: str
    purpose: str


# ============================================================
# FORGOT PASSWORD
# ============================================================

class ForgotPasswordStart(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6)


class VerifyForgotPasswordOTP(BaseModel):
    """
    Verifies the latest password-reset OTP sent to the
    registered email address.
    """
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class ChangePasswordRequest(BaseModel):
    """Authenticated password-change request for the logged-in user."""

    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6)


class Login2FAVerifyRequest(BaseModel):
    challenge_id: int
    otp: str = Field(min_length=6, max_length=6)
    remember: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str


# ============================================================
# GENERIC DATA
# ============================================================

class GenericData(BaseModel):
    model_config = ConfigDict(extra="allow")

    data: dict[str, Any] = Field(default_factory=dict)


# ============================================================
# PERMISSIONS
# ============================================================

class PermissionUpdate(BaseModel):
    permissions: dict[str, Any]


# ============================================================
# SUBSCRIPTIONS / PAYMENTS
# ============================================================

class SubscriptionOrder(BaseModel):
    plan_id: str
    currency: str = "INR"


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    subscription_id: int


# ============================================================
# NOTIFICATION PREFERENCES
# ============================================================

class NotificationPreference(BaseModel):
    email: bool = True
    sms: bool = False
    whatsapp: bool = False
    in_app: bool = True
