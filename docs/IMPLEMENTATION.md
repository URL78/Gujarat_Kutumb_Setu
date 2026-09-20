# IMPLEMENTATION.md

# Family ID & Beneficiary Management System --- Implementation Context

> **Purpose of this document**
>
> This document is the **single implementation context/reference** for
> the coding agent building the hackathon MVP.
>
> **Important:** The sections, flows, architecture, data model, APIs,
> and technology choices below describe the agreed project flow.
> Implementation should follow this document unless a technical
> inconsistency is discovered. If an implementation detail needs to
> change, preserve the same business flow and document the change.
>
> The attached/reference diagrams should be treated as visual
> representations of the same flow:
>
> 1.  `01_problem_solution_flow.jpg`
> 2.  `02_use_case_diagram.jpg`
> 3.  `03_system_architecture.jpg`
> 4.  `04_family_registration_sequence.jpg`
> 5.  `05_scheme_application_sequence.jpg`
> 6.  `06_er_database_diagram.jpg`
> 7.  `07_activity_workflow_diagram.jpg`
> 8.  `08_deployment_diagram.jpg`
> 9.  `09_application_state_diagram.jpg`
>
> The diagrams are references for understanding the intended
> architecture and workflow. The implementation should remain consistent
> with them.

------------------------------------------------------------------------

# 1. Project Overview

The project is a **Family ID & Beneficiary Management System** for
Gujarat.

The central idea is:

> **Register Once → Verify Once → Reuse Across Schemes → Track
> Benefits**

A family creates a single Family ID. Family members and important
attributes are verified using authoritative/mock government records.
Once verified, the information can be reused while applying for multiple
government schemes instead of repeatedly entering the same information
and submitting the same documents.

The system is primarily a **beneficiary-management platform**, not
simply a family information dashboard.

The Family ID acts as a common family-level identity that connects:

-   Family members
-   Verified identities
-   Verified relationships
-   Verified documents/attributes
-   Income information
-   Government schemes
-   Eligibility results
-   Applications
-   Application status history
-   Benefits
-   Notifications
-   Audit records

------------------------------------------------------------------------

# 2. Problem Statement

Currently, citizens may have to use different government scheme portals
and repeatedly provide the same information.

Typical repeated information includes:

-   Name
-   Date of birth
-   Address
-   Family members
-   Identity information
-   Income information
-   Education information
-   Certificates and documents

This creates:

-   Repeated data entry
-   Repeated document submission
-   Repeated verification
-   Inconsistent information across departments
-   Difficulty tracking all applications and benefits
-   Additional administrative workload
-   Difficulty for government departments in maintaining a unified
    beneficiary view

The proposed Family ID system creates a reusable, verified family-level
identity and information layer.

------------------------------------------------------------------------

# 3. Goal

The primary goals are:

1.  Allow a family to register once.
2.  Create a unique Family ID.
3.  Verify family members and relationships.
4.  Verify important information using authoritative records where
    possible.
5.  Reuse verified information across government schemes.
6.  Reduce repeated document submission.
7.  Pre-fill scheme applications using verified information.
8.  Evaluate scheme eligibility using scheme-specific rules.
9.  Allow citizens to track applications and benefits.
10. Provide government-side beneficiary management capabilities
    conceptually, even though the full government dashboard is outside
    the MVP implementation.
11. Maintain an auditable and secure record of important actions.

------------------------------------------------------------------------

# 4. Target Users

## 4.1 Citizen / Family Head

The primary MVP user.

Responsibilities:

-   Register/login
-   Create Family ID
-   Verify identity
-   Add family members
-   Provide relationship information
-   Provide family/member attributes
-   Provide income information
-   Submit verification references
-   Review family information
-   Apply for schemes
-   Track applications
-   View benefits
-   Receive notifications

Example family:

``` text
Family Head: ABC
Member: Alice — Wife
Member: Bob — Son

Family ID:
GJ-FAM-102938
```

## 4.2 Government Officer

Government-side role.

The complete government dashboard is **out of MVP scope**, but the
backend/data model should support:

-   Manual verification
-   Beneficiary verification
-   Application review
-   Approval/rejection
-   Additional information requests
-   Benefit status updates

## 4.3 System Administrator

Conceptual role for:

-   Scheme management
-   User/role management
-   Department configuration
-   System configuration
-   Audit review

A complete admin interface is not required for the hackathon MVP.

