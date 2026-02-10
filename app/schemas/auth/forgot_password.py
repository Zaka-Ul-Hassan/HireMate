# app\schemas\auth\forgot_password.py

from pydantic import BaseModel, EmailStr, Field

class ChangePasswordSchema(BaseModel):
    OldPassword : str
    NewPassword : str
    ConfirmPassword : str


class ForgotPasswordRequest(BaseModel):
    Email: EmailStr = Field(..., description="User email for password reset")


class ResetPasswordRequest(BaseModel):
    NewPassword : str = Field(...,description="New Password")
    ConfirmPassword : str = Field(..., description="Confirm New Password")