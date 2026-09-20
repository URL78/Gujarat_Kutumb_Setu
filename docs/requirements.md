# Requirements — Family ID & Beneficiary Management System

## 1. Functional Requirements

### Family Registration

- FR-01: User can register/login using mobile number and mock OTP.
- FR-02: Family head can initiate Family ID creation.
- FR-03: System verifies family head identity.
- FR-04: System checks whether the person already belongs to a Family ID.
- FR-05: System creates a temporary family registration.
- FR-06: Family head can add family members.
- FR-07: Each family member is independently identity verified.
- FR-08: System checks whether a member already belongs to another family.
- FR-09: System verifies family relationships.
- FR-10: System generates a unique Family ID after required verification.

### Verified Information

- FR-11: Maintain family-level verified information.
- FR-12: Maintain member-level verified information.
- FR-13: Maintain verification status and source.
- FR-14: Maintain document/reference information.
- FR-15: Maintain time-sensitive information such as financial year and certificate validity.
- FR-16: Allow correction/update requests.

### Income

- FR-17: Maintain income at member level.
- FR-18: Store income by financial year.
- FR-19: Store income source and verification status.
- FR-20: Do not assume one universal family-income formula for all schemes.

### Verification

- FR-21: Support mock identity/e-KYC verification.
- FR-22: Support certificate/reference-number verification.
- FR-23: Support education-result verification.
- FR-24: Support ration/PDS verification.
- FR-25: Support relationship-record verification.
- FR-26: Create manual verification cases when digital verification fails/unavailable.
- FR-27: Support VERIFIED, PENDING_VERIFICATION, REQUEST_MORE_INFORMATION and REJECTED outcomes.

### Scheme Management

- FR-28: Maintain government schemes.
- FR-29: Maintain scheme department.
- FR-30: Maintain scheme benefits.
- FR-31: Maintain scheme-specific eligibility rules.
- FR-32: Maintain required information/documents.

### Eligibility

- FR-33: Evaluate eligibility using verified information.
- FR-34: Return explainable eligibility results.
- FR-35: Identify missing information.
- FR-36: Support ELIGIBLE, POTENTIALLY_ELIGIBLE, INELIGIBLE and VERIFICATION_PENDING results.

### Applications

- FR-37: Citizen can apply using Family ID.
- FR-38: Previously verified information is reused/pre-filled.
- FR-39: Citizen provides only scheme-specific information not already available.
- FR-40: System validates applications before submission.
- FR-41: System creates a unique application ID.
- FR-42: System prevents duplicate applications where applicable.

### Application Tracking

- FR-43: Citizen can view submitted applications.
- FR-44: Citizen can view current application status.
- FR-45: Citizen can view status history.
- FR-46: Citizen can receive notifications for important status changes.
- FR-47: System supports additional-information requests.
- FR-48: System supports approval/rejection.
- FR-49: System supports benefit-disbursement status.

### Beneficiary Management

The backend should support government-side capabilities:

- FR-50: Search beneficiary by Family ID.
- FR-51: View authorized verified family/member information.
- FR-52: View applications.
- FR-53: View active benefits.
- FR-54: Manage manual verification cases.
- FR-55: Detect duplicate beneficiary/application situations.
- FR-56: Identify potentially eligible but unapplied beneficiaries.

A full government UI is outside the MVP.

### Notifications & Audit

- FR-57: Generate in-app notifications.
- FR-58: Maintain audit logs for important actions.

## 2. Non-Functional Requirements

### Security
- JWT-based authentication.
- Role-based authorization.
- Protected APIs.
- Input validation.
- HTTPS in deployment.
- Sensitive data masking.
- No real sensitive citizen data in the hackathon.

### Privacy
- Collect only necessary information.
- Do not expose unrelated information to scheme users.
- Keep sensitive information out of logs.
- Apply purpose-based access.

### Reliability
- Handle external-service failures safely.
- Never mark a failed verification as verified.
- Avoid duplicate application creation.
- Maintain consistent application states.

### Scalability
The modular monolith should be structured so modules can later be extracted into services.

### Performance
Common citizen operations should respond quickly under MVP load.

### Maintainability
Use clear modules, service interfaces, schemas, repositories, and validation.

### Auditability
Important changes must record actor, action, entity, timestamp, and result.

### Explainability
Eligibility and verification results should explain why a result occurred.

### Accessibility & Usability
The UI should be mobile-friendly, simple, clear, and suitable for users with limited technical literacy.

## 3. MVP Priority

### P0 — Must Work

- Authentication
- Family registration
- Family members
- Identity verification mock
- Relationship verification mock
- Family ID generation
- PostgreSQL persistence

### P1 — Core Value

- Schemes
- Eligibility engine
- Pre-filled applications
- Application submission
- Application tracking

### P2 — Demo Quality

- Notifications
- Benefits
- Manual verification
- Audit logs
- Strong error states
- Polished UI

### P3 — Optional

- Additional schemes
- Advanced analytics
- Real integrations
- Government dashboard
- SMS/email
