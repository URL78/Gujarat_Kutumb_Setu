from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import SchemeResponse, SchemeRequirementResponse
from app.models.models import Scheme, SchemeRequirement

router = APIRouter(prefix="/schemes", tags=["Schemes"])

@router.get("", response_model=List[SchemeResponse])
def list_schemes(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).filter(Scheme.status == "ACTIVE").all()
    return schemes

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Scheme not found", "details": {}}})
    return scheme

@router.get("/{scheme_id}/requirements", response_model=List[SchemeRequirementResponse])
def get_scheme_requirements(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Scheme not found", "details": {}}})
    return scheme.requirements
