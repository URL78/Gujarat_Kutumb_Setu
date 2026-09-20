# Family ID & Beneficiary Management System — Problem Context

## 1. Problem

Citizens often need to apply for multiple government schemes through different portals. The same family/member information and documents may have to be entered and submitted repeatedly.

This creates:

- Repeated data entry
- Repeated document submission
- Repeated verification
- Inconsistent records across departments
- Difficulty tracking applications and benefits
- Additional administrative workload
- Difficulty maintaining a unified beneficiary view

## 2. Proposed Solution

Introduce a **Family ID** as a reusable family-level identity.

The core principle is:

> **Register Once → Verify Once → Reuse Across Schemes → Track Benefits**

A family creates a Family ID, verifies its members and important attributes, and then uses the verified information while applying for multiple schemes.

The system should not simply become a giant document-storage portal. It should maintain a trusted, reusable set of verified family/member attributes and references to authoritative records.

## 3. Core Value

### Citizen

Instead of repeatedly:

```text
Open Scheme A → enter information → upload documents
Open Scheme B → enter information → upload documents
Open Scheme C → enter information → upload documents
```

the citizen does:

```text
Create Family ID
      ↓
Verify information
      ↓
Reuse verified information
      ↓
Apply to schemes
      ↓
Track applications and benefits
```

### Government

Family ID becomes a common reference for:

- Beneficiary management
- Application tracking
- Existing benefit tracking
- Duplicate detection
- Verification
- Eligibility evaluation
- Potential beneficiary identification

## 4. Important Distinction

Family ID does **not** automatically mean eligibility for every scheme.

Each scheme continues to define its own:

- Eligibility rules
- Required information
- Required documents
- Benefit
- Application workflow

Family ID provides reusable verified information to support those rules.

## 5. Document Verification Principle

Prefer **reference-based digital verification** over manual image inspection.

Examples:

```text
Income Certificate
→ Certificate Number + Issue Date

Education Result
→ Seat Number + Serial Number + Exam Year

Ration Card
→ Ration Card Number

Birth Certificate
→ Registration Number + Date
```

The platform sends these references to the appropriate government verification service.

For the hackathon, these services are mocked.

If digital verification is unavailable:

```text
Reference verification unavailable
        ↓
Supporting document upload
        ↓
Manual verification
        ↓
VERIFIED / REQUEST_MORE_INFORMATION / REJECTED
```

## 6. Identity vs Relationship

These are separate.

Identity verification answers:

> Is this person who they claim to be?

Relationship verification answers:

> Is this person actually the claimed family member/relationship?

Aadhaar/identity verification alone should not be treated as proof that two people are husband/wife or parent/child.

## 7. End-to-End Vision

```text
Family Registration
        ↓
Identity Verification
        ↓
Member Addition
        ↓
Relationship Verification
        ↓
Attribute & Income Verification
        ↓
Family ID Generation
        ↓
Scheme Discovery
        ↓
Eligibility Evaluation
        ↓
Pre-filled Application
        ↓
Application Tracking
        ↓
Benefit Tracking
        ↓
Government Beneficiary Management
```

## 8. Hackathon Interpretation

The MVP is citizen-centric, but the underlying system is designed for **beneficiary management**.

The citizen portal is the primary implemented interface.

Government-side beneficiary management is represented in the architecture, backend model, APIs, and documentation but a full government dashboard is outside the MVP.
