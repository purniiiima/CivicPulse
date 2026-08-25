import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, Activity, CheckCircle2 } from 'lucide-react';

interface LiveIndicatorProps {
  showCount?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  showCount = true,
  className = '',
}) => {
  const { refreshIssues } = useApp();
  const [showPopover, setShowPopover] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshIssues();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        onBlur={() => setTimeout(() => setShowPopover(false), 200)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-all shadow-2xs hover:shadow-xs bg-emerald-50 text-emerald-700 border-emerald-200"
        title="REST Auto-Sync active. Click for details."
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        <span className="tracking-wide uppercase text-[10px]">
          Synced
        </span>

        {showCount && (
          <span className="inline-flex items-center gap-0.5 text-[10px] opacity-80 border-l border-emerald-200/80 pl-1.5 ml-0.5">
            <Activity className="w-2.5 h-2.5" />
            <span>REST</span>
          </span>
        )}
      </button>

      {/* Status Details Dropdown */}
      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-3.5 z-50 text-left text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-[#102A43]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Sync Engine</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div className="flex items-center justify-between">
              <span>Sync Protocol:</span>
              <span className="font-mono font-semibold text-slate-800">REST API (5s Poll)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="font-medium text-emerald-700">Online & Connected</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-[11px] disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
