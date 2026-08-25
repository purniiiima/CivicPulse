import React from 'react';
import { IssueStatus, TimelineEvent } from '../../types';
import {
  FileText,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  BadgeCheck,
  Clock,
  User,
} from 'lucide-react';

interface TimelineProps {
  currentStatus: IssueStatus;
  events?: TimelineEvent[];
  className?: string;
  isInteractive?: boolean;
}

const STAGES: Array<{
  status: IssueStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    status: 'reported',
    label: 'Reported',
    shortLabel: 'Reported',
    description: 'Problem logged with photos & location',
    icon: FileText,
  },
  {
    status: 'under_review',
    label: 'Under Review',
    shortLabel: 'Review',
    description: 'Triage & safety priority verification',
    icon: Search,
  },
  {
    status: 'assigned',
    label: 'Assigned',
    shortLabel: 'Assigned',
    description: 'Dispatched to specialized field crew',
    icon: UserCheck,
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    shortLabel: 'Working',
    description: 'Field workers on-site resolving problem',
    icon: Wrench,
  },
  {
    status: 'resolved',
    label: 'Resolved',
    shortLabel: 'Resolved',
    description: 'Work completed & documented',
    icon: CheckCircle2,
  },
  {
    status: 'verified',
    label: 'Citizen Verified',
    shortLabel: 'Verified',
    description: 'Citizen verified quality resolution',
    icon: BadgeCheck,
  },
];

const STAGE_ORDER: Record<IssueStatus, number> = {
  reported: 0,
  under_review: 1,
  assigned: 2,
  in_progress: 3,
  resolved: 4,
  verified: 5,
};

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  events = [],
  className = '',
}) => {
  const currentStageIndex = STAGE_ORDER[currentStatus] ?? 0;

  return (
    <div className={`bg-white border border-slate-200/80 rounded-[14px] p-5 sm:p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-[#102A43]">Resolution Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage {currentStageIndex + 1} of 6:{' '}
            <span className="font-semibold text-[#2C7A7B]">
              {STAGES[currentStageIndex]?.label || currentStatus}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Real-time tracking</span>
        </div>
      </div>

      {/* Progress Bar with 6 Stages */}
      <div className="relative mb-8">
        {/* Horizontal Line on Desktop */}
        <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-[#2C7A7B] transition-all duration-500"
            style={{
              width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Stage Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-2 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;
            const Icon = stage.icon;

            return (
              <div
                key={stage.status}
                className={`flex md:flex-col items-center md:text-center p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-teal-50/70 border border-teal-200 ring-2 ring-teal-500/20'
                    : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-[#2C7A7B] text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#102A43] text-white ring-4 ring-teal-100 shadow-sm animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3 md:ml-0 md:mt-2.5 text-left md:text-center">
                  <div
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-[#102A43]'
                        : isCompleted
                        ? 'text-[#2C7A7B]'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-slate-500 hidden md:block mt-0.5 max-w-[110px] mx-auto leading-tight">
                    {stage.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Logs */}
      {events.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Audit Activity Timeline ({events.length})
          </h4>
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-start pl-8 group">
                <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#2C7A7B] group-hover:scale-110 transition-transform" />
                <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-sm font-semibold text-[#102A43]">
                      {event.title}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {event.description}
                  </p>
                  {event.performedBy && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      {event.performedBy.avatar ? (
                        <img
                          src={event.performedBy.avatar}
                          alt={event.performedBy.name}
                          className="w-4 h-4 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>
                        <strong className="text-slate-700">{event.performedBy.name}</strong> •{' '}
                        {event.performedBy.role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
