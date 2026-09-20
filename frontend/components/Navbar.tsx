'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShieldCheck, FileText, Gift, Bell, ShieldAlert, Megaphone } from 'lucide-react';
import { GovHeader } from './GovHeader';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const navItems = [
    { label: 'Home / Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Family Registry', href: '/family', icon: Users },
    { label: 'Schemes & Eligibility', href: '/schemes', icon: ShieldCheck },
    { label: 'Track Applications', href: '/applications', icon: FileText },
    { label: 'DBT Benefits Ledger', href: '/benefits', icon: Gift },
    { label: 'Officer Desk', href: '/verification', icon: ShieldAlert },
  ];

  return (
    <div className="w-full">
      <GovHeader />

      {/* Main Indian Govt Navigation Bar */}
      <nav className="bg-blue-900 border-t-2 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-4 transition-all shrink-0 ${
                      isActive
                        ? 'bg-blue-800 text-white border-amber-400 font-black'
                        : 'text-blue-100 hover:bg-blue-800/60 hover:text-white border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/notifications"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] rounded uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
              >
                <Bell className="w-3 h-3" />
                <span>Alerts</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Official Government Ticker Marquee */}
      <div className="bg-amber-50 border-b border-amber-200 py-1.5 px-4 text-xs font-semibold text-amber-900 flex items-center gap-3">
        <div className="bg-amber-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
          <Megaphone className="w-3 h-3" />
          <span>OFFICIAL ANNOUNCEMENT</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-ellipsis">
          <span>
            Gujarat Kutumb Setu Identification Card is mandatory for Direct Benefit Transfer (DBT) disbursements under Mukhyamantri Yuva Swavalamban Yojana and State Welfare Schemes for FY 2025-26.
          </span>
        </div>
      </div>
    </div>
  );
};
