'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { GovFooter } from '../../components/GovFooter';
import { Gift, CreditCard, Building2 } from 'lucide-react';
import api from '../../services/api';
import { Benefit } from '../../types';

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Benefit[]>('/benefits')
      .then((res) => setBenefits(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Benefits Ledger...</p>
        </div>
        <GovFooter />
      </div>
    );
  }

  const totalAmount = benefits.reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Banner */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-extrabold uppercase">
                Direct Benefit Transfer (DBT) Ledger
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                Disbursed Entitlement Summary
              </h1>
              <p className="text-xs text-slate-600">
                Aadhaar seeded direct electronic credit disbursement history
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-right shrink-0">
              <span className="block text-[10px] uppercase font-bold text-emerald-900">Total Lifetime Disbursed</span>
              <span className="text-2xl font-black text-emerald-950">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Benefits List Table */}
          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-3 border-b-2 border-amber-500 font-extrabold text-xs uppercase">
              DBT Disbursement Records ({benefits.length})
            </div>

            {benefits.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Gift className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Disbursed Benefits Found</p>
                <p className="text-[11px] text-slate-500">
                  Approved scheme benefits will be credited directly to your Aadhaar-seeded bank account.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {benefits.map((b) => (
                  <div key={b.id} className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {b.benefit_type}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="text-lg font-extrabold text-emerald-800">
                        ₹{b.amount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <span>Date: {b.disbursed_at ? new Date(b.disbursed_at).toLocaleDateString('en-IN') : 'Processing'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <GovFooter />
    </div>
  );
}
