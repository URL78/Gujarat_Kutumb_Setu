'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../components/Navbar';
import { StatusBadge } from '../../../components/StatusBadge';
import { GovFooter } from '../../../components/GovFooter';
import { 
  CheckCircle2, Clock, FileText, ArrowLeft, ShieldCheck, 
  Sparkles, AlertCircle, Building2, User
} from 'lucide-react';
import api from '../../../services/api';
import { Application, ApplicationStatusHistory } from '../../../types';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const appId = resolvedParams.id;

  const [app, setApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Officer test transition state
  const [targetStatus, setTargetStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('Verification completed and approved by nodal officer.');
  const [updating, setUpdating] = useState(false);

  const fetchAppData = async () => {
    try {
      const [appRes, histRes] = await Promise.all([
        api.get<Application>(`/applications/${appId}`),
        api.get<ApplicationStatusHistory[]>(`/applications/${appId}/history`),
      ]);
      setApp(appRes.data);
      setHistory(histRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, [appId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setUpdating(true);
    setError(null);

    try {
      await api.patch(`/applications/${app.id}/status`, {
        status: targetStatus,
        remarks: remarks,
      });
      fetchAppData();
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Application Audit Logs...</p>
        </div>
        <GovFooter />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-20 text-center space-y-2">
          <p className="text-red-600 font-bold text-sm">Application record not found.</p>
          <Link href="/applications" className="text-blue-900 font-bold text-xs underline">
            Return to Application Register
          </Link>
        </div>
        <GovFooter />
      </div>
    );
  }

  const steps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_VERIFICATION', label: 'Department Verification' },
    { key: 'UNDER_REVIEW', label: 'Officer Review' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'BENEFIT_DISBURSED', label: 'Disbursed (DBT)' },
  ];

  const currentStepIdx = steps.findIndex(s => s.key === app.status);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      <div>
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Applications Register</span>
          </Link>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded text-red-800 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Application Header Card */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-900 text-xs bg-blue-50 px-2.5 py-0.5 rounded border border-blue-300">
                    {app.application_no}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <h1 className="text-xl font-black text-slate-900 mt-1">
                  {app.scheme_name}
                </h1>
                <p className="text-xs text-slate-600">
                  Beneficiary Member: <strong>{app.member_name}</strong> • Entitlement: {app.scheme_benefit}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Tracker */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold uppercase text-slate-700">
              State Department Workflow Timeline
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 py-2">
              {steps.map((step, idx) => {
                const isCompleted = currentStepIdx > idx || app.status === 'BENEFIT_DISBURSED';
                const isCurrent = app.status === step.key;

                return (
                  <div key={step.key} className={`p-3 rounded border text-center space-y-1 ${
                    isCurrent
                      ? 'bg-blue-900 text-white border-blue-950 font-bold'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-semibold'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    <div className="text-[10px] uppercase font-bold tracking-wider">Step {idx + 1}</div>
                    <div className="text-xs font-extrabold leading-tight">{step.label}</div>
                    <div className="text-[10px]">
                      {isCurrent ? '● IN PROGRESS' : isCompleted ? '✓ PASSED' : 'PENDING'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-3 border-b-2 border-amber-500 font-extrabold text-xs uppercase">
              Immutable Departmental Audit History Logs
            </div>

            <div className="divide-y divide-slate-200">
              {history.map((h) => (
                <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">Status Updated To:</span>
                      <StatusBadge status={h.new_status} />
                    </div>
                    <p className="text-slate-600">
                      Officer Remarks: "{h.remarks || 'Standard automated progression'}"
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(h.changed_at).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Officer State Transition Tool */}
          <div className="bg-white border-2 border-blue-900 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs uppercase border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Departmental Officer Workflow Action Control Panel</span>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Next Status</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900"
                  >
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="BENEFIT_DISBURSED">BENEFIT_DISBURSED</option>
                    <option value="ADDITIONAL_INFORMATION_REQUIRED">ADDITIONAL_INFO_REQUIRED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Officer Decision Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="py-2.5 px-5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs uppercase tracking-wider rounded cursor-pointer transition-colors"
              >
                {updating ? 'Executing...' : 'Submit Officer Status Decision'}
              </button>
            </form>
          </div>
        </main>
      </div>

      <GovFooter />
    </div>
  );
}