## 4.4 External Government Services

External authoritative systems are represented using **mock APIs** for
the hackathon.

Examples:

-   Identity/e-KYC
-   Revenue/certificate verification
-   Education result verification
-   Ration/PDS verification
-   Birth/family records
-   Marriage records

------------------------------------------------------------------------

# 5. Functional Requirements

## FR-01 --- User Registration/Login

The system shall allow a family head to register using a mobile number
and mock OTP verification.

The system shall issue a JWT after successful authentication.

## FR-02 --- Family Registration

The system shall allow an authenticated family head to initiate Family
ID creation.

A temporary family registration shall be created before the final Family
ID is generated.

## FR-03 --- Identity Verification

The system shall verify the identity of the family head and family
members using a mock identity/e-KYC service.

Identity verification and relationship verification must be treated as
separate processes.

## FR-04 --- Duplicate Family Check

Before creating or joining a family, the system shall check whether the
verified person is already associated with an existing Family ID.

## FR-05 --- Add Family Members

The family head shall be able to add family members by providing:

-   Name
-   DOB
-   Gender
-   Relationship
-   Mobile where applicable
-   Identity reference

Each member shall be independently identity-verified.

## FR-06 --- Relationship Verification

The system shall verify relationships using government-record references
where available.

Examples:

-   Marriage certificate reference
-   Birth/family record reference
-   Ration/PDS family record

If digital verification is unavailable, a manual verification case shall
be created.

## FR-07 --- Verified Family Information

The system shall maintain verified family-level and member-level
attributes.

Examples:

-   Address
-   District
-   Taluka
-   Village/city
-   PIN
-   Occupation
-   Student status
-   Education information
-   Disability status where relevant

Only information useful to the intended scheme-management flow should be
collected.

## FR-08 --- Document/Certificate Verification

The preferred verification mechanism is reference-based verification.

Examples:

``` text
Income Certificate:
Certificate Number + Issue Date

Education Result:
Seat Number + Serial Number + Exam Year

Ration Card:
Ration Card Number

Birth Certificate:
Registration Number + Date
```

The system should call mock government APIs using these references.

Uploading document images is a fallback for cases where digital
verification is unavailable.

## FR-09 --- Member-Level Income

Income shall be stored at the member level and by financial year.

Example:

``` text
Rajesh:
FY 2025-26
Salary
₹4,00,000
VERIFIED

Priya:
FY 2025-26
Business
₹2,00,000
VERIFIED

Umang:
FY 2025-26
₹0
VERIFIED
```

Do not assume that one universal `family_income` value applies to every
scheme.

Each scheme determines which members/income sources it considers.

## FR-10 --- Family ID Generation

After required verification and final confirmation, the system shall
generate a unique Family ID.

Example:

``` text
GJ-FAM-102938
```

Each family member shall have an internal member ID.

## FR-11 --- Scheme Management

The system shall maintain representative government schemes.

Each scheme should contain:

-   Name
-   Department
-   Description
-   Benefit
-   Eligibility rules
-   Required information/documents
-   Active/inactive status

## FR-12 --- Eligibility Evaluation

The system shall evaluate scheme eligibility using verified
family/member information and scheme-specific rules.

Eligibility results should be explainable.

Example:

``` text
Gujarat resident       ✓
Age requirement        ✓
Student                ✓
Income requirement     ✓
Education record       ✓
```

## FR-13 --- Scheme Application

The citizen shall be able to apply to an eligible/potentially eligible
scheme.

The application form should be pre-filled using verified Family ID
information.

The citizen should provide only scheme-specific information that is not
already available.

## FR-14 --- Application Tracking

The system shall allow citizens to track application status.

Example:

``` text
SUBMITTED
→ UNDER_VERIFICATION
→ UNDER_REVIEW
→ APPROVED
→ BENEFIT_DISBURSED
```

Alternative:

``` text
UNDER_VERIFICATION
→ ADDITIONAL_INFORMATION_REQUIRED
→ UNDER_VERIFICATION
```

or:

``` text
UNDER_REVIEW
→ REJECTED
```

## FR-15 --- Benefits

The system shall maintain benefit information associated with approved
applications.

## FR-16 --- Notifications

The system shall provide in-app notifications for important events.

Examples:

-   Application submitted
-   Additional information required
-   Application approved
-   Application rejected
-   Benefit disbursed

SMS/email can be treated as future integration.

