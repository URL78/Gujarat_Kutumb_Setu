'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../components/Navbar';
import { StatusBadge } from '../components/StatusBadge';
import { GovFooter } from '../components/GovFooter';
import { 
  Users, ShieldCheck, FileText, Gift, ArrowRight, CheckCircle2, 
  Building2, UserPlus, Clock, Sparkles, ChevronRight, FileCheck
} from 'lucide-react';
import api from '../services/api';
import { Family, Application, Benefit, Scheme } from '../types';

export default function DashboardPage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('parivar_token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([
      api.get<Family>('/families/me').catch(() => ({ data: null })),
      api.get<Application[]>('/applications').catch(() => ({ data: [] })),
      api.get<Benefit[]>('/benefits').catch(() => ({ data: [] })),
      api.get<Scheme[]>('/schemes').catch(() => ({ data: [] })),
    ])
      .then(([famRes, appRes, bftRes, schRes]) => {
        if (famRes.data) setFamily(famRes.data);
        setApplications(appRes.data);
        setBenefits(bftRes.data);
        setSchemes(schRes.data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Gujarat Kutumb Setu Portal...</p>
        </div>
        <GovFooter />
      </div>
    );
  }

  const verifiedMembers = family?.members?.filter(m => m.identity_verified) || [];
  const totalMembers = family?.members?.length || 0;
  const verificationPercent = totalMembers > 0 ? Math.round((verifiedMembers.length / totalMembers) * 100) : 0;
  const totalDisbursedAmount = benefits.reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Welcome Official Banner */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-900 text-[11px] font-extrabold uppercase">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>State Unified Beneficiary Management Infrastructure</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Register Once, Verify Once Portal
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Single consolidated citizen family database under Government of Gujarat. Automated pre-verified eligibility assessment and direct benefit transfer delivery.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              {family ? (
                <Link
                  href="/family"
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-extrabold uppercase tracking-wider rounded border border-blue-950 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Family Profile ({family.family_id || 'Draft'})</span>
                </Link>
              ) : (
                <Link
                  href="/family"
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold uppercase tracking-wider rounded shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Family Profile</span>
                </Link>
              )}

              <Link
                href="/schemes"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold uppercase tracking-wider rounded shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Search Schemes Catalog</span>
              </Link>
            </div>
          </div>

          {/* Official Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Family ID Card */}
            <div className="bg-white p-5 rounded-lg border-2 border-slate-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-extrabold uppercase text-slate-600">Family ID Record</span>
                <Building2 className="w-4 h-4 text-blue-800" />
              </div>
              <div className="text-lg font-black font-mono text-slate-900">
                {family?.family_id ? family.family_id : 'Pending Confirmation'}
              </div>
              <div className="pt-1">
                <StatusBadge status={family?.verification_status || 'NOT_REGISTERED'} />
              </div>
            </div>

            {/* Verification Coverage */}
            <div className="bg-white p-5 rounded-lg border-2 border-slate-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-extrabold uppercase text-slate-600">Verification Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {verificationPercent}% Verified
              </div>
              <p className="text-[11px] text-slate-500">
                {verifiedMembers.length} of {totalMembers} family members identity verified
              </p>
            </div>

            {/* Applications Tracked */}
            <div className="bg-white p-5 rounded-lg border-2 border-slate-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-extrabold uppercase text-slate-600">Active Applications</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {applications.length} Submitted
              </div>
              <p className="text-[11px] text-slate-500">
                Pre-filled via Unified Family ID
              </p>
            </div>

            {/* Total Benefits Disbursed */}
            <div className="bg-white p-5 rounded-lg border-2 border-slate-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-extrabold uppercase text-slate-600">Disbursed DBT Amount</span>
                <Gift className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-emerald-800">
                ₹{totalDisbursedAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">
                Aadhaar Seeded Bank Account Transfer
              </p>
            </div>
          </div>

          {/* Main Grid: Applications Register & Eligibility Engine Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Applications Register (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3.5 border-b-2 border-amber-500 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide">
                      Active Application Status Register
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Real-time departmental workflow audit history
                    </p>
                  </div>
                  <Link
                    href="/applications"
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {applications.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No Applications Logged</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Explore available welfare schemes in the directory to check eligibility and submit pre-filled applications.
                    </p>
                    <Link
                      href="/schemes"
                      className="inline-block px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs uppercase tracking-wider rounded"
                    >
                      Browse Schemes Directory
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {applications.map((app) => (
                      <div key={app.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {app.application_no}
                            </span>
                            <StatusBadge status={app.status} />
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {app.scheme_name}
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Beneficiary Member: <strong>{app.member_name}</strong> • Benefit: {app.scheme_benefit}
                          </p>
                        </div>

                        <Link
                          href={`/applications/${app.id}`}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded text-center shrink-0"
                        >
                          View Status Logs
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Widgets (1 col) */}
            <div className="space-y-4">
              {/* Automated Rule Engine Box */}
              <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
                <div className="bg-blue-900 text-white px-5 py-3 border-b-2 border-amber-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wide">
                    Instant Eligibility Check
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Check your family's verified income, age, education, and district attributes against official scheme requirements.
                  </p>
                  <Link
                    href="/schemes"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Test Eligibility Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Officer Portal Link Box */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Nodal Officer Verification Portal</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Access officer review queue for document manual verification and departmental status approval.
                </p>
                <Link
                  href="/verification"
                  className="block w-full text-center py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded transition-colors"
                >
                  Open Officer Verification Center
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <GovFooter />
    </div>
  );
}
