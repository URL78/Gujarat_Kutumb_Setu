# API Specification — Family ID & Beneficiary Management System

## 1. API Style

Use:

- REST
- JSON
- FastAPI
- Pydantic
- `/api/v1` base path
- JWT authentication

Example:

```text
/api/v1/families
```

## 2. Authentication

### Send OTP

```http
POST /api/v1/auth/send-otp
```

Request:

```json
{
  "mobile": "MOCK-MOBILE-001"
}
```

Response:

```json
{
  "message": "OTP sent"
}
```

For the hackathon, OTP can be fixed/mocked.

### Verify OTP

```http
POST /api/v1/auth/verify-otp
```

Response:

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

### Current User

```http
GET /api/v1/auth/me
```

## 3. Family APIs

### Create Family

```http
POST /api/v1/families
```

### Get Current Family

```http
GET /api/v1/families/me
```

### Get Family

```http
GET /api/v1/families/{family_id}
```

### Update Family

```http
PUT /api/v1/families/{family_id}
```

### Confirm Family

```http
POST /api/v1/families/{family_id}/confirm
```

This triggers final validation and Family ID generation if all required conditions are satisfied.

## 4. Member APIs

### Add Member

```http
POST /api/v1/families/{family_id}/members
```

Example:

```json
{
  "name": "Alice",
  "dob": "1980-01-01",
  "gender": "Female",
  "relationship": "WIFE",
  "mobile": "MOCK-MOBILE-002",
  "identity_reference": "UID-MOCK-002"
}
```

### List Members

```http
GET /api/v1/families/{family_id}/members
```

### Get Member

```http
GET /api/v1/members/{member_id}
```

### Update Member

```http
PUT /api/v1/members/{member_id}
```

## 5. Verification APIs

### Identity Verification

```http
POST /api/v1/verification/identity
```

### Document Verification

```http
POST /api/v1/verification/document
```

Example:

```json
{
  "document_type": "INCOME_CERTIFICATE",
  "reference_number": "INC-MOCK-001",
  "issue_date": "2026-06-15"
}
```

### Relationship Verification

```http
POST /api/v1/verification/relationship
```

### Income Verification

```http
POST /api/v1/verification/income
```

### Get Verification

```http
GET /api/v1/verification/{verification_id}
```

## 6. Manual Verification APIs

```http
POST /api/v1/verification/manual
GET  /api/v1/verification/manual
GET  /api/v1/verification/manual/{id}
PATCH /api/v1/verification/manual/{id}
```

Status:

```text
PENDING
APPROVED
REQUEST_MORE_INFORMATION
REJECTED
```

## 7. Scheme APIs

### List Schemes

```http
GET /api/v1/schemes
```

### Get Scheme

```http
GET /api/v1/schemes/{scheme_id}
```

### Get Requirements

```http
GET /api/v1/schemes/{scheme_id}/requirements
```

## 8. Eligibility

```http
GET /api/v1/schemes/{scheme_id}/eligibility
```

Response:

```json
{
  "status": "POTENTIALLY_ELIGIBLE",
  "checks": [
    {
      "rule": "Student = true",
      "passed": true
    },
    {
      "rule": "Income < 500000",
      "passed": true
    }
  ],
  "missing_information": []
}
```

The exact endpoint can also accept a member ID when eligibility is member-specific.

## 9. Applications

### Create Draft

```http
POST /api/v1/applications
```

### List Applications

```http
GET /api/v1/applications
```

### Get Application

```http
GET /api/v1/applications/{application_id}
```

### Submit

```http
POST /api/v1/applications/{application_id}/submit
```

### Update Status

```http
PATCH /api/v1/applications/{application_id}/status
```

### Status History

```http
GET /api/v1/applications/{application_id}/history
```

## 10. Application Statuses

```text
DRAFT
SUBMITTED
UNDER_VERIFICATION
ADDITIONAL_INFORMATION_REQUIRED
UNDER_REVIEW
APPROVED
REJECTED
BENEFIT_DISBURSED
```

Only valid state transitions should be accepted.

## 11. Benefits

```http
GET /api/v1/benefits
GET /api/v1/benefits/{benefit_id}
```

## 12. Notifications

```http
GET /api/v1/notifications
PATCH /api/v1/notifications/{notification_id}/read
```

## 13. Mock Government APIs

Keep mock APIs isolated behind a service/adaptor layer.

Examples:

```http
POST /mock/government/identity/verify
POST /mock/government/income/verify
POST /mock/government/education/verify
POST /mock/government/ration/verify
POST /mock/government/marriage/verify
POST /mock/government/birth/verify
```

Production government integrations should replace these adapters later.

## 14. Error Format

Use a consistent structure:

```json
{
  "error": {
    "code": "IDENTITY_VERIFICATION_FAILED",
    "message": "Identity could not be verified.",
    "details": {}
  }
}
```

Common codes:

```text
INVALID_OTP
IDENTITY_VERIFICATION_FAILED
FAMILY_ALREADY_EXISTS
MEMBER_ALREADY_ASSOCIATED
RELATIONSHIP_VERIFICATION_FAILED
DOCUMENT_NOT_FOUND
DOCUMENT_MISMATCH
VERIFICATION_UNAVAILABLE
APPLICATION_ALREADY_EXISTS
INVALID_STATUS_TRANSITION
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
```

## 15. Security

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

Every endpoint accessing family data must verify that the authenticated user is authorized to access that family.
