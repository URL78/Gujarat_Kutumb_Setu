import random
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import (
    Application, ApplicationStatusHistory, Benefit, Notification,
    Scheme, Family, FamilyMember, User, AuditLog
)

class ApplicationService:

    VALID_TRANSITIONS = {
        "DRAFT": ["SUBMITTED"],
        "SUBMITTED": ["UNDER_VERIFICATION", "UNDER_REVIEW", "REJECTED"],
        "UNDER_VERIFICATION": ["UNDER_REVIEW", "ADDITIONAL_INFORMATION_REQUIRED", "REJECTED"],
        "ADDITIONAL_INFORMATION_REQUIRED": ["UNDER_VERIFICATION", "SUBMITTED"],
        "UNDER_REVIEW": ["APPROVED", "REJECTED", "ADDITIONAL_INFORMATION_REQUIRED"],
        "APPROVED": ["BENEFIT_DISBURSED"],
        "REJECTED": [],
        "BENEFIT_DISBURSED": []
    }

    @classmethod
    def generate_application_no(cls) -> str:
        rand_val = random.randint(100000, 999999)
        return f"APP-GJ-2026-{rand_val}"

    @classmethod
    def create_draft_application(cls, db: Session, family_id: int, scheme_id: int, member_id: Optional[int] = None) -> Application:
        # Check scheme exists
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if not scheme:
            raise ValueError("NOT_FOUND: Scheme not found.")

        # Check duplicate active application
        query = db.query(Application).filter(
            Application.family_id == family_id,
            Application.scheme_id == scheme_id,
            Application.status.notin_(["REJECTED"])
        )
        if member_id:
            query = query.filter(Application.member_id == member_id)
        
        existing = query.first()
        if existing:
            return existing

        app_no = cls.generate_application_no()
        app = Application(
            application_no=app_no,
            family_id=family_id,
            member_id=member_id,
            scheme_id=scheme_id,
            status="DRAFT"
        )
        db.add(app)
        db.flush()

        history = ApplicationStatusHistory(
            application_id=app.id,
            old_status=None,
            new_status="DRAFT",
            remarks="Draft application initialized"
        )
        db.add(history)
        db.commit()
        db.refresh(app)

        return app

    @classmethod
    def submit_application(cls, db: Session, application_id: int, user_id: int) -> Application:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError("NOT_FOUND: Application not found.")

        if app.status != "DRAFT" and app.status != "ADDITIONAL_INFORMATION_REQUIRED":
            raise ValueError(f"INVALID_STATUS_TRANSITION: Cannot submit application currently in status '{app.status}'.")

        old_status = app.status
        app.status = "SUBMITTED"
        app.submitted_at = datetime.utcnow()
        
        history = ApplicationStatusHistory(
            application_id=app.id,
            old_status=old_status,
            new_status="SUBMITTED",
            changed_by=user_id,
            remarks="Application submitted by citizen"
        )
        db.add(history)

        # Notify citizen
        notif = Notification(
            user_id=user_id,
            application_id=app.id,
            type="APPLICATION_SUBMITTED",
            message=f"Your application {app.application_no} for scheme '{app.scheme.name}' has been successfully submitted."
        )
        db.add(notif)
        db.commit()

        # Automatically transition to UNDER_VERIFICATION for standard workflow
        cls.update_status(db, app.id, "UNDER_VERIFICATION", user_id=user_id, remarks="Automatic departmental routing to verification queue")
        db.refresh(app)
        return app

    @classmethod
    def update_status(cls, db: Session, application_id: int, new_status: str, user_id: Optional[int] = None, remarks: Optional[str] = None) -> Application:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError("NOT_FOUND: Application not found.")

        old_status = app.status
        new_status = new_status.upper()

        if new_status not in cls.VALID_TRANSITIONS.get(old_status, []):
            raise ValueError(f"INVALID_STATUS_TRANSITION: Transition from '{old_status}' to '{new_status}' is invalid.")

        app.status = new_status

        history = ApplicationStatusHistory(
            application_id=app.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=user_id,
            remarks=remarks or f"Status changed to {new_status}"
        )
        db.add(history)

        # Handle APPROVED status -> Create Benefit Record
        if new_status == "APPROVED":
            existing_benefit = db.query(Benefit).filter(Benefit.application_id == app.id).first()
            if not existing_benefit:
                benefit = Benefit(
                    application_id=app.id,
                    benefit_type=app.scheme.benefit,
                    amount=50000.0,  # Standard sample benefit amount
                    status="PENDING"
                )
                db.add(benefit)

        # Handle BENEFIT_DISBURSED status
        if new_status == "BENEFIT_DISBURSED":
            benefit = db.query(Benefit).filter(Benefit.application_id == app.id).first()
            if benefit:
                benefit.status = "DISBURSED"
                benefit.disbursed_at = datetime.utcnow()
            else:
                benefit = Benefit(
                    application_id=app.id,
                    benefit_type=app.scheme.benefit,
                    amount=50000.0,
                    status="DISBURSED",
                    disbursed_at=datetime.utcnow()
                )
                db.add(benefit)

        # Notify citizen
        family = db.query(Family).filter(Family.id == app.family_id).first()
        if family and family.family_head_id:
            notif = Notification(
                user_id=family.family_head_id,
                application_id=app.id,
                type=f"APPLICATION_{new_status}",
                message=f"Application {app.application_no} status updated to '{new_status}'. {remarks or ''}"
            )
            db.add(notif)

        db.commit()
        db.refresh(app)
        return app