## FR-17 --- Manual Verification

If digital verification is unavailable or a record does not match, the
system shall create a manual verification case.

Possible outcomes:

-   VERIFIED
-   REQUEST_MORE_INFORMATION
-   REJECTED

## FR-18 --- Audit Logging

Important actions shall be recorded in an audit log.

Examples:

-   Family created
-   Member added
-   Verification performed
-   Application submitted
-   Application status changed
-   Officer action performed

------------------------------------------------------------------------

# 6. Non-Functional Requirements

## NFR-01 --- Security

Sensitive data must be protected using authentication, authorization,
HTTPS, validation, and appropriate data-handling practices.

## NFR-02 --- Privacy

The system should collect only information necessary for the intended
functionality.

Sensitive identity values should not be unnecessarily exposed in the UI
or logs.

## NFR-03 --- Reliability

Verification and application operations should fail gracefully and
preserve consistent application state.

## NFR-04 --- Maintainability

Use a modular monolith with clear domain modules so components can later
be separated into services if required.

## NFR-05 --- Scalability

The architecture should be capable of evolving beyond the hackathon MVP
without requiring a complete rewrite.

## NFR-06 --- Explainability

Eligibility and verification results should clearly indicate why a
condition passed, failed, or requires additional information.

## NFR-07 --- Auditability

Important state changes and privileged actions must be traceable.

## NFR-08 --- Usability

The citizen flow should be simple, guided, and understandable to a
non-technical user.

## NFR-09 --- Performance

Common portal operations should respond quickly under normal MVP load.

## NFR-10 --- API Consistency

REST APIs should use consistent naming, HTTP methods, status codes,
validation, and error-response formats.

------------------------------------------------------------------------

# 7. MVP Scope

The MVP should focus on the **complete citizen journey**.

## Included

### Family Registration

-   Mobile registration
-   Mock OTP
-   Login
-   Family head identity verification
-   Duplicate Family ID check
-   Temporary family creation

### Family Members

-   Add members
-   Independent identity verification
-   Existing-family check
-   Relationship selection
-   Relationship verification

### Verification

-   Mock government APIs
-   Certificate/reference-number verification
-   Income verification
-   Education verification
-   Ration/PDS verification
-   Manual verification fallback

### Family Profile

-   Family ID
-   Members
-   Relationships
-   Address
-   Important attributes
-   Member-level income
-   Verification statuses

### Schemes

-   Representative schemes
-   Scheme details
-   Eligibility rules
-   Required information
-   Benefits

### Eligibility

-   Rule evaluation
-   Explainable eligibility result
-   Missing-information indication

### Applications

-   Pre-filled forms
-   Scheme-specific fields
-   Submission
-   Application ID
-   Status tracking
-   Status history

### Benefits

-   Approved benefits
-   Benefit history
-   Disbursement status

### Notifications

-   In-app status notifications

------------------------------------------------------------------------

# 8. Out of Scope

The following should NOT be implemented during the hackathon unless time
remains:

-   Real Aadhaar/UIDAI integration
-   Real government databases
-   Real OTP/SMS gateway
-   Real banking/payment integration
-   Real production government department integration
-   Full government officer dashboard
-   Full administrator dashboard
-   Microservices
-   Kafka
-   Kubernetes
-   Redis unless technically required
-   Advanced AI/ML
-   OCR-based document verification
-   Facial recognition
-   Production-grade digital-signature infrastructure
-   Full S3/object-storage deployment
-   Complete state-wide government analytics platform
-   Every possible Gujarat government scheme

Use mock services/data for external dependencies.

------------------------------------------------------------------------

# 9. Assumptions

1.  All external government APIs are mocked.
2.  The hackathon environment does not have direct access to real
    citizen/government databases.
3.  OTP is mocked.
4.  Identity references are simulated.
5.  Government verification records are simulated using local JSON/mock
    API data.
6.  The Family ID format used in the demo is illustrative.
7.  Real production integration would require appropriate government
    authorization and security controls.
8.  Relationship verification is separate from identity verification.
9.  A family member cannot simultaneously belong to two active Family
    IDs without a resolution process.
10. A scheme determines its own eligibility rules.
11. Family income is not treated as one universal value for every
    scheme.
12. The citizen portal is the main implemented interface.
13. Government-side functionality is represented in the backend/data
    model and documentation where possible.

------------------------------------------------------------------------

