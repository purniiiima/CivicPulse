import React from 'react';
import {
  User,
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  Layers,
  MapPin,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminProfilePage: React.FC = () => {
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
        <div className="h-32 bg-gradient-to-r from-[#102A43] via-[#1A365D] to-[#2C7A7B]" />

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
                <div className="w-24 h-24 rounded-2xl bg-slate-800 ring-4 ring-white shadow-md flex items-center justify-center text-slate-300">
                  <User className="w-12 h-12" />
                </div>
              )}

              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#102A43]">
                  {user?.name || 'Organization Administrator'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase tracking-wide">
                    ORGANIZATION ADMIN
                  </span>
                  <span>•</span>
                  <span>{user?.department || 'Infrastructure Operations Directorate'}</span>
                </div>
              </div>
            </div>

            {/* Read-Only Status Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Account Active</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Access Tier</span>
              <div className="text-sm font-black text-[#102A43] mt-0.5 flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Agency Level 2</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jurisdiction</span>
              <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                {user?.ward || 'All Metro Wards'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Municipal Agency</span>
              <div className="text-sm font-bold text-[#2C7A7B] mt-0.5 truncate">
                {user?.organizationName || 'Public Works Department'}
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
        {/* Contact & Administrative Identity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <User className="w-4 h-4 text-[#2C7A7B]" />
            <span>Administrator Identity & Contact</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Full Name:</span>
              <span className="font-bold text-[#102A43]">{user?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Official Email:</span>
              </span>
              <span className="font-semibold text-slate-800 font-mono">{user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Direct Phone:</span>
              </span>
              <span className="font-semibold text-slate-800">{user?.phone || 'Not configured'}</span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>City & Region:</span>
              </span>
              <span className="font-semibold text-slate-800">{user?.city || 'Metropolis City'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined System:</span>
              </span>
              <span className="font-medium text-slate-700">{formattedJoinedDate}</span>
            </div>
          </div>
        </div>

        {/* Agency Delegation & Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#F4B942]" />
            <span>Departmental Assignment</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Assigned Agency:</span>
              <span className="font-bold text-[#102A43] text-right max-w-[220px] truncate">
                {user?.organizationName || 'Department of Transportation & Public Works'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Division / Department:</span>
              <span className="font-semibold text-slate-800">
                {user?.department || 'Operations Directorate'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Administrator ID:</span>
              <span className="font-mono font-bold text-[#2C7A7B]">
                ADM-{user?.id?.slice(0, 8) || 'ORG-1'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Role Authority:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Agency Administrator (RBAC)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access Overview Notice */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-[#2C7A7B]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
            Municipal Security & RBAC Clearance
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          This account is granted Level 2 administrative oversight for departmental issue management, field worker task dispatch, and resolution lifecycle governance. Account credentials and profile assignments are maintained under municipal security protocols.
        </p>
      </div>
    </div>
  );
};
