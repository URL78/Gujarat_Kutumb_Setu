# System Architecture — Family ID & Beneficiary Management System

## 1. Architecture Style

Use a **Modular Monolith** for the hackathon.

Do not implement microservices, Kafka, Kubernetes, or unnecessary infrastructure.

The backend is one FastAPI application with clearly separated domain modules.

```text
Citizen Browser
      ↓
Next.js Frontend
      ↓ HTTPS / REST
FastAPI Backend
      ├── Authentication
      ├── Family Management
      ├── Verification
      ├── Scheme Management
      ├── Eligibility
      ├── Application Management
      ├── Notification
      └── Audit
      ↓
PostgreSQL
```

## 2. Frontend

Technology:

- Next.js
- TypeScript
- Tailwind CSS

Main pages:

```text
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

## 3. Backend

Technology:

- Python
- FastAPI
- Pydantic
- SQLAlchemy

Suggested structure:

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── core/
│   └── database/
└── tests/
```

## 4. Backend Modules

### Authentication Module

Handles:

- OTP
- JWT
- User identity
- Roles
- Authentication dependencies

### Family Module

Handles:

- Family creation
- Family members
- Relationships
- Family ID
- Family profile

### Verification Module

Handles:

- Identity verification
- Document verification
- Relationship verification
- Income verification
- External verification adapters
- Manual verification

### Scheme Module

Handles:

- Scheme records
- Scheme requirements
- Department information
- Benefit information

### Eligibility Engine

Handles:

- Scheme rules
- Rule evaluation
- Explainable results
- Missing information

### Application Module

Handles:

- Application creation
- Submission
- Status transitions
- Status history
- Benefits

### Notification Module

Handles:

- In-app notifications
- Application status notifications

### Audit Module

Handles:

- Important activity records
- Actor/action/entity tracking

## 5. External Government Services

For the hackathon these are **mock APIs**.

```text
Verification Module
       │
       ├── Mock Identity/e-KYC
       ├── Mock Revenue/Certificate
       ├── Mock Education Board
       ├── Mock Ration/PDS
       ├── Mock Birth/Family Records
       └── Mock Marriage Records
```

## 6. Storage

### PostgreSQL

Stores:

- Users
- Families
- Members
- Documents/reference metadata
- Verification records
- Income
- Schemes
- Applications
- Benefits
- Notifications
- Audit logs

### Document Storage

Only required for manual-verification fallback.

For MVP:

- Local/object storage is sufficient.

Do not make uploaded document images the primary verification mechanism.

## 7. Future Government Integration

Conceptually:

```text
Family ID Platform
        ↓
Government Department Systems
        ↓
Beneficiary Management
Scheme Processing
Data Exchange
```

This is future scope for the complete production system.

## 8. Key Architectural Principle

The platform is centered on:

```text
Family ID
   ↓
Verified Attributes
   ↓
Eligibility
   ↓
Application
   ↓
Benefits
```

The Family ID system is not intended to store every possible piece of citizen information.
