from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship as orm_relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="CITIZEN", nullable=False)  # CITIZEN, OFFICER, ADMIN
    status = Column(String, default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    families_headed = orm_relationship("Family", back_populates="family_head", foreign_keys="Family.family_head_id")
    notifications = orm_relationship("Notification", back_populates="user")
    audit_logs = orm_relationship("AuditLog", back_populates="actor")

class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(String, unique=True, index=True, nullable=True)  # e.g., GJ-FAM-102938
    family_head_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address = Column(String, nullable=True)
    district = Column(String, nullable=True)
    taluka = Column(String, nullable=True)
    city_village = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    verification_status = Column(String, default="DRAFT", nullable=False) # DRAFT, PENDING_VERIFICATION, VERIFIED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    family_head = orm_relationship("User", back_populates="families_headed", foreign_keys=[family_head_id])
    members = orm_relationship("FamilyMember", back_populates="family", cascade="all, delete-orphan")
    applications = orm_relationship("Application", back_populates="family")
    manual_verifications = orm_relationship("ManualVerification", back_populates="family")

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    name = Column(String, nullable=False)
    dob = Column(String, nullable=False)  # YYYY-MM-DD
    gender = Column(String, nullable=False)  # Male, Female, Other
    relationship = Column(String, nullable=False)  # HEAD, WIFE, HUSBAND, SON, DAUGHTER, FATHER, MOTHER, OTHER
    mobile = Column(String, nullable=True)
    identity_reference = Column(String, nullable=True)  # e.g., UID-MOCK-001
    identity_verified = Column(Boolean, default=False)
    relationship_verified = Column(Boolean, default=False)
    occupation = Column(String, nullable=True)
    is_student = Column(Boolean, default=False)
    education_level = Column(String, nullable=True)
    disability_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    family = orm_relationship("Family", back_populates="members")
    documents = orm_relationship("Document", back_populates="member", cascade="all, delete-orphan")
    income_records = orm_relationship("MemberIncome", back_populates="member", cascade="all, delete-orphan")
    applications = orm_relationship("Application", back_populates="member")
    manual_verifications = orm_relationship("ManualVerification", back_populates="member")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=False)
    document_type = Column(String, nullable=False)  # INCOME_CERTIFICATE, EDUCATION_RESULT, RATION_CARD, BIRTH_CERTIFICATE, MARRIAGE_CERTIFICATE
    reference_number = Column(String, nullable=False)
    issue_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    source = Column(String, default="DIGITAL_GOV")  # DIGITAL_GOV, UPLOADED
    status = Column(String, default="PENDING_VERIFICATION")  # VERIFIED, PENDING_VERIFICATION, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    member = orm_relationship("FamilyMember", back_populates="documents")
    verification_records = orm_relationship("VerificationRecord", back_populates="document", cascade="all, delete-orphan")

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    verification_method = Column(String, nullable=False)  # AUTOMATED_MOCK, MANUAL_OFFICER
    verification_status = Column(String, nullable=False)  # VERIFIED, PENDING_VERIFICATION, REQUEST_MORE_INFORMATION, REJECTED, NOT_FOUND, MISMATCH, EXPIRED
    verification_source = Column(String, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    failure_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = orm_relationship("Document", back_populates="verification_records")

class ManualVerification(Base):
    __tablename__ = "manual_verifications"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    verification_type = Column(String, nullable=False)  # IDENTITY, RELATIONSHIP, INCOME, DOCUMENT
    status = Column(String, default="PENDING", nullable=False)  # PENDING, APPROVED, REQUEST_MORE_INFORMATION, REJECTED
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    family = orm_relationship("Family", back_populates="manual_verifications")
    member = orm_relationship("FamilyMember", back_populates="manual_verifications")

class MemberIncome(Base):
    __tablename__ = "member_income"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=False)
    financial_year = Column(String, nullable=False)  # e.g., "2025-26"
    income_source = Column(String, nullable=False)  # Salary, Business, Agriculture, Other
    annual_amount = Column(Float, nullable=False, default=0.0)
    certificate_id = Column(String, nullable=True)
    verification_status = Column(String, default="UNVERIFIED")  # VERIFIED, PENDING_VERIFICATION, UNVERIFIED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    member = orm_relationship("FamilyMember", back_populates="income_records")

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    benefit = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requirements = orm_relationship("SchemeRequirement", back_populates="scheme", cascade="all, delete-orphan")
    applications = orm_relationship("Application", back_populates="scheme")

class SchemeRequirement(Base):
    __tablename__ = "scheme_requirements"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    attribute = Column(String, nullable=False)  # age, income, is_student, district, gender, education_level
    operator = Column(String, nullable=False)  # <, <=, >, >=, ==, !=
    expected_value = Column(String, nullable=False)
    required = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scheme = orm_relationship("Scheme", back_populates="requirements")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    application_no = Column(String, unique=True, index=True, nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    status = Column(String, default="DRAFT", nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    family = orm_relationship("Family", back_populates="applications")
    member = orm_relationship("FamilyMember", back_populates="applications")
    scheme = orm_relationship("Scheme", back_populates="applications")
    status_history = orm_relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan")
    benefits = orm_relationship("Benefit", back_populates="application", cascade="all, delete-orphan")

class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow)
    remarks = Column(String, nullable=True)

    application = orm_relationship("Application", back_populates="status_history")

class Benefit(Base):
    __tablename__ = "benefits"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    benefit_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="DISBURSED", nullable=False)  # PENDING, DISBURSED, CANCELLED
    disbursed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    application = orm_relationship("Application", back_populates="benefits")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = orm_relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

    actor = orm_relationship("User", back_populates="audit_logs")
