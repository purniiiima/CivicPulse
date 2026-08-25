import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CivicIssue, Worker } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AssignWorkerModal } from '../../components/common/AssignWorkerModal';
import {
  Users,
  Briefcase,
  Wrench,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';

export const AssignmentManagementPage: React.FC = () => {
  const { workers, issues, assignWorker, showToast } = useApp();

  const [selectedIssueToAssign, setSelectedIssueToAssign] = useState<CivicIssue | null>(null);

  const unassignedIssues = issues.filter((i) => !i.assignedWorker && i.status !== 'resolved' && i.status !== 'verified');
  const activeAssignedIssues = issues.filter((i) => i.assignedWorker && (i.status === 'assigned' || i.status === 'in_progress'));

  const handleQuickAssign = (issueId: string, worker: Worker) => {
    assignWorker(issueId, worker.id, 'Dispatched via Admin Squad Board');
    showToast({
      type: 'success',
      title: 'Worker Dispatched',
      message: `${worker.name} assigned to incident.`,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            Field Squad & Assignment Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Allocate incidents to certified municipal technicians, balance crew workloads, and monitor dispatch SLA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
            {workers.filter((w) => w.status === 'available').length} Technicians Available
          </span>
        </div>
      </div>

      {/* Unassigned Issues Alert Box */}
      {unassignedIssues.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-[18px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Unassigned Incident Queue ({unassignedIssues.length} Waiting)</span>
            </div>
            <span className="text-xs text-amber-800 font-semibold">Immediate Dispatch Needed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unassignedIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 bg-white border border-amber-200/80 rounded-xl space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {issue.trackingNumber}
                      </span>
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-[#102A43] line-clamp-1">
                      {issue.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">{issue.location.address}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500">
                    Dept: <strong className="text-slate-700">{issue.department}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedIssueToAssign(issue)}
                    className="px-3 py-1.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#F4B942]" />
                    <span>Dispatch Specialist</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workers Roster & Workload Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#102A43]">
          Municipal Field Specialists & Workload
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workers.map((worker) => {
            const assignedToWorker = issues.filter(
              (i) => i.assignedWorker?.id === worker.id && (i.status === 'assigned' || i.status === 'in_progress')
            );

            return (
              <div
                key={worker.id}
                className="bg-white border border-slate-200/80 rounded-[16px] p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#102A43]">{worker.name}</h4>
                        <p className="text-[11px] text-slate-500">{worker.role}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{worker.rating} / 5</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        worker.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : worker.status === 'on_job'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {worker.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold">{worker.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact:</span>
                      <span>{worker.phone}</span>
                    </div>
                  </div>

                  {/* Active Tasks list */}
                  <div className="pt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Active Assigned Queue ({assignedToWorker.length})
                    </div>
                    {assignedToWorker.length === 0 ? (
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center text-[11px] text-slate-400">
                        Ready for new dispatch
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {assignedToWorker.map((task) => (
                          <Link
                            key={task.id}
                            to={`/issues/${task.id}`}
                            className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs block transition-colors"
                          >
                            <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                              {task.title}
                            </span>
                            <StatusBadge status={task.status} size="sm" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedIssueToAssign && (
        <AssignWorkerModal
          isOpen={!!selectedIssueToAssign}
          onClose={() => setSelectedIssueToAssign(null)}
          issue={selectedIssueToAssign}
        />
      )}
    </div>
  );
};
