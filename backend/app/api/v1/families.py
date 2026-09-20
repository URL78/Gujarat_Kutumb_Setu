from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import FamilyCreate, FamilyUpdate, FamilyResponse
from app.services.family_service import FamilyService
from app.api.deps import get_current_user
from app.models.models import User, Family

router = APIRouter(prefix="/families", tags=["Families"])

def check_family_access(family: Family, user: User):
    if user.role != "OFFICER" and user.role != "ADMIN" and family.family_head_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": {"code": "FORBIDDEN", "message": "You are not authorized to access or modify this family profile.", "details": {}}}
        )

@router.post("", response_model=FamilyResponse)
def create_family(payload: FamilyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.create_family(db, current_user, payload)
    return family

@router.get("/me", response_model=Optional[FamilyResponse])
def get_my_family(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.get_family_by_user(db, current_user)
    return family

@router.get("/{family_id}", response_model=FamilyResponse)
def get_family(family_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Family not found", "details": {}}})
    check_family_access(family, current_user)
    return family

@router.put("/{family_id}", response_model=FamilyResponse)
def update_family(family_id: int, payload: FamilyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Family not found", "details": {}}})
    check_family_access(family, current_user)
    updated = FamilyService.update_family(db, family, payload)
    return updated

@router.post("/{family_id}/confirm", response_model=FamilyResponse)
def confirm_family(family_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Family not found", "details": {}}})
    check_family_access(family, current_user)
    try:
        confirmed = FamilyService.confirm_family_and_generate_id(db, family)
        return confirmed
    except ValueError as e:
        msg = str(e)
        code = msg.split(":")[0] if ":" in msg else "CONFIRMATION_FAILED"
        clean_msg = msg.split(":", 1)[1].strip() if ":" in msg else msg
        raise HTTPException(status_code=400, detail={"error": {"code": code, "message": clean_msg, "details": {}}})
