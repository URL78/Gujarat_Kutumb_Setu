from typing import Dict, Any

class MockGovernmentService:
    # Mock Database of Government Records
    MOCK_IDENTITIES = {
        "UID-MOCK-001": {"name": "ABC", "dob": "1970-04-15", "gender": "Male", "address": "101 Green Park, Vastrapur, Ahmedabad"},
        "UID-MOCK-002": {"name": "Alice", "dob": "1975-08-20", "gender": "Female", "address": "101 Green Park, Vastrapur, Ahmedabad"},
        "UID-MOCK-003": {"name": "Bob", "dob": "2004-11-10", "gender": "Male", "address": "101 Green Park, Vastrapur, Ahmedabad"},
    }

    MOCK_INCOME_CERTS = {
        "INC-MOCK-001": {"name": "ABC", "annual_income": 400000.0, "financial_year": "2025-26", "issue_date": "2025-04-10", "issuing_authority": "Revenue Dept, Ahmedabad"},
        "INC-MOCK-002": {"name": "Alice", "annual_income": 200000.0, "financial_year": "2025-26", "issue_date": "2025-04-12", "issuing_authority": "Revenue Dept, Ahmedabad"},
        "INC-MOCK-003": {"name": "Bob", "annual_income": 0.0, "financial_year": "2025-26", "issue_date": "2025-04-15", "issuing_authority": "Revenue Dept, Ahmedabad"},
    }

    MOCK_EDUCATION_RESULTS = {
        "SEAT12345": {"serial_number": "SER9876", "exam_year": "2025", "candidate_name": "Bob", "board": "GSEB HSC", "status": "PASSED", "percentile": 92.5}
    }

    MOCK_RATION_CARDS = {
        "RC-GJ-102938": {
            "head_name": "ABC",
            "district": "Ahmedabad",
            "members": [
                {"name": "ABC", "relationship": "HEAD"},
                {"name": "Alice", "relationship": "WIFE"},
                {"name": "Bob", "relationship": "SON"}
            ]
        }
    }

    MOCK_MARRIAGE_CERTS = {
        "MC-GJ-2026-1001": {"husband_name": "ABC", "wife_name": "Alice", "registration_date": "1998-05-12", "district": "Ahmedabad"}
    }

    MOCK_BIRTH_CERTS = {
        "BC-GJ-2026-1002": {"child_name": "Bob", "father_name": "ABC", "mother_name": "Alice", "dob": "2004-11-10", "registration_date": "2004-11-15"}
    }

    @classmethod
    def verify_identity(cls, identity_reference: str) -> Dict[str, Any]:
        ref_clean = identity_reference.strip().upper()
        record = cls.MOCK_IDENTITIES.get(ref_clean)
        if record:
            return {"verified": True, "record": record}
        
        # Dynamic fallback for any valid Aadhaar/Identity reference string
        if len(ref_clean) >= 4:
            dynamic_record = {
                "name": f"Verified Resident ({ref_clean[-4:]})",
                "dob": "1998-06-15",
                "gender": "Male",
                "address": "District Revenue Registry, Gujarat"
            }
            return {"verified": True, "record": dynamic_record}

        return {"verified": False, "error": "NOT_FOUND", "message": f"Identity reference '{identity_reference}' not found in government e-KYC registry."}

    @classmethod
    def verify_income(cls, certificate_number: str) -> Dict[str, Any]:
        record = cls.MOCK_INCOME_CERTS.get(certificate_number.strip().upper())
        if record:
            return {"verified": True, "record": record}
        return {"verified": False, "error": "NOT_FOUND", "message": f"Income Certificate '{certificate_number}' not found in Revenue portal."}

    @classmethod
    def verify_education(cls, seat_number: str, serial_number: str, exam_year: str) -> Dict[str, Any]:
        record = cls.MOCK_EDUCATION_RESULTS.get(seat_number.strip().upper())
        if record and record["serial_number"] == serial_number.strip().upper():
            return {"verified": True, "record": record}
        return {"verified": False, "error": "NOT_FOUND", "message": "Education result record not found for given details."}

    @classmethod
    def verify_ration(cls, ration_card_number: str) -> Dict[str, Any]:
        record = cls.MOCK_RATION_CARDS.get(ration_card_number.strip().upper())
        if record:
            return {"verified": True, "record": record}
        return {"verified": False, "error": "NOT_FOUND", "message": f"Ration card '{ration_card_number}' not found."}

    @classmethod
    def verify_marriage(cls, certificate_number: str) -> Dict[str, Any]:
        record = cls.MOCK_MARRIAGE_CERTS.get(certificate_number.strip().upper())
        if record:
            return {"verified": True, "record": record}
        return {"verified": False, "error": "NOT_FOUND", "message": f"Marriage Certificate '{certificate_number}' not found."}

    @classmethod
    def verify_birth(cls, certificate_number: str) -> Dict[str, Any]:
        record = cls.MOCK_BIRTH_CERTS.get(certificate_number.strip().upper())
        if record:
            return {"verified": True, "record": record}
        return {"verified": False, "error": "NOT_FOUND", "message": f"Birth Certificate '{certificate_number}' not found."}
