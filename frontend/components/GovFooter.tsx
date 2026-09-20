'use client';

import React from 'react';
import Link from 'next/link';

export const GovFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 text-xs border-t-4 border-amber-500 mt-12 select-none">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
              GJ
            </div>
            <div>
              <span className="block text-sm font-bold text-white">GUJARAT KUTUMB SETU</span>
              <span className="block text-[10px] text-amber-400 uppercase font-semibold">Government Beneficiary Portal</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Unified Single Citizen Identity & Beneficiary Verification Management Infrastructure for seamless entitlement delivery.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><Link href="/" className="hover:text-amber-300">Dashboard Home</Link></li>
            <li><Link href="/family" className="hover:text-amber-300">Family Identification Profile</Link></li>
            <li><Link href="/schemes" className="hover:text-amber-300">State Schemes & Eligibility Directory</Link></li>
            <li><Link href="/applications" className="hover:text-amber-300">Track Application Status</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Important Portals</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><a href="https://gujarat.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300">Government of Gujarat (gujarat.gov.in)</a></li>
            <li><a href="https://digitalgujarat.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300">Digital Gujarat Portal</a></li>
            <li><a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300">National Portal of India (india.gov.in)</a></li>
            <li><a href="https://mygov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300">MyGov Gujarat</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Support & Helpdesk</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            State Call Centre Toll-Free Helpline:<br />
            <strong className="text-white text-sm">1800-233-5500</strong>
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Working Hours: 09:30 AM to 06:15 PM (Mon to Sat)
          </p>
        </div>
      </div>

      {/* Official Bottom Bar */}
      <div className="bg-slate-950 py-4 px-4 text-[11px] text-slate-400 text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-slate-300">
          <span className="hover:underline cursor-pointer">Terms & Conditions</span>
          <span>|</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span>|</span>
          <span className="hover:underline cursor-pointer">Hyperlinking Policy</span>
          <span>|</span>
          <span className="hover:underline cursor-pointer">Copyright Policy</span>
          <span>|</span>
          <span className="hover:underline cursor-pointer">Disclaimer</span>
        </div>

        <p className="text-[10px]">
          Content Owned, Maintained & Updated by Department of Social Justice & Empowerment, Government of Gujarat.<br />
          Designed, Developed and Hosted by <strong className="text-white">National Informatics Centre (NIC)</strong>.
        </p>
      </div>
    </footer>
  );
};
