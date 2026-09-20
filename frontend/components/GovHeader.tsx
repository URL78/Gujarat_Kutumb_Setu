'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Phone, User as UserIcon, LogOut, ShieldCheck, Sparkles, Building2, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { User, Family } from '../types';

export const GovHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  useEffect(() => {
    const token = localStorage.getItem('parivar_token');
    if (!token) return;

    api.get<User>('/auth/me')
      .then((res) => {
        setUser(res.data);
        return api.get<Family>('/families/me');
      })
      .then((res) => {
        if (res.data) setFamily(res.data);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('parivar_token');
    setUser(null);
    setFamily(null);
    router.push('/login');
  };

  if (pathname === '/login') return null;

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-xs select-none">
      {/* Top Tricolor Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 border-b border-slate-200" />

      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-amber-400">ગુજરાત સરકાર | Government of Gujarat</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">Department of Social Justice & Empowerment</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          {/* Helpline */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Phone className="w-3 h-3 text-amber-400" />
            <span>Toll-Free Helpline: <strong className="text-white">1800-233-5500</strong></span>
          </div>

          {/* Accessibility Font Size Toggle */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-700 pl-3">
            <button onClick={() => setFontSize('sm')} className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold">A-</button>
            <button onClick={() => setFontSize('base')} className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold">A</button>
            <button onClick={() => setFontSize('lg')} className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold">A+</button>
          </div>

          {/* Language Switch */}
          <div className="border-l border-slate-700 pl-3 text-slate-300 font-medium">
            <span>English</span> / <span className="text-slate-400 hover:text-white cursor-pointer">ગુજરાતી</span>
          </div>
        </div>
      </div>

      {/* Main Official Header Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: State Emblem + Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-amber-500 flex flex-col items-center justify-center p-1 text-center shadow-xs shrink-0">
            <div className="text-[9px] font-extrabold uppercase text-amber-700 leading-tight">सत्यमेव</div>
            <div className="text-[9px] font-extrabold uppercase text-amber-700 leading-tight">जयते</div>
            <div className="w-6 h-0.5 bg-emerald-600 my-0.5" />
            <div className="text-[7px] font-bold text-slate-700">GUJARAT</div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ગુજરાત કુટુંબ સેતુ | GUJARAT KUTUMB SETU
              </h1>
            </div>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              Family Identification & Unified Scheme Delivery Portal
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Government of Gujarat • Official Citizen Services Platform
            </p>
          </div>
        </div>

        {/* Right: Active Family ID Pill & User Credentials */}
        <div className="flex items-center gap-3">
          {family?.family_id && (
            <div className="px-3.5 py-2 bg-amber-50 border-2 border-amber-400 rounded-lg text-amber-900 font-extrabold text-xs flex items-center gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <div>
                <span className="block text-[9px] text-amber-700 uppercase tracking-wider font-bold">Unified Family ID</span>
                <span className="text-sm font-mono tracking-wide">{family.family_id}</span>
              </div>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <span className="block font-bold text-slate-900">{user.mobile}</span>
                <span className="inline-block px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded uppercase">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
