from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import FamilyMember, Document, VerificationRecord, MemberIncome, ManualVerification, AuditLog
from app.services.mock_gov_service import MockGovernmentService

class VerificationService:

    @classmethod
    def verify_identity(cls, db: Session, member_id: int, identity_reference: str) -> Dict[str, Any]:
        member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
        if not member:
            raise ValueError("NOT_FOUND: Family member not found.")

        result = MockGovernmentService.verify_identity(identity_reference)
        if result.get("verified"):
            rec = result["record"]
            member.identity_reference = identity_reference
            member.identity_verified = True
            
            # Document record
            doc = Document(
                member_id=member.id,
                document_type="IDENTITY_CARD",
                reference_number=identity_reference,
                source="DIGITAL_GOV",
                status="VERIFIED"
            )
            db.add(doc)
            db.flush()

            ver_rec = VerificationRecord(
                document_id=doc.id,
                member_id=member.id,
                verification_method="AUTOMATED_MOCK",
                verification_status="VERIFIED",
                verification_source="MOCK_IDENTITY_SERVICE",
                verified_at=datetime.utcnow()
            )
            db.add(ver_rec)
            db.commit()
            db.refresh(member)

            return {
                "status": "VERIFIED",
                "message": f"Identity verified for {rec['name']}.",
                "details": rec
            }
        else:
            # Identity verification failed, record failure and prompt manual review fallback
            member.identity_verified = False
            ver_rec = VerificationRecord(
                member_id=member.id,
                verification_method="AUTOMATED_MOCK",
                verification_status="MISMATCH",
                verification_source="MOCK_IDENTITY_SERVICE",
                failure_reason=result.get("message", "Identity record mismatch")
            )
            db.add(ver_rec)
            db.commit()

            return {
                "status": "MISMATCH",
                "message": result.get("message", "Identity verification failed."),
                "details": {"fallback": "You can request manual verification by uploading supporting documents."}
            }

    @classmethod
    def verify_relationship(cls, db: Session, member_id: int, relationship_type: str, reference_number: str) -> Dict[str, Any]:
        member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
        if not member:
            raise ValueError("NOT_FOUND: Family member not found.")

        relationship_type = relationship_type.upper()
        verified = False
        details = {}

        if relationship_type in ["WIFE", "HUSBAND"]:
            res = MockGovernmentService.verify_marriage(reference_number)
            if res.get("verified"):
                verified = True
                details = res["record"]
        elif relationship_type in ["SON", "DAUGHTER"]:
            res = MockGovernmentService.verify_birth(reference_number)
            if res.get("verified"):
                verified = True
                details = res["record"]
        else:
            # Try Ration Card check
            res = MockGovernmentService.verify_ration(reference_number)
            if res.get("verified"):
                verified = True
                details = res["record"]

        if verified:
            member.relationship_verified = True
            doc = Document(
                member_id=member.id,
                document_type=f"RELATIONSHIP_{relationship_type}",
                reference_number=reference_number,
                source="DIGITAL_GOV",
                status="VERIFIED"
            )
            db.add(doc)
            db.flush()

            ver_rec = VerificationRecord(
                document_id=doc.id,
                member_id=member.id,
                verification_method="AUTOMATED_MOCK",
                verification_status="VERIFIED",
                verification_source="MOCK_GOV_RECORD",
                verified_at=datetime.utcnow()
            )
            db.add(ver_rec)
            db.commit()
            db.refresh(member)

            return {
                "status": "VERIFIED",
                "message": f"Relationship '{relationship_type}' successfully verified via reference record.",
                "details": details
            }
        else:
            member.relationship_verified = False
            db.commit()
            return {
                "status": "MISMATCH",
                "message": f"Could not verify relationship reference '{reference_number}'. Manual fallback available.",
                "details": {}
            }

    @classmethod
    def verify_income(cls, db: Session, member_id: int, financial_year: str, income_source: str, annual_amount: float, certificate_number: str) -> Dict[str, Any]:
        member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
        if not member:
            raise ValueError("NOT_FOUND: Member not found.")

        res = MockGovernmentService.verify_income(certificate_number)
        status = "VERIFIED" if res.get("verified") else "UNVERIFIED"

        income_rec = MemberIncome(
            member_id=member.id,
            financial_year=financial_year,
            income_source=income_source,
            annual_amount=annual_amount if res.get("verified") else annual_amount,
            certificate_id=certificate_number,
            verification_status=status
        )
        db.add(income_rec)
        db.flush()

        if res.get("verified"):
            doc = Document(
                member_id=member.id,
                document_type="INCOME_CERTIFICATE",
                reference_number=certificate_number,
                source="DIGITAL_GOV",
                status="VERIFIED"
            )
            db.add(doc)
            db.flush()

            ver_rec = VerificationRecord(
                document_id=doc.id,
                member_id=member.id,
                verification_method="AUTOMATED_MOCK",
                verification_status="VERIFIED",
                verification_source="REVENUE_DEPARTMENT",
                verified_at=datetime.utcnow()
            )
            db.add(ver_rec)

        db.commit()
        db.refresh(income_rec)

        return {
            "status": status,
            "message": f"Income record {'verified' if status == 'VERIFIED' else 'added as unverified'}.",
            "details": res.get("record", {})
        }

    @classmethod
    def create_manual_verification(cls, db: Session, family_id: Optional[int], member_id: Optional[int], verification_type: str, remarks: Optional[str]) -> ManualVerification:
        mv = ManualVerification(
            family_id=family_id,
            member_id=member_id,
            verification_type=verification_type,
            status="PENDING",
            remarks=remarks
        )
        db.add(mv)
        db.commit()
        db.refresh(mv)
        return mv

    @classmethod
    def update_manual_verification(cls, db: Session, mv_id: int, status: str, remarks: Optional[str]) -> ManualVerification:
        mv = db.query(ManualVerification).filter(ManualVerification.id == mv_id).first()
        if not mv:
            raise ValueError("NOT_FOUND: Manual verification record not found.")

        mv.status = status
        if remarks:
            mv.remarks = remarks
        
        if status == "APPROVED":
            if mv.member_id:
                member = db.query(FamilyMember).filter(FamilyMember.id == mv.member_id).first()
                if member:
                    member.identity_verified = True
                    member.relationship_verified = True
                    for inc in member.income_records:
                        inc.verification_status = "VERIFIED"
        
        db.commit()
        db.refresh(mv)
        return mv
