import React from 'react';
import { IssuePriority } from '../../types';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: IssuePriority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const getConfig = (p: IssuePriority) => {
    switch (p) {
      case 'urgent':
        return {
          label: 'Urgent',
          bg: 'bg-red-100 text-red-800 border-red-300 font-semibold',
          icon: AlertTriangle,
          pulse: true,
        };
      case 'high':
        return {
          label: 'High',
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          icon: ArrowUp,
          pulse: false,
        };
      case 'medium':
        return {
          label: 'Medium',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertCircle,
          pulse: false,
        };
      case 'low':
        return {
          label: 'Low',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: ArrowDown,
          pulse: false,
        };
      default:
        return {
          label: p,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: AlertCircle,
          pulse: false,
        };
    }
  };

  const config = getConfig(priority);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-1.5 font-medium',
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
      {showIcon && (
        <Icon className={`${iconSizes[size]} shrink-0 ${config.pulse ? 'animate-pulse text-red-600' : ''}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
};