# 10. User Flows

# 10.1 Family ID Creation Flow

The canonical flow is:

``` text
START
  ↓
Mobile Registration
  ↓
OTP Verification
  ↓
Family Head Identity Verification
  ↓
Existing Family ID Check
  ↓
Create Temporary Family
  ↓
Add Family Members
  ↓
Member Identity Verification
  ↓
Existing Family Association Check
  ↓
Relationship Verification
  ↓
Collect Address & Attributes
  ↓
Collect Member-wise Income
  ↓
Verify Income / Documents
  ↓
Manual Verification if required
  ↓
Final Family Review
  ↓
Family Confirmation
  ↓
Generate Family ID
  ↓
END
```

## 10.2 Example Family

``` text
Family Head:
ABC

Members:
Alice — Wife
Bob — Son
```

Expected final state:

``` text
Family ID: GJ-FAM-102938

Rajesh → HEAD
Priya  → WIFE
Umang  → SON
```

## 10.3 Verification Rule

Identity:

``` text
Identity Reference
      ↓
Mock Identity API
      ↓
Identity VERIFIED
```

Relationship:

``` text
Relationship Claim
      ↓
Government Record Reference
      ↓
Mock Government Record API
      ↓
Relationship VERIFIED
```

If unavailable:

``` text
Digital Verification Failed/Unavailable
      ↓
Supporting Document
      ↓
Manual Verification Case
      ↓
Officer Review
      ↓
VERIFIED / REQUEST_MORE_INFORMATION / REJECTED
```

------------------------------------------------------------------------

# 10.4 Scheme Application Flow

``` text
Login
  ↓
View Schemes
  ↓
Select Scheme
  ↓
Load Family ID
  ↓
Fetch Verified Family/Member Information
  ↓
Load Scheme Rules
  ↓
Evaluate Eligibility
  ↓
Show Explainable Result
  ↓
Open Pre-filled Application
  ↓
Add Scheme-specific Information
  ↓
Review
  ↓
Submit
  ↓
Create Application
  ↓
Notify Citizen
  ↓
Department Processing
  ↓
Verification / Review
  ↓
Additional Information if Required
  ↓
Approved / Rejected
  ↓
Benefit Disbursement if Approved
  ↓
Track Benefit
```

------------------------------------------------------------------------

# 10.5 Core Business Principle

The most important flow in the system is:

``` text
REGISTER ONCE
      ↓
VERIFY ONCE
      ↓
STORE VERIFIED INFORMATION
      ↓
REUSE ACROSS SCHEMES
      ↓
PRE-FILL APPLICATIONS
      ↓
TRACK APPLICATIONS
      ↓
TRACK BENEFITS
```

------------------------------------------------------------------------

# 11. System Architecture

The MVP uses a **Modular Monolith**.

Do NOT implement microservices for the hackathon.

``` text
Citizen Browser
      │
      │ HTTPS / REST
      ▼
Next.js Frontend
      │
      ▼
FastAPI Backend
      │
      ├── Authentication Module
      ├── Family Management Module
      ├── Verification Module
      ├── Scheme Management Module
      ├── Eligibility Engine
      ├── Application Management Module
      ├── Notification Module
      └── Audit Module
      │
      ├──────────────► PostgreSQL
      │
      └──────────────► Mock Government APIs
```

## Backend Modules

### Authentication

Handles:

-   OTP
-   JWT
-   User identity
-   Roles

### Family Management

Handles:

-   Family creation
-   Family members
-   Relationships
-   Family ID
-   Family profile

### Verification

Handles:

-   Identity verification
-   Document verification
-   Government API integration
-   Verification status
-   Manual verification

### Scheme Management

Handles:

-   Scheme CRUD
-   Requirements
-   Scheme metadata

### Eligibility Engine

Handles:

-   Rule evaluation
-   Explainability
-   Missing information

### Application Management

Handles:

-   Application creation
-   Submission
-   Status changes
-   Status history
-   Benefit records

### Notification

Handles:

-   In-app notifications
-   Status notifications

### Audit

Handles:

-   Important action history

------------------------------------------------------------------------

# 12. Data Flow

## 12.1 Family Registration Data Flow

``` text
Citizen
  ↓
Next.js
  ↓
FastAPI
  ↓
Authentication
  ↓
Family Module
  ↓
Verification Engine
  ↓
Mock Government API
  ↓
Verification Result
  ↓
Family Module
  ↓
PostgreSQL
```

