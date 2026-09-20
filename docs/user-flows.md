# User Flows — Family ID & Beneficiary Management System

## 1. Main User Story

A family of three wants to create a Family ID so they do not have to repeatedly submit the same information when applying for government schemes.

Example:

```text
ABC   → Family Head
Alice → Wife
Bob   → Son
```

The names are illustrative only.

---

# 2. Family ID Creation

## Step 1 — Open Portal

The family head opens the Family ID portal and chooses:

> Create Family ID

## Step 2 — Mobile Registration

```text
Enter mobile number
      ↓
Mock OTP
      ↓
Verify OTP
      ↓
Authenticated
```

## Step 3 — Family Head Identity

The family head enters an identity reference.

```text
Identity Reference
      ↓
Mock Identity/e-KYC
      ↓
Identity Verified
```

## Step 4 — Existing Family Check

The system checks:

> Is this person already associated with a Family ID?

If yes:

```text
Show existing family
Do not create duplicate family
```

If no:

```text
Create temporary family registration
```

# 3. Add Mother/Wife

The family head enters:

```text
Name
DOB
Gender
Relationship = WIFE
Identity Reference
```

The system:

```text
Verify identity
      ↓
Check existing family association
      ↓
Verify relationship
```

Relationship verification can use:

```text
Marriage Certificate Reference
+
Issue Date
```

If a government record is available:

```text
Government Record API
      ↓
Match
      ↓
Relationship VERIFIED
```

If unavailable:

```text
Supporting Document
      ↓
Manual Verification
```

# 4. Add Son

The family head enters:

```text
Name
DOB
Gender
Relationship = SON
Identity Reference
```

The system independently verifies the son's identity.

Then checks whether he already belongs to another family.

Then verifies the parent-child relationship using an appropriate mock government record.

Possible:

```text
Birth/Family Record Reference
      ↓
Mock Government API
      ↓
Relationship VERIFIED
```

# 5. Family Attributes

After members are added, collect relevant family/member attributes.

Family:

```text
Address
District
Taluka
Village/City
PIN
```

Members:

```text
Occupation
Student status
Education information
Other scheme-relevant attributes
```

Do not collect unnecessary information just because it could exist.

# 6. Income

Income is stored per member and financial year.

Example:

```text
ABC
FY 2025-26
Income = ₹4,00,000
Source = Salary

Alice
FY 2025-26
Income = ₹2,00,000
Source = Business

Bob
FY 2025-26
Income = ₹0
```

Income can be verified using:

```text
Certificate Number
+
Issue Date
```

The relevant government mock API returns the authoritative record.

# 7. Final Family Review

The family head sees:

```text
Family Head
✓ Identity Verified

Alice
✓ Identity Verified
✓ Relationship Verified

Bob
✓ Identity Verified
✓ Relationship Verified

Income
✓ Verified

Address
✓ Provided
```

The family head confirms the information.

# 8. Generate Family ID

After all required conditions are satisfied:

```text
Generate Family ID
```

Example:

```text
GJ-FAM-102938
```

The family profile is now reusable.

---

# 9. Browse Schemes

The citizen opens:

> Government Schemes

The portal displays relevant schemes.

Each scheme shows:

- Scheme name
- Department
- Benefit
- Eligibility
- Required information
- Application option

# 10. Eligibility

The citizen selects a scheme.

The system:

```text
Family ID
      ↓
Verified information
      ↓
Scheme rules
      ↓
Eligibility Engine
```

Example:

```text
Student = TRUE          ✓
Age < 25               ✓
Income < threshold     ✓
Gujarat resident       ✓
Education verified     ✓
```

Result:

> Eligible

The result should explain why.

If information is missing:

> Potentially Eligible — latest income verification required.

# 11. Apply for Scheme

The citizen clicks:

> Apply

The system loads verified Family ID data.

Instead of asking for:

```text
Name
DOB
Address
Family members
Previously verified certificates
```

again, these fields are pre-filled.

The citizen provides only scheme-specific information.

Then:

```text
Review
  ↓
Submit
```

# 12. Application Created

The system generates:

```text
Application ID
```

Example:

```text
SCH-MOCK-001829
```

Status:

```text
SUBMITTED
```

The citizen receives an in-app notification.

# 13. Application Processing

The application moves through:

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

The citizen can see the status history.

# 14. Benefits

After approval:

```text
Application
      ↓
Approved
      ↓
Benefit Processed
      ↓
Benefit Disbursed
```

The benefit appears under the family's benefit history.

# 15. Government Beneficiary Management

Conceptually, government officials can use Family ID to see:

```text
Family ID
   ↓
Family Members
   ↓
Verified Attributes
   ↓
Applications
   ↓
Active Benefits
   ↓
Verification Cases
```

They can:

- Verify beneficiaries
- Review applications
- Approve/reject
- Request additional information
- Identify duplicate beneficiaries
- Track benefits
- Identify potentially eligible but unapplied families

A complete government dashboard is not implemented in the MVP.

# 16. Complete Flow

```text
REGISTER
   ↓
VERIFY FAMILY HEAD
   ↓
CHECK EXISTING FAMILY
   ↓
CREATE TEMPORARY FAMILY
   ↓
ADD MEMBERS
   ↓
VERIFY MEMBER IDENTITIES
   ↓
VERIFY RELATIONSHIPS
   ↓
COLLECT FAMILY ATTRIBUTES
   ↓
COLLECT MEMBER-WISE INCOME
   ↓
VERIFY DOCUMENTS/REFERENCES
   ↓
MANUAL VERIFICATION IF NEEDED
   ↓
FINAL REVIEW
   ↓
GENERATE FAMILY ID
   ↓
DISCOVER SCHEMES
   ↓
CHECK ELIGIBILITY
   ↓
PRE-FILL APPLICATION
   ↓
ADD SCHEME-SPECIFIC DATA
   ↓
SUBMIT APPLICATION
   ↓
TRACK STATUS
   ↓
APPROVAL/REJECTION
   ↓
BENEFIT DISBURSEMENT
   ↓
BENEFIT HISTORY
```

# 17. Core Principle

The user experience must demonstrate:

> **Register Once → Verify Once → Reuse Across Schemes → Track Benefits**
