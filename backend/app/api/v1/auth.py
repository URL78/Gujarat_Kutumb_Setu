from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import SendOTPRequest, SendOTPResponse, VerifyOTPRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(payload: SendOTPRequest):
    res = AuthService.send_otp(payload.mobile)
    return res

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    try:
        res = AuthService.verify_otp_and_login(db, payload.mobile, payload.otp)
        return res
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "INVALID_OTP", "message": str(e), "details": {}}}
        )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
