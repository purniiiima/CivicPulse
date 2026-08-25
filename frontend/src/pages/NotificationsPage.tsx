import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  Wrench,
  AlertCircle,
  Check,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'worker_assigned':
        return <Wrench className="w-4 h-4 text-[#2C7A7B]" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <Check className="w-4 h-4 text-[#F4B942]" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status updates and municipal actions on your reported tickets.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-[#102A43] text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'unread'
              ? 'bg-[#102A43] text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] overflow-hidden shadow-xs divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#102A43]">
              No {filter === 'unread' ? 'Unread' : ''} Notifications
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You're all caught up! When municipal teams update your reports, updates will appear here.
            </p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                !notif.read ? 'bg-teal-50/40 hover:bg-teal-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#102A43]">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-snug">
                  {notif.message}
                </p>

                {notif.issueId && (
                  <div className="pt-1.5">
                    <Link
                      to={`/issues/${notif.issueId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2C7A7B] hover:text-[#102A43]"
                    >
                      <span>View Ticket Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
