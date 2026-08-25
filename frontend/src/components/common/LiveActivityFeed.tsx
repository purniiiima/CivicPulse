import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Megaphone,
  MessageSquare,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface LiveActivityFeedProps {
  maxItems?: number;
  className?: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  maxItems = 20,
  className = '',
}) => {
  const { issues, notifications } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  // Derive activity stream from latest issues, timeline events, and announcements
  const activities = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'report' | 'dispatch' | 'resolved' | 'status' | 'announcement' | 'comment';
      title: string;
      description: string;
      timestamp: string;
      issueId?: string;
    }> = [];

    // Add announcements
    notifications
      .filter((n) => n.type === 'community_alert')
      .forEach((n) => {
        list.push({
          id: `act-${n.id}`,
          type: 'announcement',
          title: `Announcement: ${n.title}`,
          description: n.message,
          timestamp: n.createdAt,
        });
      });

    // Add issue timeline events
    issues.forEach((issue) => {
      // Creation event
      list.push({
        id: `act-create-${issue.id}`,
        type: 'report',
        title: `Reported: ${issue.title}`,
        description: `New report #${issue.trackingNumber} submitted in ${issue.location.ward || 'the city'}.`,
        timestamp: issue.createdAt,
        issueId: issue.id,
      });

      // Status events
      if (issue.status === 'resolved' || issue.status === 'verified') {
        list.push({
          id: `act-res-${issue.id}`,
          type: 'resolved',
          title: `Resolved: ${issue.title}`,
          description: `Issue #${issue.trackingNumber} was marked as resolved by municipal staff.`,
          timestamp: issue.updatedAt || issue.createdAt,
          issueId: issue.id,
        });
      } else if (issue.status === 'in_progress' || issue.status === 'assigned') {
        list.push({
          id: `act-disp-${issue.id}`,
          type: 'dispatch',
          title: `Dispatched: ${issue.title}`,
          description: `Field team deployed for issue #${issue.trackingNumber}.`,
          timestamp: issue.updatedAt || issue.createdAt,
          issueId: issue.id,
        });
      }

      // Comments
      (issue.comments || []).slice(0, 2).forEach((c) => {
        list.push({
          id: `act-c-${c.id}`,
          type: 'comment',
          title: `Update on #${issue.trackingNumber}`,
          description: `${c.author.name}: ${c.content}`,
          timestamp: c.timestamp,
          issueId: issue.id,
        });
      });
    });

    // Sort descending by timestamp
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [issues, notifications]);

  const filteredFeed = activities.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'report') return item.type === 'report';
    if (filterType === 'dispatch') return item.type === 'dispatch';
    if (filterType === 'resolved') return item.type === 'resolved' || item.type === 'status';
    if (filterType === 'announcement') return item.type === 'announcement';
    return true;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'dispatch':
        return <Wrench className="w-4 h-4 text-[#2C7A7B]" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'status':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-purple-600" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'report':
        return 'bg-rose-50 border-rose-100';
      case 'dispatch':
        return 'bg-teal-50 border-teal-100';
      case 'resolved':
        return 'bg-emerald-50 border-emerald-100';
      case 'status':
        return 'bg-amber-50 border-amber-100';
      case 'announcement':
        return 'bg-purple-50 border-purple-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#2C7A7B] flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#2C7A7B]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <span>Municipal Activity Stream</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                Auto-Synced
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Recent reports, crew dispatches & city status updates
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors shrink-0 text-[11px] ${
            filterType === 'all'
              ? 'bg-[#102A43] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Activity ({activities.length})
        </button>
        <button
          onClick={() => setFilterType('report')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors shrink-0 text-[11px] ${
            filterType === 'report'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Citizen Reports
        </button>
        <button
          onClick={() => setFilterType('dispatch')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors shrink-0 text-[11px] ${
            filterType === 'dispatch'
              ? 'bg-[#2C7A7B] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Dispatches
        </button>
        <button
          onClick={() => setFilterType('resolved')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors shrink-0 text-[11px] ${
            filterType === 'resolved'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Resolutions
        </button>
        <button
          onClick={() => setFilterType('announcement')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors shrink-0 text-[11px] ${
            filterType === 'announcement'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredFeed.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-1">
            <Activity className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="font-semibold">No recent events in this stream.</p>
            <p className="text-[11px]">As citizens report or workers take action, events will appear here.</p>
          </div>
        ) : (
          filteredFeed.slice(0, maxItems).map((activity) => (
            <div
              key={activity.id}
              className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 hover:shadow-2xs ${getActivityBg(
                activity.type
              )}`}
            >
              <div className="p-1.5 rounded-lg bg-white shadow-2xs shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-[#102A43] truncate text-xs">{activity.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {activity.description}
                </p>

                {activity.issueId && (
                  <div className="pt-1">
                    <Link
                      to={`/issue/${activity.issueId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2C7A7B] hover:underline"
                    >
                      <span>View Ticket Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