## 12.2 Scheme Application Data Flow

``` text
Citizen
  ↓
Select Scheme
  ↓
FastAPI
  ↓
Family Module
  ↓
Verified Family Data
  ↓
Eligibility Engine
  ↓
Scheme Rules
  ↓
Eligibility Result
  ↓
Pre-filled Application
  ↓
Application Service
  ↓
PostgreSQL
  ↓
Notification
```

## 12.3 Verification Data Flow

``` text
Citizen enters reference
        ↓
Verification Engine
        ↓
Mock Government API
        ↓
Record found?
      /     \
    YES      NO
     ↓        ↓
 VERIFIED   Manual Verification
              ↓
          Officer Review
              ↓
       VERIFIED / REJECTED
```

------------------------------------------------------------------------

# 13. Database Design

Use **PostgreSQL**.

## Core Tables

``` text
users
families
family_members

documents
verification_records
member_income

schemes
scheme_requirements

applications
application_status_history

benefits
notifications

audit_logs
```

## USER

``` text
id
mobile
role
status
created_at
updated_at
```

## FAMILY

``` text
id
family_id
family_head_id
address
district
taluka
city_village
pincode
verification_status
created_at
updated_at
```

## FAMILY_MEMBER

``` text
id
family_id
name
dob
gender
relationship
mobile
identity_reference
identity_verified
created_at
updated_at
```

## DOCUMENT

``` text
id
member_id
document_type
reference_number
issue_date
expiry_date
source
status
created_at
updated_at
```

## VERIFICATION_RECORD

``` text
id
document_id
verification_method
verification_status
verification_source
verified_at
failure_reason
created_at
```

## MEMBER_INCOME

``` text
id
member_id
financial_year
income_source
annual_amount
certificate_id
verification_status
created_at
updated_at
```

## SCHEME

``` text
id
name
department
description
benefit
status
created_at
updated_at
```

## SCHEME_REQUIREMENT

``` text
id
scheme_id
attribute
operator
expected_value
required
created_at
updated_at
```

## APPLICATION

``` text
id
family_id
member_id
scheme_id
status
submitted_at
created_at
updated_at
```

## APPLICATION_STATUS_HISTORY

``` text
id
application_id
old_status
new_status
changed_by
changed_at
remarks
```

## BENEFIT

``` text
id
application_id
benefit_type
amount
status
disbursed_at
created_at
updated_at
```

## NOTIFICATION

``` text
id
user_id
application_id
type
message
read_status
created_at
```

## AUDIT_LOG

``` text
id
actor_id
action
entity_type
entity_id
timestamp
details
```

------------------------------------------------------------------------

# 14. API Specification

All APIs should use REST and JSON.

Base path:

``` text
/api/v1
```

## 14.1 Authentication

``` http
POST /auth/send-otp
POST /auth/verify-otp
GET  /auth/me
```

## 14.2 Family

``` http
POST /families
GET  /families/me
GET  /families/{family_id}
PUT  /families/{family_id}
POST /families/{family_id}/confirm
```

## 14.3 Members

``` http
POST /families/{family_id}/members
GET  /families/{family_id}/members
GET  /members/{member_id}
PUT  /members/{member_id}
DELETE /members/{member_id}
```

## 14.4 Identity/Verification

``` http
POST /verification/identity
POST /verification/document
POST /verification/relationship
POST /verification/income
GET  /verification/{verification_id}
```

## 14.5 Manual Verification

``` http
POST /verification/manual
GET  /verification/manual
GET  /verification/manual/{id}
PATCH /verification/manual/{id}
```

## 14.6 Schemes

``` http
GET /schemes
GET /schemes/{scheme_id}
GET /schemes/{scheme_id}/requirements
```

## 14.7 Eligibility

``` http
GET /schemes/{scheme_id}/eligibility
```

Response should contain:

