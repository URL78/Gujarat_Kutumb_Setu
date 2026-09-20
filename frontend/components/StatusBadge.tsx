import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRightCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';

  switch (normalized) {
    case 'VERIFIED':
    case 'APPROVED':
    case 'BENEFIT_DISBURSED':
    case 'DISBURSED':
    case 'ELIGIBLE':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-400 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          {normalized.replace('_', ' ')}
        </span>
      );

    case 'DRAFT':
    case 'POTENTIALLY_ELIGIBLE':
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-100 text-blue-900 border border-blue-400 ${className}`}>
          <ArrowRightCircle className="w-3 h-3 text-blue-700" />
          {normalized.replace('_', ' ')}
        </span>
      );

    case 'PENDING':
    case 'PENDING_VERIFICATION':
    case 'UNDER_VERIFICATION':
    case 'UNDER_REVIEW':
    case 'VERIFICATION_PENDING':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-amber-100 text-amber-950 border border-amber-400 ${className}`}>
          <Clock className="w-3 h-3 text-amber-700" />
          {normalized.replace('_', ' ')}
        </span>
      );

    case 'ADDITIONAL_INFORMATION_REQUIRED':
    case 'REQUEST_MORE_INFORMATION':
    case 'MISMATCH':
    case 'NOT_FOUND':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-orange-100 text-orange-950 border border-orange-400 ${className}`}>
          <AlertTriangle className="w-3 h-3 text-orange-700" />
          {normalized.replace(/_/g, ' ')}
        </span>
      );

    case 'REJECTED':
    case 'INELIGIBLE':
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-red-100 text-red-900 border border-red-400 ${className}`}>
          <XCircle className="w-3 h-3 text-red-700" />
          {normalized.replace('_', ' ')}
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300 ${className}`}>
          {normalized.replace('_', ' ')}
        </span>
      );
  }
};
