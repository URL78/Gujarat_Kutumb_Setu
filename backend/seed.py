import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from app.core.database import SessionLocal, Base, engine
from app.models.models import (
    User, Family, FamilyMember, Document, VerificationRecord, MemberIncome,
    Scheme, SchemeRequirement, Application, ApplicationStatusHistory, Benefit, Notification, AuditLog
)

def seed_database():
    print("Initializing Database Seed Process...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing tables for clean seed
        db.query(AuditLog).delete()
        db.query(Notification).delete()
        db.query(Benefit).delete()
        db.query(ApplicationStatusHistory).delete()
        db.query(Application).delete()
        db.query(SchemeRequirement).delete()
        db.query(Scheme).delete()
        db.query(MemberIncome).delete()
        db.query(VerificationRecord).delete()
        db.query(Document).delete()
        db.query(FamilyMember).delete()
        db.query(Family).delete()
        db.query(User).delete()
        db.commit()

        # 1. Create Users
        citizen_user = User(mobile="9876543210", role="CITIZEN", status="ACTIVE")
        officer_user = User(mobile="9000000001", role="OFFICER", status="ACTIVE")
        admin_user = User(mobile="9000000002", role="ADMIN", status="ACTIVE")
        db.add_all([citizen_user, officer_user, admin_user])
        db.commit()
        db.refresh(citizen_user)

        print(f"Users created: Citizen ID={citizen_user.id} ({citizen_user.mobile})")

        # 2. Create Schemes
        scheme1 = Scheme(
            name="Mukhyamantri Yuva Swavalamban Yojana (MYSY)",
            department="Higher Education Department",
            description="Financial assistance for meritorious students pursuing higher education in Gujarat.",
            benefit="Up to ₹50,000 per annum scholarship and tuition fee waiver",
            status="ACTIVE"
        )
        scheme2 = Scheme(
            name="Chief Minister Apprentice Scheme",
            department="Labour and Employment Department",
            description="Stipend support for young graduates and diploma holders acquiring workplace skills.",
            benefit="Monthly stipend of ₹3,000 - ₹4,500",
            status="ACTIVE"
        )
        scheme3 = Scheme(
            name="Gujarat Food & Income Support Scheme",
            department="Food, Civil Supplies & Consumer Affairs",
            description="Subsidized essential commodities and financial relief for low-income families.",
            benefit="Subsidized food grains & annual relief grant of ₹12,000",
            status="ACTIVE"
        )
        db.add_all([scheme1, scheme2, scheme3])
        db.commit()

        # Scheme Requirements
        reqs = [
            SchemeRequirement(scheme_id=scheme1.id, attribute="age", operator="<", expected_value="25", required=True),
            SchemeRequirement(scheme_id=scheme1.id, attribute="income", operator="<", expected_value="500000", required=True),
            SchemeRequirement(scheme_id=scheme1.id, attribute="is_student", operator="==", expected_value="true", required=True),
            
            SchemeRequirement(scheme_id=scheme2.id, attribute="age", operator="<=", expected_value="30", required=True),
            SchemeRequirement(scheme_id=scheme2.id, attribute="is_student", operator="==", expected_value="true", required=True),
            
            SchemeRequirement(scheme_id=scheme3.id, attribute="income", operator="<=", expected_value="650000", required=True),
        ]
        db.add_all(reqs)
        db.commit()
        print("Government schemes and eligibility rules created.")

        # 3. Create Demo Family
        demo_family = Family(
            family_id="GJ-FAM-102938",
            family_head_id=citizen_user.id,
            address="101 Green Park, Vastrapur",
            district="Ahmedabad",
            taluka="Ahmedabad City",
            city_village="Ahmedabad",
            pincode="380015",
            verification_status="VERIFIED"
        )
        db.add(demo_family)
        db.commit()
        db.refresh(demo_family)

        # 4. Create Family Members (ABC - Head, Alice - Wife, Bob - Son)
        head_member = FamilyMember(
            family_id=demo_family.id,
            name="ABC",
            dob="1970-04-15",
            gender="Male",
            relationship="HEAD",
            mobile="9876543210",
            identity_reference="UID-MOCK-001",
            identity_verified=True,
            relationship_verified=True,
            occupation="Salaried Employee",
            is_student=False,
            education_level="Graduate"
        )
        wife_member = FamilyMember(
            family_id=demo_family.id,
            name="Alice",
            dob="1975-08-20",
            gender="Female",
            relationship="WIFE",
            mobile="9876543211",
            identity_reference="UID-MOCK-002",
            identity_verified=True,
            relationship_verified=True,
            occupation="Self Employed",
            is_student=False,
            education_level="Graduate"
        )
        son_member = FamilyMember(
            family_id=demo_family.id,
            name="Bob",
            dob="2004-11-10",
            gender="Male",
            relationship="SON",
            mobile="9876543212",
            identity_reference="UID-MOCK-003",
            identity_verified=True,
            relationship_verified=True,
            occupation="Student",
            is_student=True,
            education_level="Undergraduate (Engineering)"
        )
        db.add_all([head_member, wife_member, son_member])
        db.commit()
        db.refresh(head_member)
        db.refresh(wife_member)
        db.refresh(son_member)

        # 5. Income Records
        inc1 = MemberIncome(member_id=head_member.id, financial_year="2025-26", income_source="Salary", annual_amount=400000.0, certificate_id="INC-MOCK-001", verification_status="VERIFIED")
        inc2 = MemberIncome(member_id=wife_member.id, financial_year="2025-26", income_source="Business", annual_amount=200000.0, certificate_id="INC-MOCK-002", verification_status="VERIFIED")
        inc3 = MemberIncome(member_id=son_member.id, financial_year="2025-26", income_source="None", annual_amount=0.0, certificate_id="INC-MOCK-003", verification_status="VERIFIED")
        db.add_all([inc1, inc2, inc3])

        # Documents & Verifications
        doc1 = Document(member_id=head_member.id, document_type="IDENTITY_CARD", reference_number="UID-MOCK-001", source="DIGITAL_GOV", status="VERIFIED")
        doc2 = Document(member_id=wife_member.id, document_type="MARRIAGE_CERTIFICATE", reference_number="MC-GJ-2026-1001", source="DIGITAL_GOV", status="VERIFIED")
        doc3 = Document(member_id=son_member.id, document_type="EDUCATION_RESULT", reference_number="SEAT12345", source="DIGITAL_GOV", status="VERIFIED")
        db.add_all([doc1, doc2, doc3])
        db.commit()

        # 6. Sample Applications & Benefits
        app1 = Application(
            application_no="APP-GJ-2026-100892",
            family_id=demo_family.id,
            member_id=son_member.id,
            scheme_id=scheme1.id,
            status="BENEFIT_DISBURSED",
            submitted_at=datetime.utcnow()
        )
        db.add(app1)
        db.commit()
        db.refresh(app1)

        hist1 = ApplicationStatusHistory(application_id=app1.id, old_status="DRAFT", new_status="SUBMITTED", changed_by=citizen_user.id, remarks="Submitted online")
        hist2 = ApplicationStatusHistory(application_id=app1.id, old_status="SUBMITTED", new_status="UNDER_VERIFICATION", changed_by=officer_user.id, remarks="Auto-routed for document verification")
        hist3 = ApplicationStatusHistory(application_id=app1.id, old_status="UNDER_VERIFICATION", new_status="APPROVED", changed_by=officer_user.id, remarks="Eligibility verified and approved")
        hist4 = ApplicationStatusHistory(application_id=app1.id, old_status="APPROVED", new_status="BENEFIT_DISBURSED", changed_by=admin_user.id, remarks="Disbursed to bank account ending in 4921")
        db.add_all([hist1, hist2, hist3, hist4])

        bft1 = Benefit(
            application_id=app1.id,
            benefit_type="MYSY Scholarship Grant",
            amount=50000.0,
            status="DISBURSED",
            disbursed_at=datetime.utcnow()
        )
        db.add(bft1)

        notif1 = Notification(
            user_id=citizen_user.id,
            application_id=app1.id,
            type="BENEFIT_DISBURSED",
            message="Your benefit of ₹50,000 for MYSY Scheme has been successfully disbursed to your bank account."
        )
        db.add(notif1)

        db.commit()
        print("Database Seed completed successfully! Demo Family ID: GJ-FAM-102938")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
