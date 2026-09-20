# Implementation Plan — Family ID & Beneficiary Management System

## 1. System Understanding
The system is a "Register Once → Verify Once → Reuse Across Schemes → Track Benefits" platform for Gujarat government schemes.
It enables families to create a single verified Family ID, attach verified members (head, spouse, children/dependents), verify identities & relationships independently via reference-based mock government services, capture member-level annual income, run extensible eligibility evaluation across government schemes, submit pre-filled applications, track application status transitions, and receive benefits & notifications.

## 2. Architecture & Technology Stack
- **Architecture**: Modular Monolith
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Axios/Fetch API.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, PyJWT, Passlib/Bcrypt.
- **Database**: PostgreSQL (or SQLite/PostgreSQL compliant local engine for hackathon execution with SQLAlchemy DB compatibility).
- **Authentication**: JWT Bearer Tokens & Mock OTP flow (`POST /auth/send-otp`, `POST /auth/verify-otp`).
- **External Services**: Mock Government REST APIs for Identity (e-KYC), Income, Education, Ration, Marriage, Birth verification.

## 3. Final Repository Structure
```text
/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── families.py
│   │   │   │   ├── members.py
│   │   │   │   ├── verification.py
│   │   │   │   ├── schemes.py
│   │   │   │   ├── eligibility.py
│   │   │   │   ├── applications.py
│   │   │   │   ├── benefits.py
│   │   │   │   ├── notifications.py
│   │   │   │   └── mock_gov.py
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   └── models.py
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── family_service.py
│   │   │   ├── verification_service.py
│   │   │   ├── scheme_service.py
│   │   │   ├── eligibility_engine.py
│   │   │   ├── application_service.py
│   │   │   └── mock_gov_service.py
│   │   └── main.py
│   ├── seed.py
│   ├── requirements.txt
│   └── tests/
│       ├── test_auth.py
│       ├── test_family.py
│       ├── test_verification.py
│       ├── test_eligibility.py
│       └── test_applications.py
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── register-family/page.tsx
│   │   ├── family/page.tsx
│   │   ├── members/page.tsx
│   │   ├── verification/page.tsx
│   │   ├── schemes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── applications/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── benefits/page.tsx
│   │   └── notifications/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── EligibilityCard.tsx
│   │   └── ...
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── package.json
├── docs/
└── README.md
```

## 4. Database Implementation Order
1. `users` table (`id`, `mobile`, `role`, `status`, `created_at`, `updated_at`)
2. `families` table (`id`, `family_id` [UNIQUE], `family_head_id`, `address`, `district`, `taluka`, `city_village`, `pincode`, `verification_status`, timestamps)
3. `family_members` table (`id`, `family_id`, `name`, `dob`, `gender`, `relationship`, `mobile`, `identity_reference`, `identity_verified`, timestamps)
4. `documents` table (`id`, `member_id`, `document_type`, `reference_number`, `issue_date`, `expiry_date`, `source`, `status`, timestamps)
5. `verification_records` table (`id`, `document_id`, `verification_method`, `verification_status`, `verification_source`, `verified_at`, `failure_reason`, timestamps)
6. `member_income` table (`id`, `member_id`, `financial_year`, `income_source`, `annual_amount`, `certificate_id`, `verification_status`, timestamps)
7. `schemes` & `scheme_requirements` tables
8. `applications` & `application_status_history` tables
9. `benefits`, `notifications`, `audit_logs` tables

## 5. Backend Implementation Order
1. Core & Database config, SQLAlchemy models & Pydantic schemas.
2. Auth Module (`/auth/send-otp`, `/auth/verify-otp`, `/auth/me`).
3. Mock Government Adapter Services (`/mock/government/*`).
4. Family & Member Module with duplicate checks (`/families`, `/families/{id}/members`).
5. Verification Module (Identity, Relationship, Income, Document, Manual verification fallback).
6. Scheme Management & Extensible Eligibility Engine (`/schemes`, `/eligibility`).
7. Application Module & State Machine (`/applications`, status transitions, pre-filled data).
8. Benefits, Notifications & Audit Logging.

## 6. Frontend Implementation Order
1. Base UI layout, Navigation header, Tailwind theme, Toast/Status badges.
2. Auth Flow (Login with mock OTP page).
3. Family Wizard Flow (Head verification -> Family registration -> Member additions & independent verification -> Relationship verification -> Member income entry & certificate verification -> Review -> Family ID generation `GJ-FAM-XXXXXX`).
4. Family Profile & Verification Dashboard.
5. Scheme Catalog & Detail view with Explainable Eligibility evaluation (`✓ Age < 25`, `✓ Student`, `✓ Income < 5,00,000`).
6. Pre-filled Application form submission & tracking timeline (`SUBMITTED` -> `UNDER_VERIFICATION` -> `UNDER_REVIEW` -> `APPROVED` -> `BENEFIT_DISBURSED`).
7. Benefits & Notifications view.

## 7. Seed-Data Strategy
Demo family dataset:
- Head: ABC (Father, UID: `UID-MOCK-001`, Mobile: `9876543210`, Salary income ₹4,00,000)
- Member 1: Alice (Wife, UID: `UID-MOCK-002`, Business income ₹2,00,000)
- Member 2: Bob (Son, UID: `UID-MOCK-003`, Student, Age < 25, Income ₹0)
Representative schemes:
1. MYSY (Mukhyamantri Yuva Swavalamban Yojana - Higher education scholarship)
2. Chief Minister Apprentice Scheme
3. Kisan Sahay Yojana / Food Security Scheme
Pre-seeded applications & benefits for realistic demo.

## 8. Resolved Ambiguities & Priorities
- **Family ID Generation**: Triggered only upon explicit confirmation when all required identity and relationship verifications are complete.
- **Income**: Stored strictly per member per financial year.
- **Verification**: Reference-based digital verification is primary; manual officer verification is fallback.
- **Multi-Family Check**: System rejects attaching an already verified citizen to a second active family.

## 9. Priority Matrix
- **P0 (Must Work)**: Auth, Family Creation, Member addition, Identity & Relationship Mock Verification, Family ID Generation, Persistence.
- **P1 (Core Value)**: Scheme Catalog, Rule Evaluation Engine, Pre-filled Application, Submission, Tracking Timeline.
- **P2 (Demo Quality)**: Notifications, Benefits, Manual Officer Review UI, Audit Log.
