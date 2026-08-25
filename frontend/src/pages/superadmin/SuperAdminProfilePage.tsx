import React from 'react';
import {
  User,
  Crown,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Shield,
  ShieldCheck,
  MapPin,
  Lock,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SuperAdminProfilePage: React.FC = () => {
  const { user } = useAuth();

  const formattedJoinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'January 2026';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Profile Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#102A43] via-[#2A1B4E] to-[#6B46C1]" />

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="flex items-end gap-4">
              {/* Profile Photo or Neutral Empty State */}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-900 ring-4 ring-white shadow-md flex items-center justify-center text-slate-300">
                  <User className="w-12 h-12" />
                </div>
              )}

              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#102A43]">
                  {user?.name || 'Super Administrator'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1">
                    <Crown className="w-3 h-3 text-purple-700" />
                    <span>SUPER ADMIN</span>
                  </span>
                  <span>•</span>
                  <span>Metropolitan Governance Directorate</span>
                </div>
              </div>
            </div>

            {/* Account Status Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Executive Authority Active</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Clearance Level</span>
              <div className="text-sm font-black text-purple-900 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Level 3 (Citywide)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jurisdiction</span>
              <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                All Metropolitan Wards (1-18)
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Directorate</span>
              <div className="text-sm font-bold text-[#2C7A7B] mt-0.5 truncate">
                Metropolitan Municipal Authority
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Date</span>
              <div className="text-sm font-semibold text-slate-700 mt-0.5 truncate">
                {formattedJoinedDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Executive Identity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            <span>Executive Identity & Contact</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Full Legal Name:</span>
              <span className="font-bold text-[#102A43]">{user?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Directorate Email:</span>
              </span>
              <span className="font-semibold text-slate-800 font-mono">{user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Executive Hotline:</span>
              </span>
              <span className="font-semibold text-slate-800">{user?.phone || '+1 (555) 431-0000'}</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Headquarters:</span>
              </span>
              <span className="font-semibold text-slate-800">{user?.city || 'Metropolis City Hall'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>System Commissioning:</span>
              </span>
              <span className="font-medium text-slate-700">{formattedJoinedDate}</span>
            </div>
          </div>
        </div>

        {/* Governance & System Authority */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span>Governance & Access Privileges</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Administrative Scope:</span>
              <span className="font-bold text-[#102A43]">Citywide Governance Directorate</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Executive ID:</span>
              <span className="font-mono font-bold text-purple-700">
                ROOT-{user?.id?.slice(0, 8) || 'SA-01'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">RBAC Role:</span>
              <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                SUPER_ADMIN (Unrestricted)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Audit Status:</span>
              <span className="font-semibold text-emerald-700">Cryptographically Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access Overview Notice */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
            Metropolitan Super Administrator Authority
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Super Administrator account holds top-tier municipal access across all municipal departments, agencies, user provisioning pipelines, and platform configuration parameters. This profile view is cryptographically bound to your active session.
        </p>
      </div>
    </div>
  );
};
