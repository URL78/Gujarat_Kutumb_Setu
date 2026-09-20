from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import (
    IdentityVerifyRequest, RelationshipVerifyRequest, IncomeVerifyRequest, DocumentVerifyRequest,
    VerificationResponse, ManualVerificationCreate, ManualVerificationResponse, ManualVerificationUpdate
)
from app.services.verification_service import VerificationService
from app.api.deps import get_current_user
from app.models.models import User, FamilyMember, ManualVerification, VerificationRecord
from app.api.v1.families import check_family_access

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.get("/fetch-aadhaar/{identity_reference}")
def fetch_aadhaar_details(identity_reference: str):
    from app.services.mock_gov_service import MockGovernmentService
    res = MockGovernmentService.verify_identity(identity_reference)
    return res

@router.post("/identity", response_model=VerificationResponse)
def verify_identity(payload: IdentityVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(FamilyMember).filter(FamilyMember.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Member not found", "details": {}}})
    check_family_access(member.family, current_user)

    res = VerificationService.verify_identity(db, payload.member_id, payload.identity_reference)
    return res

@router.post("/relationship", response_model=VerificationResponse)
def verify_relationship(payload: RelationshipVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(FamilyMember).filter(FamilyMember.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Member not found", "details": {}}})
    check_family_access(member.family, current_user)

    res = VerificationService.verify_relationship(db, payload.member_id, payload.relationship_type, payload.reference_number)
    return res

@router.post("/income", response_model=VerificationResponse)
def verify_income(payload: IncomeVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(FamilyMember).filter(FamilyMember.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Member not found", "details": {}}})
    check_family_access(member.family, current_user)

    res = VerificationService.verify_income(
        db, payload.member_id, payload.financial_year, payload.income_source, payload.annual_amount, payload.certificate_number
    )
    return res

@router.post("/manual", response_model=ManualVerificationResponse)
def create_manual_verification(payload: ManualVerificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mv = VerificationService.create_manual_verification(db, payload.family_id, payload.member_id, payload.verification_type, payload.remarks)
    return mv

@router.get("/manual", response_model=List[ManualVerificationResponse])
def list_manual_verifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "CITIZEN":
        # Citizen gets own family verifications
        from app.models.models import Family
        my_fam = db.query(Family).filter(Family.family_head_id == current_user.id).first()
        if not my_fam:
            return []
        return db.query(ManualVerification).filter(ManualVerification.family_id == my_fam.id).all()
    # Officers/Admins get all
    return db.query(ManualVerification).all()

@router.get("/manual/{id}", response_model=ManualVerificationResponse)
def get_manual_verification(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mv = db.query(ManualVerification).filter(ManualVerification.id == id).first()
    if not mv:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Manual verification record not found", "details": {}}})
    return mv

@router.patch("/manual/{id}", response_model=ManualVerificationResponse)
def update_manual_verification(id: int, payload: ManualVerificationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["OFFICER", "ADMIN"]:
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Only officers or admins can process manual verifications.", "details": {}}})
    try:
        updated = VerificationService.update_manual_verification(db, id, payload.status, payload.remarks)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "UPDATE_FAILED", "message": str(e), "details": {}}})
