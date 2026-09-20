from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Scheme, SchemeRequirement, Family, FamilyMember, MemberIncome

class EligibilityEngine:

    @classmethod
    def evaluate(cls, db: Session, scheme: Scheme, family: Family, target_member_id: Optional[int] = None) -> Dict[str, Any]:
        requirements = db.query(SchemeRequirement).filter(SchemeRequirement.scheme_id == scheme.id).all()
        members = db.query(FamilyMember).filter(FamilyMember.family_id == family.id).all()

        if not members:
            return {
                "scheme_id": scheme.id,
                "scheme_name": scheme.name,
                "status": "VERIFICATION_PENDING",
                "checks": [{"rule": "Family Registration", "passed": False, "details": "No family members found"}],
                "missing_information": ["Family members required"],
                "eligible_member_ids": []
            }

        checks = []
        missing_info = []
        eligible_members = []

        # Target specific member if provided, else check all eligible members
        eval_members = [m for m in members if m.id == target_member_id] if target_member_id else members

        for member in eval_members:
            member_passed = True
            member_checks = []

            # Calculate member age from DOB
            age = 0
            if member.dob:
                try:
                    birth_date = datetime.strptime(member.dob, "%Y-%m-%d")
                    today = datetime.utcnow()
                    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                except Exception:
                    age = 0

            # Calculate verified annual income for member
            incomes = db.query(MemberIncome).filter(
                MemberIncome.member_id == member.id,
                MemberIncome.verification_status == "VERIFIED"
            ).all()
            total_income = sum(i.annual_amount for i in incomes) if incomes else 0.0

            # Calculate total family income
            all_incomes = db.query(MemberIncome).filter(
                MemberIncome.member_id.in_([m.id for m in members]),
                MemberIncome.verification_status == "VERIFIED"
            ).all()
            total_family_income = sum(i.annual_amount for i in all_incomes) if all_incomes else 0.0

            # Check verification prerequisite
            if not member.identity_verified:
                member_checks.append({"rule": f"Identity Verification ({member.name})", "passed": False, "details": "Identity unverified"})
                missing_info.append(f"Identity verification pending for {member.name}")
                member_passed = False
            else:
                member_checks.append({"rule": f"Identity Verification ({member.name})", "passed": True, "details": "Identity Verified"})

            # Check each scheme requirement rule
            for req in requirements:
                attr = req.attribute.lower()
                op = req.operator
                val = req.expected_value

                passed_rule = False
                rule_desc = f"{req.attribute.capitalize()} {req.operator} {req.expected_value}"
                detail_msg = ""

                if attr == "age":
                    exp_age = int(val)
                    if op == "<": passed_rule = age < exp_age
                    elif op == "<=": passed_rule = age <= exp_age
                    elif op == ">": passed_rule = age > exp_age
                    elif op == ">=": passed_rule = age >= exp_age
                    elif op == "==": passed_rule = age == exp_age
                    detail_msg = f"Actual age: {age}"
                elif attr == "income" or attr == "annual_income":
                    exp_inc = float(val)
                    if op == "<": passed_rule = total_family_income < exp_inc
                    elif op == "<=": passed_rule = total_family_income <= exp_inc
                    elif op == ">": passed_rule = total_family_income > exp_inc
                    elif op == ">=": passed_rule = total_family_income >= exp_inc
                    detail_msg = f"Verified Family Income: ₹{total_family_income:,.2f}"
                elif attr == "is_student" or attr == "student":
                    exp_bool = val.lower() == "true"
                    passed_rule = (member.is_student == exp_bool)
                    detail_msg = f"Student status: {member.is_student}"
                elif attr == "district":
                    passed_rule = (family.district or "").lower() == val.lower()
                    detail_msg = f"District: {family.district}"
                elif attr == "gender":
                    passed_rule = (member.gender or "").lower() == val.lower()
                    detail_msg = f"Gender: {member.gender}"
                elif attr == "disability_status":
                    exp_bool = val.lower() == "true"
                    passed_rule = (member.disability_status == exp_bool)
                    detail_msg = f"Disability status: {member.disability_status}"
                else:
                    # Default true if rule unknown
                    passed_rule = True
                    detail_msg = "Rule satisfied"

                member_checks.append({"rule": f"{rule_desc} ({member.name})", "passed": passed_rule, "details": detail_msg})
                if not passed_rule:
                    member_passed = False

            if member_passed:
                eligible_members.append(member.id)
            
            checks.extend(member_checks)

        # Status determination
        if eligible_members:
            status = "ELIGIBLE"
        elif any(c["passed"] for c in checks):
            status = "POTENTIALLY_ELIGIBLE"
        else:
            status = "INELIGIBLE"

        if missing_info and status == "INELIGIBLE":
            status = "VERIFICATION_PENDING"

        return {
            "scheme_id": scheme.id,
            "scheme_name": scheme.name,
            "status": status,
            "checks": checks,
            "missing_information": list(set(missing_info)),
            "eligible_member_ids": eligible_members
        }
