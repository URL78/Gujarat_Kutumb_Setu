from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

# Authentication
class SendOTPRequest(BaseModel):
    mobile: str = Field(..., example="9876543210")

class SendOTPResponse(BaseModel):
    message: str
    mock_otp: str = "123456"

class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str = "123456"

class UserResponse(BaseModel):
    id: int
    mobile: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Income
class MemberIncomeCreate(BaseModel):
    financial_year: str = "2025-26"
    income_source: str = "Salary"
    annual_amount: float
    certificate_id: Optional[str] = None

class MemberIncomeResponse(BaseModel):
    id: int
    member_id: int
    financial_year: str
    income_source: str
    annual_amount: float
    certificate_id: Optional[str] = None
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Documents
class DocumentCreate(BaseModel):
    document_type: str
    reference_number: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    source: str = "DIGITAL_GOV"

class DocumentResponse(BaseModel):
    id: int
    member_id: int
    document_type: str
    reference_number: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    source: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Family Members
class FamilyMemberCreate(BaseModel):
    name: str
    dob: str  # YYYY-MM-DD
    gender: str
    relationship: str  # HEAD, WIFE, HUSBAND, SON, DAUGHTER, FATHER, MOTHER, OTHER
    mobile: Optional[str] = None
    identity_reference: Optional[str] = None  # e.g., UID-MOCK-001
    occupation: Optional[str] = "Private Job"
    is_student: bool = False
    education_level: Optional[str] = "HSC"
    disability_status: bool = False

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    relationship: Optional[str] = None
    mobile: Optional[str] = None
    identity_reference: Optional[str] = None
    occupation: Optional[str] = None
    is_student: Optional[bool] = None
    education_level: Optional[str] = None
    disability_status: Optional[bool] = None

class FamilyMemberResponse(BaseModel):
    id: int
    family_id: int
    name: str
    dob: str
    gender: str
    relationship: str
    mobile: Optional[str] = None
    identity_reference: Optional[str] = None
    identity_verified: bool
    relationship_verified: bool
    occupation: Optional[str] = None
    is_student: bool
    education_level: Optional[str] = None
    disability_status: bool
    created_at: datetime
    income_records: List[MemberIncomeResponse] = []
    documents: List[DocumentResponse] = []

    class Config:
        from_attributes = True

# Family
class FamilyCreate(BaseModel):
    address: str
    district: str
    taluka: str
    city_village: str
    pincode: str

class FamilyUpdate(BaseModel):
    address: Optional[str] = None
    district: Optional[str] = None
    taluka: Optional[str] = None
    city_village: Optional[str] = None
    pincode: Optional[str] = None

class FamilyResponse(BaseModel):
    id: int
    family_id: Optional[str] = None
    family_head_id: int
    address: Optional[str] = None
    district: Optional[str] = None
    taluka: Optional[str] = None
    city_village: Optional[str] = None
    pincode: Optional[str] = None
    verification_status: str
    created_at: datetime
    members: List[FamilyMemberResponse] = []

    class Config:
        from_attributes = True

# Verification
class IdentityVerifyRequest(BaseModel):
    member_id: int
    identity_reference: str  # e.g., UID-MOCK-001

class DocumentVerifyRequest(BaseModel):
    member_id: int
    document_type: str
    reference_number: str
    issue_date: Optional[str] = None

class RelationshipVerifyRequest(BaseModel):
    member_id: int
    target_member_id: Optional[int] = None
    relationship_type: str  # WIFE, SON, DAUGHTER, etc.
    reference_number: str  # e.g., MC-GJ-2026-1001, BC-GJ-2026-1002

class IncomeVerifyRequest(BaseModel):
    member_id: int
    financial_year: str = "2025-26"
    income_source: str = "Salary"
    annual_amount: float
    certificate_number: str
    issue_date: Optional[str] = None

class VerificationResponse(BaseModel):
    status: str  # VERIFIED, PENDING_VERIFICATION, REQUEST_MORE_INFORMATION, REJECTED, MISMATCH, NOT_FOUND
    message: str
    details: Optional[dict] = None

class ManualVerificationCreate(BaseModel):
    family_id: Optional[int] = None
    member_id: Optional[int] = None
    verification_type: str  # IDENTITY, RELATIONSHIP, INCOME, DOCUMENT
    remarks: Optional[str] = None

class ManualVerificationResponse(BaseModel):
    id: int
    family_id: Optional[int] = None
    member_id: Optional[int] = None
    verification_type: str
    status: str
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ManualVerificationUpdate(BaseModel):
    status: str  # APPROVED, REQUEST_MORE_INFORMATION, REJECTED
    remarks: Optional[str] = None

# Scheme & Requirements
class SchemeRequirementResponse(BaseModel):
    id: int
    scheme_id: int
    attribute: str
    operator: str
    expected_value: str
    required: bool

    class Config:
        from_attributes = True

class SchemeResponse(BaseModel):
    id: int
    name: str
    department: str
    description: str
    benefit: str
    status: str
    created_at: datetime
    requirements: List[SchemeRequirementResponse] = []

    class Config:
        from_attributes = True

# Eligibility Check
class EligibilityCheckRule(BaseModel):
    rule: str
    passed: bool
    details: Optional[str] = None

class EligibilityResponse(BaseModel):
    scheme_id: int
    scheme_name: str
    status: str  # ELIGIBLE, POTENTIALLY_ELIGIBLE, INELIGIBLE, VERIFICATION_PENDING
    checks: List[EligibilityCheckRule]
    missing_information: List[str] = []
    eligible_member_ids: List[int] = []

# Applications
class ApplicationCreate(BaseModel):
    scheme_id: int
    member_id: Optional[int] = None

class ApplicationStatusHistoryResponse(BaseModel):
    id: int
    application_id: int
    old_status: Optional[str] = None
    new_status: str
    changed_by: Optional[int] = None
    changed_at: datetime
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    application_no: str
    family_id: int
    member_id: Optional[int] = None
    scheme_id: int
    status: str
    submitted_at: Optional[datetime] = None
    created_at: datetime
    scheme_name: Optional[str] = None
    scheme_benefit: Optional[str] = None
    member_name: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: str  # SUBMITTED, UNDER_VERIFICATION, ADDITIONAL_INFORMATION_REQUIRED, UNDER_REVIEW, APPROVED, REJECTED, BENEFIT_DISBURSED
    remarks: Optional[str] = None

# Benefits
class BenefitResponse(BaseModel):
    id: int
    application_id: int
    benefit_type: str
    amount: float
    status: str
    disbursed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Notifications
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    application_id: Optional[int] = None
    type: str
    message: str
    read_status: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Standard Error Response
class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = {}

class ErrorResponse(BaseModel):
    error: ErrorDetail