``` json
{
  "status": "POTENTIALLY_ELIGIBLE",
  "checks": [
    {
      "rule": "Age < 25",
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

## 14.8 Applications

``` http
POST /applications
GET  /applications
GET  /applications/{application_id}
POST /applications/{application_id}/submit
PATCH /applications/{application_id}/status
GET  /applications/{application_id}/history
```

## 14.9 Benefits

``` http
GET /benefits
GET /benefits/{benefit_id}
```

## 14.10 Notifications

``` http
GET   /notifications
PATCH /notifications/{id}/read
```

## API Design Rules

Use:

-   Pydantic request/response models
-   HTTP status codes correctly
-   Validation errors
-   Authentication dependencies
-   Authorization checks
-   Consistent error responses

------------------------------------------------------------------------

# 15. Technology Stack

## Frontend

``` text
Next.js
TypeScript
Tailwind CSS
```

## Backend

``` text
Python
FastAPI
Pydantic
SQLAlchemy
```

## Database

``` text
PostgreSQL
```

## Authentication

``` text
JWT
Mock OTP
```

## External Integrations

``` text
Mock REST APIs
```

## Documentation

``` text
FastAPI Swagger / OpenAPI
```

## Deployment

``` text
Frontend: Vercel or equivalent
Backend: Render/Railway or equivalent
Database: PostgreSQL cloud instance
```

------------------------------------------------------------------------

# 16. Authentication & Security

## Authentication Flow

``` text
Mobile Number
     ↓
Send OTP
     ↓
Mock OTP
     ↓
Verify OTP
     ↓
Issue JWT
     ↓
Authenticated API Access
```

## Authorization

Roles:

``` text
CITIZEN
OFFICER
ADMIN
```

The MVP mainly implements CITIZEN access.

Backend must ensure that a citizen cannot access another family's
private data simply by changing a URL parameter.

## Sensitive Information

Do not expose real Aadhaar numbers or other sensitive identifiers.

Use mock references:

``` text
UID-MOCK-12345
```

Mask sensitive information where appropriate.

## Audit

Record sensitive actions:

``` text
who
what
when
which entity
result
```

------------------------------------------------------------------------

# 17. Error Handling

Use structured API errors.

Example:

``` json
{
  "error": {
    "code": "IDENTITY_VERIFICATION_FAILED",
    "message": "Identity could not be verified.",
    "details": {}
  }
}
```

Important cases:

### Invalid OTP

``` text
Return validation error
Allow retry
```

### Identity verification failure

``` text
Show reason
Allow correction/retry
```

### Member already belongs to another family

``` text
Do not silently add member.
Show conflict and resolution message.
```

### Government API unavailable

``` text
Do not mark as verified.
Create PENDING_VERIFICATION/manual-review state.
```

### Certificate mismatch

``` text
Show mismatch.
Allow correction or manual verification.
```

### Application submission failure

``` text
Do not create duplicate applications.
Return safe retry response.
```

### Unauthorized access

``` text
401 Unauthorized
```

### Forbidden access

``` text
403 Forbidden
```

### Resource not found

``` text
404 Not Found
```

------------------------------------------------------------------------

# 18. External Integrations

All external integrations are **mocked for the hackathon**.

## 18.1 Identity/e-KYC Mock API

Example:

``` http
POST /mock/government/identity/verify
```

Input:

``` json
{
  "identity_reference": "UID-MOCK-1001"
}
```

Output:

``` json
{
  "verified": true,
  "name": "ABC",
  "dob": "1970-04-15",
  "gender": "Male"
}
```

## 18.2 Income Certificate Mock API

``` http
POST /mock/government/income/verify
```

Input:

``` json
{
  "certificate_number": "INC-GJ-2026-12345",
  "issue_date": "2026-06-15"
}
```

Output:

``` json
{
  "verified": true,
  "name": "ABC",
  "annual_income": 400000,
  "financial_year": "2025-26"
}
```

## 18.3 Education Result Mock API

Example input:

``` json
{
  "seat_number": "SEAT12345",
  "serial_number": "SER9876",
  "exam_year": 2025
}
```

## 18.4 Ration/PDS Mock API

Example input:

``` json
{
  "ration_card_number": "RC-GJ-12345"
}
```

Response can contain household members.

## 18.5 Relationship Records

Mock services can represent:

-   Marriage records
-   Birth/family records

------------------------------------------------------------------------

# 19. Testing Requirements

Testing should focus on the core business flow.

## Unit Tests

Test:

-   Eligibility rules
-   Family creation
-   Duplicate detection
-   Relationship validation
-   Income calculation for scheme-specific rules
-   Application state transitions
-   Verification status transitions

## API Tests

Test:

``` text
POST /auth/send-otp
POST /auth/verify-otp

POST /families
POST /families/{id}/members

POST /verification/identity
POST /verification/document

