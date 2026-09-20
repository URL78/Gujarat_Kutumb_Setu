'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { GovFooter } from '../../components/GovFooter';
import { FileText, ArrowRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Application } from '../../types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Application[]>('/applications')
      .then((res) => setApplications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Application Register...</p>
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
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-900 text-[11px] font-extrabold uppercase">
                Application Audit Register
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                State Application Status Tracker
              </h1>
              <p className="text-xs text-slate-600">
                Real-time departmental workflow audit history
              </p>
            </div>

            <Link
              href="/schemes"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs"
            >
              + Submit New Application
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white border-2 border-slate-300 rounded-lg p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Applications Logged</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                No active scheme applications found for your Family ID profile.
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-3 border-b-2 border-amber-500 font-extrabold text-xs uppercase">
                Submitted Application List
              </div>

              <div className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900 text-xs bg-blue-50 px-2.5 py-0.5 rounded border border-blue-300">
                          {app.application_no}
                        </span>
                        <StatusBadge status={app.status} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {app.scheme_name}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Beneficiary Member: <strong>{app.member_name}</strong> • Date: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN') : 'Draft'}
                      </p>
                    </div>

                    <Link
                      href={`/applications/${app.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>View Status Logs</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <GovFooter />
    </div>
  );
}
