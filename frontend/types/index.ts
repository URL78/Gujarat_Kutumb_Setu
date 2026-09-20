export interface User {
  id: number;
  mobile: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN';
  status: string;
  created_at: string;
}

export interface MemberIncome {
  id: number;
  member_id: number;
  financial_year: string;
  income_source: string;
  annual_amount: number;
  certificate_id?: string;
  verification_status: 'VERIFIED' | 'PENDING_VERIFICATION' | 'UNVERIFIED' | 'REJECTED';
  created_at: string;
}

export interface Document {
  id: number;
  member_id: number;
  document_type: string;
  reference_number: string;
  issue_date?: string;
  expiry_date?: string;
  source: string;
  status: string;
  created_at: string;
}

export interface FamilyMember {
  id: number;
  family_id: number;
  name: string;
  dob: string;
  gender: string;
  relationship: 'HEAD' | 'WIFE' | 'HUSBAND' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER' | 'OTHER';
  mobile?: string;
  identity_reference?: string;
  identity_verified: boolean;
  relationship_verified: boolean;
  occupation?: string;
  is_student: boolean;
  education_level?: string;
  disability_status: boolean;
  created_at: string;
  income_records?: MemberIncome[];
  documents?: Document[];
}

export interface Family {
  id: number;
  family_id?: string;
  family_head_id: number;
  address?: string;
  district?: string;
  taluka?: string;
  city_village?: string;
  pincode?: string;
  verification_status: 'DRAFT' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  created_at: string;
  members: FamilyMember[];
}

export interface SchemeRequirement {
  id: number;
  scheme_id: number;
  attribute: string;
  operator: string;
  expected_value: string;
  required: boolean;
}

export interface Scheme {
  id: number;
  name: string;
  department: string;
  description: string;
  benefit: string;
  status: string;
  created_at: string;
  requirements: SchemeRequirement[];
}

export interface EligibilityCheckRule {
  rule: string;
  passed: boolean;
  details?: string;
}

export interface EligibilityResult {
  scheme_id: number;
  scheme_name: string;
  status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'INELIGIBLE' | 'VERIFICATION_PENDING';
  checks: EligibilityCheckRule[];
  missing_information: string[];
  eligible_member_ids: number[];
}

export interface ApplicationStatusHistory {
  id: number;
  application_id: number;
  old_status?: string;
  new_status: string;
  changed_by?: number;
  changed_at: string;
  remarks?: string;
}

export interface Application {
  id: number;
  application_no: string;
  family_id: number;
  member_id?: number;
  scheme_id: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_VERIFICATION' | 'ADDITIONAL_INFORMATION_REQUIRED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'BENEFIT_DISBURSED';
  submitted_at?: string;
  created_at: string;
  scheme_name?: string;
  scheme_benefit?: string;
  member_name?: string;
}

export interface Benefit {
  id: number;
  application_id: number;
  benefit_type: string;
  amount: number;
  status: 'PENDING' | 'DISBURSED' | 'CANCELLED';
  disbursed_at?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  application_id?: number;
  type: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

export interface ManualVerification {
  id: number;
  family_id?: number;
  member_id?: number;
  verification_type: string;
  status: 'PENDING' | 'APPROVED' | 'REQUEST_MORE_INFORMATION' | 'REJECTED';
  remarks?: string;
  created_at: string;
}
