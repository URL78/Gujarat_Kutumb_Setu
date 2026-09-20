'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { GovFooter } from '../../components/GovFooter';
import { Bell, Check } from 'lucide-react';
import api from '../../services/api';
import { NotificationItem } from '../../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    api.get<NotificationItem[]>('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
        <Navbar />
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading System Alerts...</p>
        </div>
        <GovFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      <div>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs">
            <h1 className="text-2xl font-black text-slate-900">
              Official Portal System Alerts
            </h1>
            <p className="text-xs text-slate-600">
              Departmental communications regarding your Family ID and submitted applications
            </p>
          </div>

          <div className="bg-white border-2 border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-3 border-b-2 border-amber-500 font-extrabold text-xs uppercase">
              Alert Notifications Inbox
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No New Notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start justify-between gap-4 text-xs ${
                      n.read_status ? 'bg-white' : 'bg-blue-50/70 font-semibold'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                          {n.type}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!n.read_status && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-extrabold rounded"
                      >
                        Mark Read
                      </button>
                    )}
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
