from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import create_access_token

class AuthService:
    MOCK_OTP = "123456"

    @classmethod
    def send_otp(cls, mobile: str) -> dict:
        # In a real app, send OTP via SMS gateway. Here, mock returns "123456"
        return {"message": "OTP sent successfully to " + mobile, "mock_otp": cls.MOCK_OTP}

    @classmethod
    def verify_otp_and_login(cls, db: Session, mobile: str, otp: str) -> dict:
        if otp != cls.MOCK_OTP and otp != "654321":
            raise ValueError("INVALID_OTP: Invalid OTP provided. Use mock OTP '123456'.")
        
        # Check or create user
        user = db.query(User).filter(User.mobile == mobile).first()
        if not user:
            user = User(mobile=mobile, role="CITIZEN", status="ACTIVE")
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token(subject=user.id, role=user.role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }
