'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { GovFooter } from '../../components/GovFooter';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, UserCheck, ShieldAlert, Check, X
} from 'lucide-react';
import api from '../../services/api';
import { ManualVerification, User } from '../../types';

export default function VerificationPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [verifications, setVerifications] = useState<ManualVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const userRes = await api.get<User>('/auth/me');
      setCurrentUser(userRes.data);

      const verRes = await api.get<ManualVerification[]>('/verification/manual');
      setVerifications(verRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load officer verification desk data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    setError(null);
    try {
      await api.patch(`/verification/manual/${id}`, {
        status: status,
        remarks: status === 'APPROVED' 
          ? 'Approved after verification of official record by Nodal Officer.' 
          : 'Rejected due to insufficient or mismatched documentation.',
      });

      setSuccessMsg(`Verification ticket #${id} successfully updated to ${status}!`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update verification status.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Nodal Officer Desk...</p>
        </div>
        <GovFooter />
      </div>
    );
  }

  const isOfficer = currentUser?.role === 'OFFICER' || currentUser?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Banner */}
          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="bg-blue-900 text-white px-6 py-4 border-b-2 border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                  <h1 className="text-lg font-black uppercase tracking-wide">
                    Nodal Officer Verification Desk
                  </h1>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Gujarat Kutumb Setu • Manual Attribute & Member Approval Review Portal
                </p>
              </div>

              <div className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wide rounded flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Active Role: {currentUser?.role} ({currentUser?.mobile})</span>
              </div>
            </div>

            {!isOfficer && (
              <div className="p-4 bg-amber-50 border-b border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Notice: You are logged in as a Citizen. To approve member enrolment requests, please log in using the Nodal Officer account (Mobile: <strong>9000000001</strong>).
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
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

          {/* Verification Tickets Table */}
          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-3.5 border-b-2 border-amber-500 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wide">
                Pending Verification Tickets Queue ({verifications.length})
              </h2>
              <span className="text-xs text-slate-300">Updated in real-time</span>
            </div>

            <div className="p-6">
              {verifications.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">All member & relationship verification tickets cleared!</p>
                  <p className="text-xs text-slate-500">New citizen enrolment requests will appear here instantly.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase border-b border-slate-300">
                        <th className="py-3 px-4 border-r border-slate-300">Ticket ID</th>
                        <th className="py-3 px-4 border-r border-slate-300">Verification Type</th>
                        <th className="py-3 px-4 border-r border-slate-300">Enrolment Remarks & Details</th>
                        <th className="py-3 px-4 border-r border-slate-300">Current Status</th>
                        <th className="py-3 px-4 text-center">Officer Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                      {verifications.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 border-r border-slate-300 font-mono font-bold">
                            #{item.id}
                          </td>
                          <td className="py-3 px-4 border-r border-slate-300 font-extrabold text-blue-900 uppercase">
                            {item.verification_type}
                          </td>
                          <td className="py-3 px-4 border-r border-slate-300">
                            <p className="font-bold text-slate-900">{item.remarks || 'Member Enrolment & Relationship Verification Request'}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Family Ref #{item.family_id} • Member Ref #{item.member_id}</p>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-300">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.status === 'PENDING' ? (
                              isOfficer ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                                    disabled={processingId === item.id}
                                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] uppercase rounded shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve Member</span>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                                    disabled={processingId === item.id}
                                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-extrabold text-[11px] uppercase rounded shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 italic">Login as Officer to Approve</span>
                              )
                            ) : (
                              <span className="text-[11px] font-bold text-slate-600 uppercase">
                                Action Completed ({item.status})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <GovFooter />
    </div>
  );
}
