from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.mock_gov_service import MockGovernmentService

router = APIRouter(prefix="/mock/government", tags=["Mock Government Services"])

class IdentityVerifyReq(BaseModel):
    identity_reference: str

class IncomeVerifyReq(BaseModel):
    certificate_number: str
    issue_date: Optional[str] = None

class EducationVerifyReq(BaseModel):
    seat_number: str
    serial_number: str
    exam_year: str

class RationVerifyReq(BaseModel):
    ration_card_number: str

class MarriageVerifyReq(BaseModel):
    certificate_number: str

class BirthVerifyReq(BaseModel):
    certificate_number: str

@router.post("/identity/verify")
def verify_identity_mock(payload: IdentityVerifyReq):
    return MockGovernmentService.verify_identity(payload.identity_reference)

@router.post("/income/verify")
def verify_income_mock(payload: IncomeVerifyReq):
    return MockGovernmentService.verify_income(payload.certificate_number)

@router.post("/education/verify")
def verify_education_mock(payload: EducationVerifyReq):
    return MockGovernmentService.verify_education(payload.seat_number, payload.serial_number, payload.exam_year)

@router.post("/ration/verify")
def verify_ration_mock(payload: RationVerifyReq):
    return MockGovernmentService.verify_ration(payload.ration_card_number)

@router.post("/marriage/verify")
def verify_marriage_mock(payload: MarriageVerifyReq):
    return MockGovernmentService.verify_marriage(payload.certificate_number)

@router.post("/birth/verify")
def verify_birth_mock(payload: BirthVerifyReq):
    return MockGovernmentService.verify_birth(payload.certificate_number)
