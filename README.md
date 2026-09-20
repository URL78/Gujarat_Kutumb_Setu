# Gujarat Kutumb Setu (ગુજરાત કુટુંબ સેતુ)
### Family Identification & Unified Scheme Delivery Portal • Government of Gujarat

---

## 🔑 Login Credentials

Use the following pre-configured credentials to access the system:

| User Type | Registered Mobile Number | Verification OTP | Role / Account Details |
| :--- | :--- | :--- | :--- |
| **Citizen (Family Head)** | `9876543210` | `123456` | Family Head (`ABC`), Access to Citizen Portal & Member Registry |
| **Nodal Officer** | `9000000001` | `123456` | Government Officer, Access to Verification Desk & Approval Queue |

---

## 🚀 How to Run the Project Locally

### 1. Start the Backend Server (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --reload
```
*(Runs at `http://localhost:8000`)*

### 2. Start the Frontend Application (Next.js)
```bash
cd frontend
npx next dev -p 3000
```
*(Runs at `http://localhost:3000`)*

---

## 📋 Member Addition & Officer Approval Workflow Demo

1. **Log in as Citizen**:
   - Navigate to `http://localhost:3000/login`
   - Enter mobile number `9876543210` and OTP `123456`.
2. **Enrol Family Member**:
   - Go to **Family Registry** (`/family`) and click **Enrol New Family Member**.
   - **Step 1 (Aadhaar e-KYC)**: Enter Aadhaar Code `UID-MOCK-004` (or click the quick demo button) and click **Fetch Aadhaar Data**. The system fetches verified Aadhaar details (Charlie, DOB 2008-03-25).
   - **Step 2 (Declare Relationship & Income)**: Select Relationship (`SON`), enter annual income (`₹1,50,000`), and submit.
   - The member status will display **`PENDING OFFICER APPROVAL`**.
3. **Approve as Nodal Officer**:
   - Log out or open a new browser session at `http://localhost:3000/login`.
   - Log in using Nodal Officer mobile `9000000001` and OTP `123456`.
   - Go to **Officer Desk** (`/verification`).
   - Find the pending enrolment request for Charlie and click **Approve Member**.
4. **Verified Status Reflected to Citizen**:
   - Log back in as Citizen (`9876543210`) and visit **Family Registry** (`/family`).
   - The member's status will now be updated to **`✓ APPROVED & VERIFIED`** across the portal!
