from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import EligibilityResponse
from app.services.eligibility_engine import EligibilityEngine
from app.services.family_service import FamilyService
from app.api.deps import get_current_user
from app.models.models import User, Scheme, Family

router = APIRouter(prefix="/schemes", tags=["Eligibility"])

@router.get("/{scheme_id}/eligibility", response_model=EligibilityResponse)
def evaluate_eligibility(scheme_id: int, member_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Scheme not found", "details": {}}})

    family = FamilyService.get_family_by_user(db, current_user)
    if not family:
        raise HTTPException(status_code=400, detail={"error": {"code": "FAMILY_NOT_REGISTERED", "message": "Please register your family first before checking eligibility.", "details": {}}})

    result = EligibilityEngine.evaluate(db, scheme, family, target_member_id=member_id)
    return result
