import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CivicIssue } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { StatusChangeModal } from '../../components/common/StatusChangeModal';

export const WorkerIssuesPage: React.FC = () => {
  const { issues, updateIssueStatus } = useApp();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIssueForStatus, setSelectedIssueForStatus] = useState<CivicIssue | null>(null);

  // Filter for worker's work orders
  const workerIssues = issues.filter(
    (i) =>
      i.assignedWorker?.email === user?.email ||
      i.assignedWorker?.name?.toLowerCase() === user?.name?.toLowerCase() ||
      i.assignedWorker?.id === user?.id ||
      (user?.department && i.department === user.department)
  );

  const filteredIssues = workerIssues.filter((issue) => {
    const matchSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || issue.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#102A43]">
            Assigned Work Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, triage, and update resolution statuses for all tasks assigned to your division.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, title, street..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] flex-1 sm:flex-initial"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="verified">Verified</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] flex-1 sm:flex-initial"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#102A43]">No matching work orders found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or filter options.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <CategoryIcon category={issue.category} size="md" />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      #{issue.trackingNumber}
                    </span>
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <h3 className="text-sm font-bold text-[#102A43] truncate">
                    {issue.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.location.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  to={`/issues/${issue.id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#2C7A7B] hover:bg-teal-50 border border-teal-200 transition-all"
                >
                  View Details
                </Link>

                {issue.status === 'assigned' && (
                  <button
                    type="button"
                    onClick={() => updateIssueStatus(issue.id, 'in_progress', 'Field technician began repair operations.')}
                    className="px-4 py-2 bg-[#2C7A7B] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Begin Work</span>
                  </button>
                )}

                {issue.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => setSelectedIssueForStatus(issue)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
