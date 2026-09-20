'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Phone, KeyRound, ArrowRight, Sparkles, Building2, UserCheck, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { GovFooter } from '../../components/GovFooter';

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { mobile });
      setOtp('123456');
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { mobile, otp });
      localStorage.setItem('parivar_token', res.data.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoMobile: string) => {
    setMobile(demoMobile);
    setOtp('123456');
    setLoading(true);
    setError(null);

    api.post('/auth/verify-otp', { mobile: demoMobile, otp: '123456' })
      .then((res) => {
        localStorage.setItem('parivar_token', res.data.access_token);
        router.push('/');
      })
      .catch((err) => {
        setError(err.message || 'Quick login failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      <div>
        {/* Top Tricolor Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 border-b border-slate-300" />

        {/* Top Header Banner */}
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-6 flex items-center justify-between border-b border-slate-800">
          <span className="font-semibold text-amber-400">ગુજરાત સરકાર | Government of Gujarat</span>
          <span className="text-slate-300">Toll-Free Helpline: 1800-233-5500</span>
        </div>

        {/* Main Branding Bar */}
        <div className="bg-white border-b border-slate-300 py-4 px-6 shadow-xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-amber-500 flex flex-col items-center justify-center p-1 text-center shrink-0">
                <div className="text-[8px] font-extrabold text-amber-700">सत्यमेव</div>
                <div className="text-[8px] font-extrabold text-amber-700">जयते</div>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  ગુજરાત કુટુંબ સેતુ | GUJARAT KUTUMB SETU
                </h1>
                <p className="text-xs font-bold text-blue-900 uppercase">
                  Family Identification & Unified Beneficiary Portal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="max-w-md mx-auto my-10 px-4">
          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-md overflow-hidden">
            {/* Login Card Header */}
            <div className="bg-blue-900 text-white px-6 py-4 border-b-2 border-amber-500">
              <h2 className="text-base font-bold uppercase tracking-wide">
                Citizen & Officer Portal Sign In
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Enter registered mobile number for OTP authentication
              </p>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-xs font-bold">
                  {error}
                </div>
              )}

              {step === 'MOBILE' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                        +91
                      </div>
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <span>Processing Request...</span>
                    ) : (
                      <>
                        <span>Get Verification OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center justify-between">
                    <span>OTP sent to <strong>+91 {mobile}</strong></span>
                    <button
                      type="button"
                      onClick={() => setStep('MOBILE')}
                      className="text-amber-700 font-bold underline text-[11px]"
                    >
                      Change Mobile
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Enter 6-Digit Verification OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-lg font-bold font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Official Advisory Box */}
              <div className="p-3 bg-slate-100 border border-slate-300 rounded text-[11px] text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Official Portal Advisory</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Do not share OTP with anyone. Government officials will never ask for your mobile OTP.
                </p>
              </div>

              {/* Hackathon Demo Quick Access */}
              <div className="pt-4 border-t border-slate-200">
                <span className="block text-[10px] uppercase tracking-wider font-extrabold text-center text-slate-500 mb-2">
                  Hackathon Evaluation Test Accounts
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickLogin('9876543210')}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-300 rounded text-left transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                      Citizen (ABC)
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">9876543210</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('9000000001')}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-300 rounded text-left transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                      Govt Officer
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">9000000001</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GovFooter />
    </div>
  );
}
