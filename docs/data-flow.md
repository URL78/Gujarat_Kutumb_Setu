# Data Flow — Family ID & Beneficiary Management System

## 1. High-Level Data Flow

```text
Citizen
   ↓
Next.js Portal
   ↓
FastAPI API
   ↓
Domain Module
   ↓
PostgreSQL / Mock Government API
   ↓
Result
   ↓
Citizen
```

## 2. Family Registration Flow

```text
Mobile Number
   ↓
OTP Verification
   ↓
Authenticated User
   ↓
Family Head Identity Reference
   ↓
Mock Identity API
   ↓
Identity Result
   ↓
Existing Family Check
   ↓
Temporary Family
```

## 3. Add Family Member Flow

```text
Member Details
   ↓
Member Identity Reference
   ↓
Mock Identity API
   ↓
Identity Verified
   ↓
Existing Family Association Check
   ↓
Relationship Verification
   ↓
Government Record API
   ↓
Relationship Result
   ↓
Member Added
```

## 4. Document Verification Flow

Preferred:

```text
Document Reference
   ↓
Verification Engine
   ↓
Government Mock API
   ↓
Record Found?
   ├── YES → Compare Details → VERIFIED
   └── NO/MISMATCH → Manual Verification
```

Examples:

```text
Income:
Certificate Number + Issue Date

Education:
Seat Number + Serial Number + Exam Year

Ration:
Ration Card Number
```

## 5. Manual Verification Flow

```text
Digital Verification Failed/Unavailable
        ↓
PENDING_VERIFICATION
        ↓
Supporting Document
        ↓
Manual Verification Case
        ↓
Officer Review
        ├── VERIFIED
        ├── REQUEST_MORE_INFORMATION
        └── REJECTED
```

## 6. Income Flow

Income is member-level and financial-year-specific.

```text
Member
   ↓
Income Source
   ↓
Financial Year
   ↓
Amount
   ↓
Certificate/Reference
   ↓
Verification
   ↓
Verified Income Record
```

A scheme decides which members and income sources count.

## 7. Family ID Generation

```text
All Required Members Verified
          ↓
Relationships Verified
          ↓
Required Attributes Available
          ↓
Final Family Review
          ↓
Family Confirmation
          ↓
Generate Family ID
```

Example:

```text
GJ-FAM-102938
```

## 8. Scheme Eligibility Flow

```text
Family ID
   ↓
Fetch Verified Family/Member Data
   ↓
Load Scheme Rules
   ↓
Eligibility Engine
   ↓
Evaluate Rules
   ↓
Explain Result
```

Possible results:

```text
ELIGIBLE
POTENTIALLY_ELIGIBLE
INELIGIBLE
VERIFICATION_PENDING
```

## 9. Scheme Application Flow

```text
Citizen selects scheme
        ↓
Family ID
        ↓
Verified data retrieved
        ↓
Eligibility evaluated
        ↓
Pre-filled form
        ↓
Scheme-specific fields
        ↓
Review
        ↓
Submit
        ↓
Application ID
        ↓
Status tracking
```

## 10. Application Processing

```text
SUBMITTED
    ↓
UNDER_VERIFICATION
    ↓
UNDER_REVIEW
    ↓
APPROVED
    ↓
BENEFIT_DISBURSED
```

Alternative:

```text
UNDER_VERIFICATION
    ↓
ADDITIONAL_INFORMATION_REQUIRED
    ↓
Citizen provides information
    ↓
UNDER_VERIFICATION
```

Rejection:

```text
UNDER_REVIEW
    ↓
REJECTED
```

## 11. Government Beneficiary Data Flow

Conceptual:

```text
Family ID
   ↓
Verified Beneficiary Profile
   ├── Members
   ├── Verified Attributes
   ├── Applications
   ├── Active Benefits
   └── Verification Status
```

This enables beneficiary management without requiring citizens to repeat the same information.
