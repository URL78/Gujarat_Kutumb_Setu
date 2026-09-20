import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from seed import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    seed_database()
    yield

def test_auth_flow():
    # Send OTP
    res = client.post("/api/v1/auth/send-otp", json={"mobile": "9876543210"})
    assert res.status_code == 200
    assert res.json()["mock_otp"] == "123456"

    # Verify OTP
    res_verify = client.post("/api/v1/auth/verify-otp", json={"mobile": "9876543210", "otp": "123456"})
    assert res_verify.status_code == 200
    data = res_verify.json()
    assert "access_token" in data
    token = data["access_token"]

    # Get Me
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["mobile"] == "9876543210"

def test_family_and_member_flow():
    # Login as new user
    res_login = client.post("/api/v1/auth/verify-otp", json={"mobile": "9998887770", "otp": "123456"})
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Family
    res_fam = client.post("/api/v1/families", json={
        "address": "402 Royal Enclave",
        "district": "Gandhinagar",
        "taluka": "Gandhinagar",
        "city_village": "Gandhinagar",
        "pincode": "382010"
    }, headers=headers)
    assert res_fam.status_code == 200
    fam_id = res_fam.json()["id"]

    # Add Family Head member
    res_head = client.post(f"/api/v1/families/{fam_id}/members", json={
        "name": "New Head",
        "dob": "1982-06-10",
        "gender": "Male",
        "relationship": "HEAD",
        "mobile": "9998887770",
        "identity_reference": "UID-MOCK-NEW-01"
    }, headers=headers)
    assert res_head.status_code == 200
    head_member_id = res_head.json()["id"]

    # Verify Head Identity
    res_id_ver = client.post("/api/v1/verification/identity", json={
        "member_id": head_member_id,
        "identity_reference": "UID-MOCK-001"
    }, headers=headers)
    assert res_id_ver.status_code == 200
    assert res_id_ver.json()["status"] == "VERIFIED"

    # Confirm Family -> Generate Family ID
    res_confirm = client.post(f"/api/v1/families/{fam_id}/confirm", headers=headers)
    assert res_confirm.status_code == 200
    assert res_confirm.json()["family_id"].startswith("GJ-FAM-")

def test_eligibility_and_application_flow():
    # Login as existing citizen
    res_login = client.post("/api/v1/auth/verify-otp", json={"mobile": "9876543210", "otp": "123456"})
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List Schemes
    res_schemes = client.get("/api/v1/schemes", headers=headers)
    assert res_schemes.status_code == 200
    schemes = res_schemes.json()
    assert len(schemes) > 0
    scheme_id = schemes[1]["id"]

    # Evaluate Eligibility
    res_elig = client.get(f"/api/v1/schemes/{scheme_id}/eligibility", headers=headers)
    assert res_elig.status_code == 200
    elig_data = res_elig.json()
    assert elig_data["status"] in ["ELIGIBLE", "POTENTIALLY_ELIGIBLE"]

    # Create Draft Application
    res_app = client.post("/api/v1/applications", json={"scheme_id": scheme_id}, headers=headers)
    assert res_app.status_code == 200
    app_id = res_app.json()["id"]

    # Submit Application
    res_sub = client.post(f"/api/v1/applications/{app_id}/submit", headers=headers)
    assert res_sub.status_code == 200
    assert res_sub.json()["status"] == "UNDER_VERIFICATION"
