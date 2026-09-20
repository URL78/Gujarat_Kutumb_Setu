from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import FamilyMemberCreate, FamilyMemberUpdate, FamilyMemberResponse
from app.services.family_service import FamilyService
from app.api.deps import get_current_user
from app.models.models import User, Family, FamilyMember
from app.api.v1.families import check_family_access

router = APIRouter(tags=["Members"])

@router.post("/families/{family_id}/members", response_model=FamilyMemberResponse)
def add_member(family_id: int, payload: FamilyMemberCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Family not found", "details": {}}})
    check_family_access(family, current_user)
    
    try:
        member = FamilyService.add_member(db, family, payload)
        return member
    except ValueError as e:
        msg = str(e)
        code = msg.split(":")[0] if ":" in msg else "MEMBER_ADD_FAILED"
        clean_msg = msg.split(":", 1)[1].strip() if ":" in msg else msg
        raise HTTPException(status_code=400, detail={"error": {"code": code, "message": clean_msg, "details": {}}})

@router.get("/families/{family_id}/members", response_model=List[FamilyMemberResponse])
def list_members(family_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family = FamilyService.get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Family not found", "details": {}}})
    check_family_access(family, current_user)
    return family.members

@router.get("/members/{member_id}", response_model=FamilyMemberResponse)
def get_member(member_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Member not found", "details": {}}})
    check_family_access(member.family, current_user)
    return member

@router.put("/members/{member_id}", response_model=FamilyMemberResponse)
def update_member(member_id: int, payload: FamilyMemberUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Member not found", "details": {}}})
    check_family_access(member.family, current_user)

    for field, val in payload.dict(exclude_unset=True).items():
        if val is not None:
            setattr(member, field, val)

    db.commit()
    db.refresh(member)
    return member

@router.delete("/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Member not found", "details": {}}})
    check_family_access(member.family, current_user)

    db.delete(member)
    db.commit()
    return {"message": "Member deleted successfully"}
