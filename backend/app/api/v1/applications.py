from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import (
    ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate, ApplicationStatusHistoryResponse
)
from app.services.application_service import ApplicationService
from app.services.family_service import FamilyService
from app.api.deps import get_current_user
from app.models.models import User, Application, Family

router = APIRouter(prefix="/applications", tags=["Applications"])

def enrich_app_response(app: Application) -> ApplicationResponse:
    return ApplicationResponse(
        id=app.id,
        application_no=app.application_no,
        family_id=app.family_id,
        member_id=app.member_id,
        scheme_id=app.scheme_id,
        status=app.status,
        submitted_at=app.submitted_at,
        created_at=app.created_at,
        scheme_name=app.scheme.name if app.scheme else None,
        scheme_benefit=app.scheme.benefit if app.scheme else None,
        member_name=app.member.name if app.member else "Family Level"
    )

@router.post("", response_model=ApplicationResponse)
def create_draft_application(payload: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.get_family_by_user(db, current_user)
    if not family:
        raise HTTPException(status_code=400, detail={"error": {"code": "FAMILY_NOT_REGISTERED", "message": "Please register your family first.", "details": {}}})

    try:
        app = ApplicationService.create_draft_application(db, family.id, payload.scheme_id, payload.member_id)
        return enrich_app_response(app)
    except ValueError as e:
        msg = str(e)
        code = msg.split(":")[0] if ":" in msg else "APPLICATION_FAILED"
        clean_msg = msg.split(":", 1)[1].strip() if ":" in msg else msg
        raise HTTPException(status_code=400, detail={"error": {"code": code, "message": clean_msg, "details": {}}})

@router.get("", response_model=List[ApplicationResponse])
def list_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "CITIZEN":
        family = FamilyService.get_family_by_user(db, current_user)
        if not family:
            return []
        apps = db.query(Application).filter(Application.family_id == family.id).all()
        return [enrich_app_response(a) for a in apps]
    # Officers/Admins
    apps = db.query(Application).all()
    return [enrich_app_response(a) for a in apps]

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Application not found", "details": {}}})
    return enrich_app_response(app)

@router.post("/{application_id}/submit", response_model=ApplicationResponse)
def submit_application(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        app = ApplicationService.submit_application(db, application_id, current_user.id)
        return enrich_app_response(app)
    except ValueError as e:
        msg = str(e)
        code = msg.split(":")[0] if ":" in msg else "SUBMIT_FAILED"
        clean_msg = msg.split(":", 1)[1].strip() if ":" in msg else msg
        raise HTTPException(status_code=400, detail={"error": {"code": code, "message": clean_msg, "details": {}}})

@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(application_id: int, payload: ApplicationStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        app = ApplicationService.update_status(db, application_id, payload.status, user_id=current_user.id, remarks=payload.remarks)
        return enrich_app_response(app)
    except ValueError as e:
        msg = str(e)
        code = msg.split(":")[0] if ":" in msg else "UPDATE_FAILED"
        clean_msg = msg.split(":", 1)[1].strip() if ":" in msg else msg
        raise HTTPException(status_code=400, detail={"error": {"code": code, "message": clean_msg, "details": {}}})

@router.get("/{application_id}/history", response_model=List[ApplicationStatusHistoryResponse])
def get_application_history(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Application not found", "details": {}}})
    return app.status_history