GET /schemes
GET /schemes/{id}/eligibility

POST /applications
POST /applications/{id}/submit
GET /applications/{id}
```

## Integration Tests

At least test:

``` text
Registration
→ Verification
→ Family ID
→ Scheme
→ Eligibility
→ Application
→ Status
→ Benefit
```

## Negative Tests

Test:

-   Invalid OTP
-   Invalid identity
-   Duplicate family
-   Duplicate member
-   Member belongs to another family
-   Invalid certificate
-   Government API failure
-   Missing required scheme information
-   Unauthorized family access
-   Invalid application status transition

## Demo Seed Data

Create seed data for:

``` text
1 demo family
3 members
multiple verified documents
3–5 schemes
multiple application statuses
at least 1 approved benefit
at least 1 pending application
```

------------------------------------------------------------------------

# 20. UI Requirements

The UI should be **citizen-centric and simple**.

## Main Pages

``` text
/login
/register-family
/family
/members
/verification
/schemes
/schemes/[id]
/applications
/applications/[id]
/benefits
/notifications
```

## Dashboard

Show:

``` text
Family ID
Family members
Verification summary
Available/potentially eligible schemes
Active applications
Recent notifications
Benefits
```

Example:

``` text
Family ID: GJ-FAM-102938

Members: 3
Verified Information: 95%
Active Applications: 2
Benefits Received: 3
```

## Family Page

Show:

``` text
ABC
HEAD
✓ Identity Verified

Alice
WIFE
✓ Identity Verified
✓ Relationship Verified

Bob
SON
✓ Identity Verified
✓ Relationship Verified
```

## Verification UI

Clearly distinguish:

``` text
VERIFIED
PENDING VERIFICATION
NOT AVAILABLE
REJECTED
```

## Scheme Page

Show:

``` text
Scheme Name
Department
Benefit
Eligibility
Why you are eligible
Missing information
Required documents
Apply
```

## Application Page

Show a timeline:

``` text
✓ Submitted
   ↓
✓ Under Verification
   ↓
● Under Review
   ↓
○ Approved
   ↓
○ Benefit Disbursed
```

------------------------------------------------------------------------

# 21. Deployment

Recommended MVP deployment:

``` text
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │ Next.js/Vercel │
              └───────┬────────┘
                      │ HTTPS
                      ▼
              ┌────────────────┐
              │ FastAPI Server │
              │ Render/Railway │
              └───────┬────────┘
                      │
                SQLAlchemy
                      │
                      ▼
              ┌────────────────┐
              │   PostgreSQL   │
              └────────────────┘

FastAPI
   │
   ├── Mock Identity API
   ├── Mock Revenue API
   ├── Mock Education API
   └── Mock Ration/PDS API
```

For local development:

``` text
Next.js → localhost:3000
FastAPI → localhost:8000
PostgreSQL → localhost:5432
```

Docker can optionally be used for local PostgreSQL/backend setup, but
Kubernetes is unnecessary.

------------------------------------------------------------------------

# 22. Acceptance Criteria

The MVP is considered successful if the following complete flow works:

## Family Registration

-   [ ] Citizen can register/login with mock OTP.
-   [ ] Family head identity can be mock-verified.
-   [ ] Existing Family ID can be detected.
-   [ ] Temporary family can be created.
-   [ ] Three family members can be added.
-   [ ] Each member can be independently identity-verified.
-   [ ] Existing-family association can be checked.
-   [ ] Relationships can be verified using mock records.
-   [ ] Manual verification fallback exists.
-   [ ] Member-wise income can be stored.
-   [ ] Income/document references can be verified.
-   [ ] Family can review information.
-   [ ] Family ID can be generated.

Expected:

``` text
GJ-FAM-102938
```

## Scheme Management

-   [ ] At least 3 representative schemes exist.
-   [ ] Each scheme has eligibility rules.
-   [ ] Scheme requirements are visible.
-   [ ] Eligibility can be evaluated using Family ID data.
-   [ ] Eligibility result is explainable.

## Application

-   [ ] Eligible user can open an application.
-   [ ] Existing verified information is pre-filled.
-   [ ] User enters only scheme-specific information.
-   [ ] Application can be submitted.
-   [ ] Application ID is generated.
-   [ ] Status is visible.
-   [ ] Status history is maintained.
-   [ ] Additional-information flow can be demonstrated.
-   [ ] Approved/rejected flow can be demonstrated.
-   [ ] Benefit disbursement can be demonstrated.

## Notifications

-   [ ] Important application status changes generate in-app
    notifications.

## Security

-   [ ] JWT authentication works.
-   [ ] Protected APIs require authentication.
-   [ ] Users cannot access another family's private data.
-   [ ] Important actions are logged.

## Demo

A complete live demonstration should be possible:

``` text
Login
  ↓
