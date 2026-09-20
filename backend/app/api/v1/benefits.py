from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import BenefitResponse
from app.services.family_service import FamilyService
from app.api.deps import get_current_user
from app.models.models import User, Benefit, Application

router = APIRouter(prefix="/benefits", tags=["Benefits"])

@router.get("", response_model=List[BenefitResponse])
def list_benefits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "CITIZEN":
        family = FamilyService.get_family_by_user(db, current_user)
        if not family:
            return []
        app_ids = [a.id for a in db.query(Application).filter(Application.family_id == family.id).all()]
        benefits = db.query(Benefit).filter(Benefit.application_id.in_(app_ids)).all()
        return benefits
    return db.query(Benefit).all()

@router.get("/{benefit_id}", response_model=BenefitResponse)
def get_benefit(benefit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    benefit = db.query(Benefit).filter(Benefit.id == benefit_id).first()
    if not benefit:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Benefit record not found", "details": {}}})
    return benefit
