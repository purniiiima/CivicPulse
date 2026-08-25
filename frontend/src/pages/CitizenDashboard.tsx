import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { IssueCard } from '../components/common/IssueCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { MapPlaceholder } from '../components/common/MapPlaceholder';
import {
  FileText,
  CheckCircle2,
  Clock,
  Wrench,
  PlusCircle,
  Camera,
  MapPin,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Activity,
  AlertCircle,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { currentUser, issues } = useApp();

  const safeIssues = Array.isArray(issues) ? issues : [];

  const myReports = safeIssues.filter(
    (issue) =>
      (currentUser?.id && issue?.reporter?.id === currentUser.id) ||
      (currentUser?.email && issue?.reporter?.email === currentUser.email)
  );

  const totalReportsCount = myReports.length;
  const resolvedCount = myReports.filter(
    (i) => i?.status === 'resolved' || i?.status === 'verified'
  ).length;
  const inProgressCount = myReports.filter(
    (i) => i?.status === 'in_progress' || i?.status === 'assigned'
  ).length;
  const pendingCount = myReports.filter(
    (i) => i?.status === 'reported' || i?.status === 'under_review'
  ).length;

  // Nearby issues (all city issues not reported by current user or nearby)
  const nearbyIssues = safeIssues.slice(0, 4);

  // Recent activity logs from my and nearby issues
  const recentActivities = safeIssues
    .flatMap((issue) =>
      Array.isArray(issue?.timeline)
        ? issue.timeline.map((event) => ({
            ...event,
            issueId: issue.id,
            issueTrackingNumber: issue.trackingNumber,
            issueTitle: issue.title,
            issueCategory: issue.category,
          }))
        : []
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Greeting & Hero Card */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#1A365D] to-[#2C7A7B] rounded-[18px] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <Activity className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F4B942]" />
              <span>{currentUser?.ward || 'Ward 14 - Central Metro'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Good morning, {currentUser?.name || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {totalReportsCount > 0 ? (
                <>
                  You have logged{' '}
                  <strong className="text-[#F4B942] font-bold">
                    {totalReportsCount} civic issue{totalReportsCount > 1 ? 's' : ''}
                  </strong>{' '}
                  ({resolvedCount} resolved). {inProgressCount > 0 ? `${inProgressCount} active work order in progress.` : 'All issues up to date.'}
                </>
              ) : (
                'Welcome to CivicPulse. Report road hazards, lighting issues, and civic concerns directly to municipal departments.'
              )}
            </p>
          </div>

          {/* Prominent Quick Report Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              to="/report"
              className="px-6 py-3.5 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Camera className="w-4 h-4" />
              <span>Report a New Issue</span>
            </Link>

            <Link
              to="/nearby"
              className="px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 text-teal-300" />
              <span>Explore Ward Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Reports"
          value={totalReportsCount}
          subtitle="Submitted in your profile"
          icon={FileText}
          iconBg="bg-slate-100"
          iconColor="text-[#102A43]"
        />

        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Fixed & verified by citizen"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />

        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Workers on-site or assigned"
          icon={Wrench}
          iconBg="bg-cyan-50"
          iconColor="text-[#2C7A7B]"
          badge={inProgressCount > 0 ? 'Active Dispatch' : undefined}
        />

        <StatCard
          title="Pending Review"
          value={pendingCount}
          subtitle="Awaiting municipal triage"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />
      </div>

      {/* Interactive Map Section */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#102A43]">
              Neighborhood Live Map & Hotspots
            </h2>
            <p className="text-xs text-slate-500">
              Active civic alerts and road maintenance within 3km of your location.
            </p>
          </div>
          <Link
            to="/nearby"
            className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] inline-flex items-center gap-1"
          >
            <span>Expand Full Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <MapPlaceholder
          issues={issues}
          height="h-72 sm:h-80"
        />
      </div>

      {/* Two Column Layout: Recent Reports & Live Resolution Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Citizen Reports */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Your Recent Reports
              </h2>
              <p className="text-xs text-slate-500">
                Tracking resolution for problems you logged
              </p>
            </div>
            <Link
              to="/my-reports"
              className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] inline-flex items-center gap-1"
            >
              <span>View all ({totalReportsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[14px] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-[#2C7A7B] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#102A43]">No Reports Logged Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Spot a pothole, broken streetlight, or garbage overflow? Report it in 60 seconds.
              </p>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report First Issue</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myReports.slice(0, 4).map((issue) => (
                <IssueCard key={issue.id} issue={issue} compact />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Resolution Activity Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Resolution Activity Feed
              </h2>
              <p className="text-xs text-slate-500">
                Live stream of municipal crew actions
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[16px] p-5 shadow-xs divide-y divide-slate-100">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Activity className="w-6 h-6 mx-auto opacity-40" />
                <p className="text-xs">No municipal crew activities recorded yet.</p>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#102A43]">
                      <span className="font-mono text-[10px] text-slate-400">
                        {act.issueTrackingNumber}
                      </span>
                      <span className="truncate max-w-[170px]">{act.issueTitle}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusBadge status={act.status} size="sm" />
                    <span className="text-xs font-semibold text-slate-700">{act.title}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">
                    {act.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>By: <strong className="text-slate-700">{act.performedBy?.name}</strong></span>
                    <Link
                      to={`/issues/${act.issueId}`}
                      className="font-semibold text-[#2C7A7B] hover:text-[#102A43]"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
