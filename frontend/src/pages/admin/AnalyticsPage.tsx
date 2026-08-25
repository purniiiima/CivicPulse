import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { issues } = useApp();

  const totalReports = issues.length;
  const resolvedIssues = issues.filter(
    (i) => i.status === 'resolved' || i.status === 'verified'
  );
  const resolvedCount = resolvedIssues.length;
  const fixRate =
    totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) + '%' : '0.0%';

  // Average resolution turnaround calculation
  let totalHours = 0;
  let resolvedWithTimeCount = 0;
  resolvedIssues.forEach((issue) => {
    if (issue.resolvedAt && issue.createdAt) {
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.resolvedAt).getTime();
      const diffHours = (resolved - created) / (1000 * 60 * 60);
      if (diffHours > 0) {
        totalHours += diffHours;
        resolvedWithTimeCount += 1;
      }
    }
  });

  const avgTurnaround =
    resolvedWithTimeCount > 0
      ? (totalHours / resolvedWithTimeCount).toFixed(1) + ' hrs'
      : totalReports > 0
      ? 'Under calculation'
      : '0.0 hrs';

  // Citizen satisfaction calculation from real verified ratings
  const verifiedWithRating = issues.filter((i) => i.feedbackRating?.score);
  const avgRating =
    verifiedWithRating.length > 0
      ? (
          verifiedWithRating.reduce((acc, curr) => acc + (curr.feedbackRating?.score || 0), 0) /
          verifiedWithRating.length
        ).toFixed(2)
      : totalReports > 0
      ? 'Pending'
      : '0.0';

  // Dynamic ward breakdown from actual issues
  const wardMap: Record<string, { ward: string; issues: number; resolved: number }> = {};
  issues.forEach((i) => {
    const wardName = i.location.wardOrZone || 'Ward 14';
    if (!wardMap[wardName]) {
      wardMap[wardName] = { ward: wardName, issues: 0, resolved: 0 };
    }
    wardMap[wardName].issues += 1;
    if (i.status === 'resolved' || i.status === 'verified') {
      wardMap[wardName].resolved += 1;
    }
  });

  const wardData = Object.values(wardMap);

  // Dynamic category SLA data
  const categoryMap: Record<string, { category: string; count: number; resolved: number }> = {};
  issues.forEach((i) => {
    const catName = i.category.replace('_', ' ');
    if (!categoryMap[catName]) {
      categoryMap[catName] = { category: catName, count: 0, resolved: 0 };
    }
    categoryMap[catName].count += 1;
    if (i.status === 'resolved' || i.status === 'verified') {
      categoryMap[catName].resolved += 1;
    }
  });

  const resolutionByCategory = Object.values(categoryMap).map((c) => ({
    category: c.category,
    targetSLA: 24,
    reportedCount: c.count,
    resolvedCount: c.resolved,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            City Civic Infrastructure Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data intelligence on municipal SLA compliance, geographic hotspots, and citizen satisfaction ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#102A43] bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
            Real-Time Live Database
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Fix Rate"
          value={fixRate}
          subtitle="Within official SLA window"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />

        <StatCard
          title="Avg. Turnaround"
          value={avgTurnaround}
          subtitle="Across all categories"
          icon={Clock}
          iconBg="bg-cyan-50"
          iconColor="text-[#2C7A7B]"
        />

        <StatCard
          title="Citizen Satisfaction"
          value={avgRating === '0.0' || avgRating === 'Pending' ? avgRating : `${avgRating} / 5.0`}
          subtitle={
            verifiedWithRating.length > 0
              ? `Based on ${verifiedWithRating.length} verified ratings`
              : 'Awaiting citizen reviews'
          }
          icon={Award}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />

        <StatCard
          title="Total Resolved"
          value={resolvedCount}
          subtitle="Cumulative civic fixes"
          icon={TrendingUp}
          iconBg="bg-slate-100"
          iconColor="text-[#102A43]"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Comparison */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">
                Category Inflow vs. Resolution Volume
              </h2>
              <p className="text-xs text-slate-500">
                Number of logged complaints vs resolved tasks per civic category
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-300" /> Reported
              </span>
              <span className="flex items-center gap-1 text-[#2C7A7B] font-bold">
                <span className="w-2.5 h-2.5 rounded bg-[#2C7A7B]" /> Resolved
              </span>
            </div>
          </div>

          <div className="h-64 pt-2">
            {resolutionByCategory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <BarChart3 className="w-8 h-8 opacity-40" />
                <p className="text-xs">No issue categories logged yet to plot SLA metrics.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={resolutionByCategory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102A43',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="reportedCount" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Reported" />
                  <Bar dataKey="resolvedCount" fill="#2C7A7B" radius={[4, 4, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Live Issue Status Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#102A43]">
              Active Incident Lifecycle Status
            </h2>
            <p className="text-xs text-slate-500">
              Live distribution of reported civic issues
            </p>
          </div>

          {totalReports === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 opacity-40" />
              <p className="text-xs">All municipal queues are currently clear.</p>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              {[
                {
                  label: 'Reported / Under Review',
                  count: issues.filter((i) => i.status === 'reported' || i.status === 'under_review').length,
                  color: 'bg-amber-500',
                },
                {
                  label: 'Assigned / In Progress',
                  count: issues.filter((i) => i.status === 'assigned' || i.status === 'in_progress').length,
                  color: 'bg-teal-500',
                },
                {
                  label: 'Resolved & Verified',
                  count: resolvedCount,
                  color: 'bg-emerald-500',
                },
              ].map((item, idx) => {
                const percentage = Math.round((item.count / totalReports) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-[#102A43]">
                      <span>{item.label}</span>
                      <span>
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${item.color} h-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ward Comparison Table & Breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#102A43]">
          Municipal Ward Performance Matrix
        </h2>

        {wardData.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-1">
            <MapPin className="w-6 h-6 mx-auto opacity-40" />
            <p className="text-xs">No municipal incident records logged for ward comparison yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Municipal Ward</th>
                  <th className="py-3 px-4">Reported Issues</th>
                  <th className="py-3 px-4">Resolved Fixes</th>
                  <th className="py-3 px-4">Resolution Rate</th>
                  <th className="py-3 px-4 text-right">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardData.map((w, i) => {
                  const rate = w.issues > 0 ? Math.round((w.resolved / w.issues) * 100) : 100;

                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#102A43]">{w.ward}</td>
                      <td className="py-3 px-4 text-slate-700">{w.issues}</td>
                      <td className="py-3 px-4 text-slate-700">{w.resolved}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#2C7A7B] h-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${
                            rate >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : rate >= 50
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {rate >= 80 ? 'Optimal' : rate >= 50 ? 'Moderate' : 'Needs Focus'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
