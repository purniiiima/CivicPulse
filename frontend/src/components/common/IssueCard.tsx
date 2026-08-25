import React from 'react';
import { CivicIssue } from '../../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryIcon } from './CategoryIcon';
import {
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  ArrowRight,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface IssueCardProps {
  issue: CivicIssue;
  compact?: boolean;
  showAssignAction?: boolean;
  onOpenAssign?: (issue: CivicIssue) => void;
  onOpenStatusChange?: (issue: CivicIssue) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  compact = false,
  showAssignAction = false,
  onOpenAssign,
  onOpenStatusChange,
}) => {
  const { toggleUpvote, currentUser } = useApp();

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleUpvote(issue.id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[14px] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group hover:border-slate-300">
      {/* Card Header & Thumbnail */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {issue.trackingNumber}
            </span>
            <PriorityBadge priority={issue.priority} size="sm" />
          </div>
          <StatusBadge status={issue.status} size="sm" />
        </div>

        {/* Title & Category */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C7A7B] mb-1">
            <CategoryIcon category={issue.category} className="w-3.5 h-3.5" />
            <span className="capitalize">{issue.category.replace('_', ' ')}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal truncate">{issue.department}</span>
          </div>
          <Link
            to={`/issues/${issue.id}`}
            className="block text-base font-bold text-[#102A43] group-hover:text-[#2C7A7B] transition-colors line-clamp-1"
          >
            {issue.title}
          </Link>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {issue.description}
        </p>

        {/* Photo Gallery Thumbnail if available */}
        {issue.images && issue.images.length > 0 && !compact && (
          <div className="relative mb-4 rounded-xl overflow-hidden bg-slate-100 h-36">
            <img
              src={issue.images[0]}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            {issue.images.length > 1 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs">
                <ImageIcon className="w-3 h-3" />
                +{issue.images.length - 1} photos
              </span>
            )}
            {issue.status === 'resolved' && (
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-xs shadow-sm">
                Resolved
              </span>
            )}
          </div>
        )}

        {/* Location & Meta info */}
        <div className="mt-auto space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-600 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{issue.location.address}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(issue.createdAt)}</span>
            </div>

            {/* Assigned Worker / Reporter */}
            {issue.assignedWorker ? (
              <div
                className="flex items-center gap-1.5 text-xs text-slate-700 font-medium"
                title={`Assigned to ${issue.assignedWorker.name}`}
              >
                {issue.assignedWorker.avatar ? (
                  <img
                    src={issue.assignedWorker.avatar}
                    alt={issue.assignedWorker.name}
                    className="w-4 h-4 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="truncate max-w-[100px]">{issue.assignedWorker.name}</span>
              </div>
            ) : (
              <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Unassigned
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUpvoteClick}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
              issue.userUpvoted
                ? 'bg-teal-50 text-[#2C7A7B] border-teal-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Confirm you are also experiencing this civic issue"
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${issue.userUpvoted ? 'fill-current text-[#2C7A7B]' : ''}`}
            />
            <span>{issue.upvotes}</span>
          </button>

          {issue.comments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{issue.comments.length}</span>
            </div>
          )}
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2">
          {showAssignAction && currentUser.role === 'admin' && (
            <button
              onClick={() => onOpenAssign && onOpenAssign(issue)}
              className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Assign
            </button>
          )}

          {showAssignAction && (currentUser.role === 'admin' || currentUser.role === 'worker') && (
            <button
              onClick={() => onOpenStatusChange && onOpenStatusChange(issue)}
              className="text-xs font-semibold px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg hover:bg-teal-100"
            >
              Status
            </button>
          )}

          <Link
            to={`/issues/${issue.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#102A43] hover:text-[#2C7A7B] py-1 px-1.5 rounded transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
