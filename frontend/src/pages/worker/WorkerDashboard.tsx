import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Camera,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CivicIssue, IssueStatus } from '../../types';
import { CivicMap } from '../../components/common/CivicMap';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { StatusChangeModal } from '../../components/common/StatusChangeModal';

export const WorkerDashboard: React.FC = () => {
  const { issues, updateIssueStatus } = useApp();
  const { user } = useAuth();

  const [selectedIssueForStatus, setSelectedIssueForStatus] = useState<CivicIssue | null>(null);
  const [activeTab, setActiveTab] = useState<'assigned' | 'in_progress' | 'completed'>('assigned');

  // Filter issues assigned to this worker or department
  const workerIssues = issues.filter(
    (i) =>
      i.assignedWorker?.email === user?.email ||
      i.assignedWorker?.name?.toLowerCase() === user?.name?.toLowerCase() ||
      i.assignedWorker?.id === user?.id ||
      (user?.department && i.department === user.department)
  );

  const assignedList = workerIssues.filter((i) => i.status === 'assigned');
  const inProgressList = workerIssues.filter((i) => i.status === 'in_progress');
  const completedList = workerIssues.filter((i) => i.status === 'resolved' || i.status === 'verified');

  const displayedList =
    activeTab === 'assigned'
      ? assignedList
      : activeTab === 'in_progress'
      ? inProgressList
      : completedList;

  const handleStartWork = (issue: CivicIssue) => {
    updateIssueStatus(issue.id, 'in_progress', 'Technician arrived on site and commenced repair operations.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#1A365D] to-[#243B53] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-[#F4B942] text-xs font-bold border border-amber-400/30 mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>Field Operations Task Board</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.name || 'Technician'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {user?.department || 'Electrical & Lighting Division'} • Active Work Orders & Resolution Workflow
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/worker/issues"
            className="px-4 py-2 bg-[#2C7A7B] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>All Work Orders ({workerIssues.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned (Pending Start)
            </span>
            <div className="text-2xl font-black text-[#102A43] mt-1">{assignedList.length}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active In-Progress
            </span>
            <div className="text-2xl font-black text-[#2C7A7B] mt-1">{inProgressList.length}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Resolved & Verified
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{completedList.length}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Specialist Rating
            </span>
            <div className="text-2xl font-black text-[#F4B942] mt-1">4.9 / 5.0</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-yellow-50 text-[#F4B942] flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Task List & Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Actionable Task List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'assigned'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Assigned ({assignedList.length})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'in_progress'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              In-Progress ({inProgressList.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Resolved ({completedList.length})
            </button>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {displayedList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#102A43]">No issues in this queue</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All assigned tasks for this status have been addressed.
                </p>
              </div>
            ) : (
              displayedList.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <CategoryIcon category={issue.category} size="md" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            #{issue.trackingNumber}
                          </span>
                          <PriorityBadge priority={issue.priority} />
                          <StatusBadge status={issue.status} />
                        </div>
                        <h3 className="text-sm font-bold text-[#102A43] leading-snug">
                          {issue.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.location.address} ({issue.location.wardOrZone})</span>
                  </div>

                  {/* Field Operations Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] flex items-center gap-1"
                    >
                      <span>View Full Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      {issue.status === 'assigned' && (
                        <button
                          type="button"
                          onClick={() => handleStartWork(issue)}
                          className="px-3.5 py-1.5 bg-[#2C7A7B] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Start Field Work</span>
                        </button>
                      )}

                      {issue.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => setSelectedIssueForStatus(issue)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Proof & Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Columns: Map Dispatch Overview */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2C7A7B]" />
              <span>Assigned Work Sites Map</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              {workerIssues.length} Target Location{workerIssues.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="h-72 rounded-xl overflow-hidden border border-slate-200">
            <CivicMap
              issues={workerIssues}
              height="100%"
              showControls
              interactive
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-[#102A43]">Operational Safety Protocol:</div>
            <p className="text-[11px] leading-relaxed">
              Always set safety cones prior to working on street fixtures or underground vaults. Use the proof upload tool to document before-and-after work.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for status transition & resolution proof */}
      {selectedIssueForStatus && (
        <StatusChangeModal
          issue={selectedIssueForStatus}
          isOpen={!!selectedIssueForStatus}
          onClose={() => setSelectedIssueForStatus(null)}
        />
      )}
    </div>
  );
};
