'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { GovFooter } from '../../components/GovFooter';
import { 
  Users, UserPlus, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, 
  Plus, FileText, Check, X, ShieldAlert, ArrowRight, Building2, Search, Clock
} from 'lucide-react';
import api from '../../services/api';
import { Family, FamilyMember } from '../../types';

export default function FamilyPage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // 2-Step Member Add Form state
  const [aadhaarInput, setAadhaarInput] = useState('UID-MOCK-004');
  const [fetchingAadhaar, setFetchingAadhaar] = useState(false);
  const [aadhaarFetched, setAadhaarFetched] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    relationship: 'SON',
    mobile: '',
    identity_reference: '',
    occupation: 'Private Job',
    is_student: false,
    education_level: 'Undergraduate',
    // Income fields
    annual_amount: '150000',
    financial_year: '2025-26',
    income_source: 'Salary',
    certificate_number: 'INC-MOCK-004',
  });

  const fetchFamilyData = async () => {
    try {
      const res = await api.get<Family>('/families/me');
      if (res.data) {
        setFamily(res.data);
      } else {
        const createRes = await api.post<Family>('/families', {
          address: '101 Green Park, Vastrapur',
          district: 'Ahmedabad',
          taluka: 'Ahmedabad City',
          city_village: 'Ahmedabad',
          pincode: '380015',
        });
        setFamily(createRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load family information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  // Step 1: Fetch Aadhaar Data from Mock Government Registry
  const handleFetchAadhaar = async (refCode: string) => {
    if (!refCode) return;
    setFetchingAadhaar(true);
    setError(null);

    try {
      const res = await api.get(`/verification/fetch-aadhaar/${refCode}`);
      if (res.data.verified && res.data.record) {
        const rec = res.data.record;
        setNewMember(prev => ({
          ...prev,
          name: rec.name,
          dob: rec.dob,
          gender: rec.gender,
          identity_reference: refCode.trim().toUpperCase(),
        }));
        setAadhaarFetched(true);
        setSuccessMsg(`Government Aadhaar record fetched & verified for '${rec.name}'! Proceed to declare relationship & income.`);
      } else {
        setError(res.data.message || 'Aadhaar reference code not found in e-KYC registry.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Aadhaar data.');
    } finally {
      setFetchingAadhaar(false);
    }
  };

  // Step 2: Submit Enrolment Request
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;
    setError(null);

    try {
      // 1. Add member
      const memberRes = await api.post(`/families/${family.id}/members`, {
        name: newMember.name,
        dob: newMember.dob,
        gender: newMember.gender,
        relationship: newMember.relationship,
        mobile: newMember.mobile,
        identity_reference: newMember.identity_reference,
        occupation: newMember.occupation,
        is_student: newMember.is_student,
        education_level: newMember.education_level,
      });

      const memberId = memberRes.data.id;

      // 2. Add income if provided
      if (parseFloat(newMember.annual_amount) > 0) {
        await api.post('/verification/income', {
          member_id: memberId,
          financial_year: newMember.financial_year,
          income_source: newMember.income_source,
          annual_amount: parseFloat(newMember.annual_amount),
          certificate_number: newMember.certificate_number,
        });
      }

      setShowAddMemberModal(false);
      setSuccessMsg(`Member '${newMember.name}' enrolment request submitted! Sent to Officer Approval Desk.`);
      
      // Reset form
      setAadhaarInput('UID-MOCK-004');
      setAadhaarFetched(false);
      setNewMember({
        name: '',
        dob: '',
        gender: 'Male',
        relationship: 'SON',
        mobile: '',
        identity_reference: '',
        occupation: 'Private Job',
        is_student: false,
        education_level: 'Undergraduate',
        annual_amount: '150000',
        financial_year: '2025-26',
        income_source: 'Salary',
        certificate_number: 'INC-MOCK-004',
      });

      fetchFamilyData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit member enrolment.');
    }
  };

  const handleConfirmFamily = async () => {
    if (!family) return;
    setError(null);
    try {
      const res = await api.post(`/families/${family.id}/confirm`);
      setFamily(res.data);
      setSuccessMsg(`Family profile verified & unique Family ID generated: ${res.data.family_id}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm family.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Gujarat Kutumb Setu...</p>
        </div>
        <GovFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Banner Messages */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded text-red-800 text-xs font-bold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Official Family Details Box */}
          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="bg-blue-900 text-white px-6 py-4 border-b-2 border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-black uppercase tracking-wide">
                    State Family Identification Profile
                  </h1>
                  <StatusBadge status={family?.verification_status || 'DRAFT'} />
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Gujarat Kutumb Setu Card & Citizen Registry Database
                </p>
              </div>

              {family?.verification_status !== 'VERIFIED' ? (
                <button
                  onClick={handleConfirmFamily}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Issue Family ID</span>
                </button>
              ) : (
                <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-400 rounded text-amber-900 font-extrabold font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  <span>Family ID: {family?.family_id}</span>
                </div>
              )}
            </div>

            {/* Address Information Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div>
                <span className="block font-bold text-slate-500 uppercase text-[10px]">Residential Address</span>
                <span className="font-extrabold text-slate-900">{family?.address || 'Not Provided'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-500 uppercase text-[10px]">District</span>
                <span className="font-extrabold text-slate-900">{family?.district || 'Not Provided'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-500 uppercase text-[10px]">Taluka / Municipal Area</span>
                <span className="font-extrabold text-slate-900">{family?.taluka} ({family?.city_village})</span>
              </div>
              <div>
                <span className="block font-bold text-slate-500 uppercase text-[10px]">Postal Pincode</span>
                <span className="font-extrabold text-slate-900">{family?.pincode}</span>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-3.5 border-b-2 border-amber-500 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide">
                  Enrolled Family Members ({family?.members?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-300">
                  Government e-KYC verified attributes & Officer approved relationships
                </p>
              </div>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enrol New Family Member</span>
              </button>
            </div>

            {/* Member Cards Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {family?.members?.map((member) => {
                const isFullyApproved = member.identity_verified && member.relationship_verified;

                return (
                  <div
                    key={member.id}
                    className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900">
                              {member.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-extrabold text-[10px] uppercase rounded border border-blue-300">
                              {member.relationship}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            DOB: {member.dob} • Gender: {member.gender}
                          </p>
                        </div>
                      </div>

                      {/* Overall Approval Status Badge */}
                      <div className="p-2.5 rounded border text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-[11px]">Officer Approval Status</span>
                        {isFullyApproved ? (
                          <StatusBadge status="VERIFIED" />
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-950 border border-amber-400">
                            <Clock className="w-3 h-3 text-amber-700" />
                            PENDING OFFICER APPROVAL
                          </span>
                        )}
                      </div>

                      {/* Attributes Breakdown */}
                      <div className="space-y-2 text-xs">
                        {/* Aadhaar e-KYC Record */}
                        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded flex items-center justify-between">
                          <div>
                            <span className="block font-bold text-slate-800 text-[11px]">Aadhaar e-KYC Record</span>
                            <span className="text-[10px] font-mono text-slate-500">{member.identity_reference || 'Ref pending'}</span>
                          </div>
                          {member.identity_verified ? (
                            <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-extrabold rounded">
                              ✓ Govt Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-bold rounded">
                              Unverified
                            </span>
                          )}
                        </div>

                        {/* Relationship Status */}
                        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded flex items-center justify-between">
                          <div>
                            <span className="block font-bold text-slate-800 text-[11px]">Declared Relationship</span>
                            <span className="text-[10px] text-slate-600">{member.relationship} to Head</span>
                          </div>
                          {member.relationship_verified ? (
                            <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-extrabold rounded">
                              ✓ Officer Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 border border-amber-400 text-amber-950 text-[10px] font-bold rounded">
                              Pending Review
                            </span>
                          )}
                        </div>

                        {/* Income Certificate Status */}
                        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded space-y-1">
                          <span className="block font-bold text-slate-800 text-[11px]">Income Declaration</span>
                          {member.income_records && member.income_records.length > 0 ? (
                            member.income_records.map((inc) => (
                              <div key={inc.id} className="flex items-center justify-between text-[10px] text-slate-700">
                                <span>{inc.financial_year} ({inc.income_source}): ₹{inc.annual_amount.toLocaleString('en-IN')}</span>
                                <StatusBadge status={inc.verification_status} />
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-500 italic">No income declared</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isFullyApproved && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[10px] text-amber-800 font-semibold text-center flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Request submitted to Officer Approval Desk (`/verification`)</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* 2-Step Enrol Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg border-2 border-slate-300 shadow-xl overflow-hidden">
            <div className="bg-blue-900 text-white px-5 py-3 border-b-2 border-amber-500 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase">Enrol Family Member (Aadhaar + Officer Flow)</h3>
              <button onClick={() => setShowAddMemberModal(false)}><X className="w-5 h-5 text-slate-300" /></button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Step 1: Aadhaar Fetch */}
              <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold uppercase text-[11px]">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Fetch Government Aadhaar e-KYC Data</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aadhaarInput}
                    onChange={(e) => setAadhaarInput(e.target.value)}
                    placeholder="e.g. UID-MOCK-004 or 12-digit Aadhaar"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleFetchAadhaar(aadhaarInput)}
                    disabled={fetchingAadhaar}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase rounded flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {fetchingAadhaar ? 'Fetching...' : 'Fetch Aadhaar Data'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="font-bold text-slate-500">Quick Demo Codes:</span>
                  <button type="button" onClick={() => { setAadhaarInput('UID-MOCK-004'); handleFetchAadhaar('UID-MOCK-004'); }} className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-mono font-bold hover:bg-blue-200">UID-MOCK-004 (Charlie)</button>
                  <button type="button" onClick={() => { setAadhaarInput('UID-MOCK-003'); handleFetchAadhaar('UID-MOCK-003'); }} className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-mono font-bold hover:bg-blue-200">UID-MOCK-003 (Bob)</button>
                </div>

                {aadhaarFetched && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 font-bold space-y-1 text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Aadhaar Details Fetched:</span>
                    </div>
                    <p className="text-slate-800 font-semibold">
                      Name: <strong>{newMember.name}</strong> • DOB: <strong>{newMember.dob}</strong> • Gender: <strong>{newMember.gender}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Declare Relationship & Income */}
              {aadhaarFetched && (
                <form onSubmit={handleAddMember} className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-blue-900 font-bold uppercase text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Declare Relationship & Income for Officer Approval</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Relationship to Head</label>
                      <select
                        value={newMember.relationship}
                        onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-black text-blue-900"
                      >
                        <option value="SON">SON</option>
                        <option value="DAUGHTER">DAUGHTER</option>
                        <option value="WIFE">WIFE</option>
                        <option value="HUSBAND">HUSBAND</option>
                        <option value="FATHER">FATHER</option>
                        <option value="MOTHER">MOTHER</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Declared Annual Income (₹)</label>
                      <input
                        type="number"
                        value={newMember.annual_amount}
                        onChange={(e) => setNewMember({ ...newMember, annual_amount: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Income Source</label>
                      <select
                        value={newMember.income_source}
                        onChange={(e) => setNewMember({ ...newMember, income_source: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold"
                      >
                        <option value="Salary">Salary</option>
                        <option value="Business">Business</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Income Certificate Ref</label>
                      <input
                        type="text"
                        value={newMember.certificate_number}
                        onChange={(e) => setNewMember({ ...newMember, certificate_number: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-950 font-medium">
                    <span className="font-bold block text-amber-900">Officer Approval Required:</span>
                    Submitting will create an enrolment ticket in the Nodal Officer Desk (`/verification`). You can manually log into the officer account to approve this member!
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Member Enrolment Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <GovFooter />
    </div>
  );
}
