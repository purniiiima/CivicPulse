import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Users,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Activity,
  BarChart3,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Organization } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { issues, workers } = useApp();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalRegisteredUsers: number;
    totalCitizens: number;
    totalWorkers: number;
    totalOrgAdmins: number;
    totalSuperAdmins: number;
  }>({
    totalRegisteredUsers: 0,
    totalCitizens: 0,
    totalWorkers: 0,
    totalOrgAdmins: 0,
    totalSuperAdmins: 0,
  });

  useEffect(() => {
    fetch('/api/v1/organizations')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrganizations(data))
      .catch(() => {});

    fetch('/api/v1/analytics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setAnalytics({
            totalRegisteredUsers: data.totalRegisteredUsers || 0,
            totalCitizens: data.totalCitizens || 0,
            totalWorkers: data.totalWorkers || 0,
            totalOrgAdmins: data.totalOrgAdmins || 0,
            totalSuperAdmins: data.totalSuperAdmins || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const totalReports = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved' || i.status === 'verified').length;
  const urgentCount = issues.filter((i) => i.priority === 'urgent').length;
  const resRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) + '%' : '100%';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Supreme Director Command Banner */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#1A365D] to-[#243B53] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-[#F4B942] text-xs font-bold border border-yellow-400/30 mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>Super Administrator Control Center</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Metropolitan Governance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Welcome, {user?.name || 'Super Administrator'}. You have complete clearance across all municipal agencies, roles, and security policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/super-admin/users"
            className="px-4 py-2 bg-[#2C7A7B] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage All Users</span>
          </Link>
          <Link
            to="/super-admin/settings"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span>RBAC Policies</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Global Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Database Users
            </span>
            <div className="text-2xl font-black text-[#102A43] mt-1">
              {analytics.totalRegisteredUsers}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified in PostgreSQL</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Municipal Agencies
            </span>
            <div className="text-2xl font-black text-[#2C7A7B] mt-1">{organizations.length}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Across All City Wards
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Citywide Fix Rate
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{resRate}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {resolvedCount} of {totalReports} resolved
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Urgent Hazards
            </span>
            <div className="text-2xl font-black text-red-600 mt-1">{urgentCount}</div>
            <div className="text-[10px] text-red-500 font-semibold mt-0.5">
              {urgentCount > 0 ? 'Emergency dispatches active' : 'No urgent hazards'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RBAC Breakdown & Agency Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: RBAC User Matrix */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#102A43]">
                Role-Based Access Control Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active user accounts in database by security privilege level
              </p>
            </div>
            <Link
              to="/super-admin/users"
              className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] flex items-center gap-1"
            >
              <span>User Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/60">
              <span className="text-[10px] font-bold text-teal-800 uppercase">CITIZEN</span>
              <div className="text-xl font-black text-teal-900 mt-1">{analytics.totalCitizens}</div>
              <p className="text-[10px] text-teal-700 mt-0.5">Public Reporters</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
              <span className="text-[10px] font-bold text-amber-800 uppercase">WORKER</span>
              <div className="text-xl font-black text-amber-900 mt-1">{workers.length}</div>
              <p className="text-[10px] text-amber-700 mt-0.5">Field Technicians</p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60">
              <span className="text-[10px] font-bold text-blue-800 uppercase">ORG_ADMIN</span>
              <div className="text-xl font-black text-blue-900 mt-1">{analytics.totalOrgAdmins}</div>
              <p className="text-[10px] text-blue-700 mt-0.5">Agency Managers</p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/60">
              <span className="text-[10px] font-bold text-purple-800 uppercase">SUPER_ADMIN</span>
              <div className="text-xl font-black text-purple-900 mt-1">{analytics.totalSuperAdmins}</div>
              <p className="text-[10px] text-purple-700 mt-0.5">System Directors</p>
            </div>
          </div>

          {/* Quick RBAC Capability Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-[#102A43] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2C7A7B]" />
              <span>CivicPulse Security Enforcement Policy</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed">
              <li>Citizen accounts can only create, view, comment, and verify their own reports and public alerts.</li>
              <li>Workers are restricted to assigned work orders, proof uploads, and status progressions.</li>
              <li>Organization Admins have jurisdiction over their specific agency, workers, and SLA analytics.</li>
              <li>Super Admins have unrestricted governance over all organizations, users, and global policies.</li>
            </ul>
          </div>
        </div>

        {/* Right 5 Columns: Agency Overview */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2C7A7B]" />
              <span>Municipal Organizations</span>
            </h3>
            <Link
              to="/super-admin/organizations"
              className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#102A43]">{org.name}</h4>
                    <span className="text-[10px] text-slate-500">{org.jurisdictionWard}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    {org.slaComplianceRate}% SLA
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <span>{org.activeWorkersCount} Field Specialists</span>
                  <span className="font-semibold">{org.totalIssuesHandled} Total Solved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
