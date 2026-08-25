import React from 'react';
import { IssueStatus } from '../../types';
import {
  Clock,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getStatusConfig = (s: IssueStatus) => {
    switch (s) {
      case 'reported':
        return {
          label: 'Reported',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
        };
      case 'under_review':
        return {
          label: 'Under Review',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          icon: Search,
        };
      case 'assigned':
        return {
          label: 'Assigned',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          icon: UserCheck,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          dot: 'bg-cyan-600',
          icon: Wrench,
        };
      case 'resolved':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: CheckCircle2,
        };
      case 'verified':
        return {
          label: 'Citizen Verified',
          bg: 'bg-teal-50 text-teal-900 border-teal-300 font-semibold',
          dot: 'bg-teal-600',
          icon: BadgeCheck,
        };
      default:
        return {
          label: s,
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon ? (
        <Icon className={`${iconSizes[size]} shrink-0`} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      )}
      <span>{config.label}</span>
    </span>
  );
};
