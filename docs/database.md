# Database Design — Family ID & Beneficiary Management System

## 1. Database

Use:

> **PostgreSQL**

Reason:

- Strong relational model
- Referential integrity
- Transactions
- Good fit for family/member/scheme/application relationships
- Suitable for future scaling

ORM:

> **SQLAlchemy**

Validation:

> **Pydantic**

## 2. Entity Overview

```text
USER
  │
  └── FAMILY
        │
        ├── FAMILY_MEMBER
        │       ├── DOCUMENT
        │       │      └── VERIFICATION_RECORD
        │       └── MEMBER_INCOME
        │
        └── APPLICATION
                 │
                 ├── SCHEME
                 │      └── SCHEME_REQUIREMENT
                 │
                 ├── APPLICATION_STATUS_HISTORY
                 └── BENEFIT

USER
  └── NOTIFICATION

USER
  └── AUDIT_LOG
```

## 3. users

```text
id PK
mobile
role
status
created_at
updated_at
```

Roles:

```text
CITIZEN
OFFICER
ADMIN
```

## 4. families

```text
id PK
family_id UNIQUE
family_head_id FK → users.id
address
district
taluka
city_village
pincode
verification_status
created_at
updated_at
```

## 5. family_members

```text
id PK
family_id FK → families.id
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

Relationships are stored relative to the family head/family context.

## 6. documents

```text
id PK
member_id FK → family_members.id
document_type
reference_number
issue_date
expiry_date
source
status
created_at
updated_at
```

The document record stores reference/metadata.

The actual image/file is not required when digital verification is available.

## 7. verification_records

```text
id PK
document_id FK → documents.id
verification_method
verification_status
verification_source
verified_at
failure_reason
created_at
```

Possible status:

```text
VERIFIED
PENDING_VERIFICATION
REQUEST_MORE_INFORMATION
REJECTED
NOT_FOUND
MISMATCH
EXPIRED
```

## 8. member_income

```text
id PK
member_id FK → family_members.id
financial_year
income_source
annual_amount
certificate_id
verification_status
created_at
updated_at
```

Important:

Do not create only:

```text
family_income
```

because different schemes can define family income differently.

## 9. schemes

```text
id PK
name
department
description
benefit
status
created_at
updated_at
```

## 10. scheme_requirements

```text
id PK
scheme_id FK → schemes.id
attribute
operator
expected_value
required
created_at
updated_at
```

Example:

```text
attribute = age
operator = <
expected_value = 25
```

## 11. applications

```text
id PK
family_id FK → families.id
member_id FK → family_members.id
scheme_id FK → schemes.id
status
submitted_at
created_at
updated_at
```

## 12. application_status_history

```text
id PK
application_id FK → applications.id
old_status
new_status
changed_by
changed_at
remarks
```

## 13. benefits

```text
id PK
application_id FK → applications.id
benefit_type
amount
status
disbursed_at
created_at
updated_at
```

## 14. notifications

```text
id PK
user_id FK → users.id
application_id FK → applications.id NULL
type
message
read_status
created_at
```

## 15. audit_logs

```text
id PK
actor_id FK → users.id
action
entity_type
entity_id
timestamp
details
```

## 16. Important Constraints

- `family_id` must be unique.
- A member should not be silently attached to multiple active families.
- Application references must point to valid family/member/scheme records.
- Application status transitions should be validated.
- Verification results should not be overwritten without history where auditability is required.
- Use transactions for critical operations.
- Sensitive identifiers should not be exposed unnecessarily.

## 17. Seed Data

Seed at least:

```text
1 demo family
3 family members
3–5 schemes
verified documents
income records
multiple applications
at least one pending application
at least one approved application
at least one benefit
```