Create Family
  ↓
Verify Father
  ↓
Add Mother
  ↓
Verify Mother
  ↓
Verify Wife Relationship
  ↓
Add Son
  ↓
Verify Son
  ↓
Verify Parent-Child Relationship
  ↓
Add Income
  ↓
Verify Income
  ↓
Generate Family ID
  ↓
Browse Scheme
  ↓
Check Eligibility
  ↓
Open Pre-filled Application
  ↓
Submit
  ↓
Track Application
  ↓
Approve
  ↓
Benefit Disbursed
```

------------------------------------------------------------------------

# 23. Known Constraints

## Hackathon Time

The implementation is being developed under a limited hackathon window
of approximately **6--7 hours**.

Therefore:

-   Prefer simple working functionality over overengineering.
-   Do not introduce microservices.
-   Do not introduce unnecessary infrastructure.
-   Use mock APIs.
-   Use seed/demo data.
-   Implement the complete happy path first.
-   Add important failure cases after the happy path works.

## External Services

Real government APIs are not available.

Therefore:

``` text
Real Government API
        ↓
Mock Government API
```

must be used for the MVP.

The code should keep external integrations behind clear service
interfaces so that real APIs could theoretically replace the mocks
later.

## Government Portal

A complete government-facing dashboard is not required.

The architecture should support government-side beneficiary management,
but implementation priority is the **citizen-facing end-to-end flow**.

## Document Verification

Digital reference-based verification is preferred.

Do not make image upload/OCR the central verification mechanism.

Preferred:

``` text
Certificate Number
+
Issue Date
        ↓
Government Verification API
```

For education:

``` text
Seat Number
+
Serial Number
+
Exam Year
        ↓
Education Verification API
```

Fallback:

``` text
Document Upload
        ↓
Manual Verification
```

## Data Privacy

Use only mock/sample citizen data.

Never use real Aadhaar numbers, real bank details, real certificates, or
other sensitive personal data in the hackathon database.

## Architecture Constraint

Use:

``` text
Modular Monolith
```

rather than microservices.

The architecture should remain clean enough that modules can later be
extracted into services if the system becomes large.

------------------------------------------------------------------------

# Final Implementation Principle

The coding agent should always preserve this business model:

``` text
                         FAMILY ID
                            │
                            ▼
                 VERIFIED FAMILY PROFILE
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Members       Attributes       Income
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                    SCHEME ELIGIBILITY
                            │
                            ▼
                    PRE-FILLED APPLICATION
                            │
                            ▼
                     APPLICATION TRACKING
                            │
                            ▼
                       BENEFIT HISTORY
```

The key value proposition is:

> **The citizen should not have to repeatedly prove the same information
> for every scheme when that information has already been verified and
> is reusable through the Family ID.**

At the same time:

> **A Family ID does not automatically make a citizen eligible for every
> scheme. Each scheme continues to apply its own eligibility rules using
> the verified information available through the Family ID.**

And:

> **The system is not intended to become a database containing every
> piece of information about a citizen. It should maintain the minimum
> trusted information required for family identity, verification,
> eligibility, beneficiary management, and scheme delivery.**

------------------------------------------------------------------------

# Implementation Priority

If implementation time becomes tight, follow this exact priority:

``` text
P0 — MUST WORK
────────────────────────────────
Authentication
Family Registration
Family Members
Identity Verification Mock
Relationship Verification Mock
Family ID Generation
PostgreSQL Persistence

P1 — CORE VALUE
────────────────────────────────
Schemes
Eligibility Engine
Pre-filled Application
Application Submission
Application Tracking
Status History

P2 — DEMO QUALITY
────────────────────────────────
Notifications
Benefits
Manual Verification
Audit Logs
Good UI
Error States

P3 — OPTIONAL
────────────────────────────────
Additional schemes
Advanced analytics
Real external integrations
Government dashboard
SMS/email
Advanced document storage
```

**Do not start P2/P3 until the complete P0 → P1 flow works end-to-end.**
