import random
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.models import Family, FamilyMember, User, AuditLog
from app.schemas.schemas import FamilyCreate, FamilyMemberCreate, FamilyUpdate

class FamilyService:

    @classmethod
    def check_existing_member_identity(cls, db: Session, identity_reference: str, current_family_id: Optional[int] = None) -> Optional[FamilyMember]:
        if not identity_reference:
            return None
        query = db.query(FamilyMember).filter(
            FamilyMember.identity_reference == identity_reference,
            FamilyMember.identity_verified == True
        )
        if current_family_id:
            query = query.filter(FamilyMember.family_id != current_family_id)
        return query.first()

    @classmethod
    def create_family(cls, db: Session, user: User, data: FamilyCreate) -> Family:
        # Check if user already has an active family
        existing = db.query(Family).filter(Family.family_head_id == user.id).first()
        if existing:
            return existing

        family = Family(
            family_head_id=user.id,
            address=data.address,
            district=data.district,
            taluka=data.taluka,
            city_village=data.city_village,
            pincode=data.pincode,
            verification_status="DRAFT"
        )
        db.add(family)
        db.commit()
        db.refresh(family)

        # Audit log
        audit = AuditLog(
            actor_id=user.id,
            action="CREATE_FAMILY_DRAFT",
            entity_type="FAMILY",
            entity_id=str(family.id),
            details=f"Draft family created for head user {user.id}"
        )
        db.add(audit)
        db.commit()

        return family

    @classmethod
    def get_family_by_user(cls, db: Session, user: User) -> Optional[Family]:
        return db.query(Family).filter(Family.family_head_id == user.id).first()

    @classmethod
    def get_family_by_id(cls, db: Session, family_id: int) -> Optional[Family]:
        return db.query(Family).filter(Family.id == family_id).first()

    @classmethod
    def update_family(cls, db: Session, family: Family, data: FamilyUpdate) -> Family:
        if data.address is not None:
            family.address = data.address
        if data.district is not None:
            family.district = data.district
        if data.taluka is not None:
            family.taluka = data.taluka
        if data.city_village is not None:
            family.city_village = data.city_village
        if data.pincode is not None:
            family.pincode = data.pincode
        db.commit()
        db.refresh(family)
        return family

    @classmethod
    def add_member(cls, db: Session, family: Family, data: FamilyMemberCreate) -> FamilyMember:
        # Check if member identity reference is already attached to another family
        if data.identity_reference:
            existing_member = cls.check_existing_member_identity(db, data.identity_reference, current_family_id=family.id)
            if existing_member:
                raise ValueError(f"MEMBER_ALREADY_ASSOCIATED: Member with identity '{data.identity_reference}' already belongs to another verified family (Family ID: {existing_member.family.family_id or 'DRAFT'}).")

        # Head relationship rule
        if data.relationship.upper() == "HEAD":
            existing_head = db.query(FamilyMember).filter(FamilyMember.family_id == family.id, FamilyMember.relationship == "HEAD").first()
            if existing_head:
                raise ValueError("DUPLICATE_HEAD: Family already has a Family Head assigned.")

        member = FamilyMember(
            family_id=family.id,
            name=data.name,
            dob=data.dob,
            gender=data.gender,
            relationship=data.relationship.upper(),
            mobile=data.mobile,
            identity_reference=data.identity_reference,
            occupation=data.occupation,
            is_student=data.is_student,
            education_level=data.education_level,
            disability_status=data.disability_status,
            identity_verified=True if data.identity_reference else False,
            relationship_verified=True if data.relationship.upper() == "HEAD" else False
        )
        db.add(member)
        db.commit()
        db.refresh(member)

        # Create officer pending review ticket for member enrolment & relationship approval
        if data.relationship.upper() != "HEAD":
            from app.models.models import ManualVerification
            mv = ManualVerification(
                family_id=family.id,
                member_id=member.id,
                verification_type="MEMBER_ENROLMENT",
                status="PENDING",
                remarks=f"Member Enrolment Request: Name '{member.name}' (Relationship: {member.relationship}, Identity: {member.identity_reference or 'N/A'}). Awaiting Officer Approval."
            )
            db.add(mv)
            db.commit()

        return member

    @classmethod
    def confirm_family_and_generate_id(cls, db: Session, family: Family) -> Family:
        # Must have at least 1 member (Family Head)
        members = db.query(FamilyMember).filter(FamilyMember.family_id == family.id).all()
        if not members:
            raise ValueError("CANNOT_CONFIRM_EMPTY_FAMILY: At least 1 family member (Head) is required.")

        # Check that head identity is verified
        head_member = next((m for m in members if m.relationship == "HEAD"), members[0])
        if not head_member.identity_verified:
            raise ValueError("HEAD_IDENTITY_UNVERIFIED: Family head identity must be verified before confirming family.")

        # If family_id not already generated, generate unique Family ID
        if not family.family_id:
            rand_code = random.randint(100000, 999999)
            family.family_id = f"GJ-FAM-{rand_code}"

        family.verification_status = "VERIFIED"
        db.commit()
        db.refresh(family)

        # Audit
        audit = AuditLog(
            actor_id=family.family_head_id,
            action="GENERATE_FAMILY_ID",
            entity_type="FAMILY",
            entity_id=str(family.id),
            details=f"Generated Family ID {family.family_id}"
        )
        db.add(audit)
        db.commit()

        return family
