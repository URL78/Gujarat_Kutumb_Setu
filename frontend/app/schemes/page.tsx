'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { GovFooter } from '../../components/GovFooter';
import { 
  ShieldCheck, Sparkles, ArrowRight, CheckCircle2, XCircle, AlertCircle, 
  Building2, Users, FileText, X, Check
} from 'lucide-react';
import api from '../../services/api';
import { Scheme, EligibilityResult } from '../../types';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Eligibility Modal State
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    api.get<Scheme[]>('/schemes')
      .then((res) => setSchemes(res.data))
      .catch((err) => setError(err.message || 'Failed to load schemes'))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckEligibility = async (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setEligibilityResult(null);
    setEvaluating(true);
    setApplySuccess(null);

    try {
      const res = await api.get<EligibilityResult>(`/schemes/${scheme.id}/eligibility`);
      setEligibilityResult(res.data);
    } catch (err: any) {
      setError(err.message || 'Eligibility check failed');
    } finally {
      setEvaluating(false);
    }
  };

  const handleApplyScheme = async (schemeId: number, memberId?: number) => {
    setApplying(true);
    setError(null);
    try {
      const res = await api.post('/applications', {
        scheme_id: schemeId,
        member_id: memberId || null,
      });
      const appId = res.data.id;
      await api.post(`/applications/${appId}/submit`);
      setApplySuccess(`Application submitted successfully! Application Reference No: ${res.data.application_no}`);
    } catch (err: any) {
      setError(err.message || 'Application submission failed.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Schemes Directory...</p>
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
          {/* Header */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs space-y-2">
            <span className="px-2.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-extrabold uppercase">
              Directory of State Welfare Schemes
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Government Schemes & Direct Entitlements
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl">
              Evaluate family entitlement in real-time against verified attributes under the Family Identification Database.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded text-red-800 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                      {scheme.department}
                    </span>
                    <Building2 className="w-4 h-4 text-slate-500" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {scheme.name}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {scheme.description}
                    </p>
                  </div>

                  {/* Benefit Box */}
                  <div className="p-3 rounded bg-emerald-50 border border-emerald-300 text-xs space-y-1">
                    <span className="block font-bold text-emerald-900 uppercase text-[10px]">
                      Scheme Entitlement Benefit
                    </span>
                    <p className="font-extrabold text-emerald-950">
                      {scheme.benefit}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleCheckEligibility(scheme)}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Test Family Eligibility</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Eligibility Evaluation Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-lg border-2 border-slate-300 shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-900 text-white px-6 py-4 border-b-2 border-amber-500 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Automated Rule Engine
                </span>
                <h3 className="text-base font-bold">
                  {selectedScheme.name}
                </h3>
              </div>
              <button onClick={() => setSelectedScheme(null)}>
                <X className="w-5 h-5 text-slate-300 hover:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {evaluating ? (
                <div className="py-8 flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-700">Evaluating verified family attributes...</p>
                </div>
              ) : eligibilityResult ? (
                <div className="space-y-5">
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Overall Entitlement Status:</span>
                    <StatusBadge status={eligibilityResult.status} />
                  </div>

                  {applySuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{applySuccess}</span>
                    </div>
                  )}

                  {/* Rules Checklist */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-600">Rule Checklist Audit</h4>

                    <div className="space-y-1.5">
                      {eligibilityResult.checks.map((c, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                            c.passed
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-red-50 border-red-300 text-red-950'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            {c.passed ? (
                              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-red-700 shrink-0" />
                            )}
                            <span>{c.rule}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-600">{c.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply Action */}
                  <div className="pt-4 border-t border-slate-200">
                    {eligibilityResult.status === 'ELIGIBLE' || eligibilityResult.status === 'POTENTIALLY_ELIGIBLE' ? (
                      <button
                        onClick={() => handleApplyScheme(selectedScheme.id, eligibilityResult.eligible_member_ids[0])}
                        disabled={applying || !!applySuccess}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {applying ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submit Application (Pre-filled Family ID)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-xs text-center text-slate-600 font-medium">
                        Family attributes do not meet mandatory eligibility requirements for this scheme.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <GovFooter />
    </div>
  );
}
