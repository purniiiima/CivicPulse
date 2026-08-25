import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { CivicMap } from '../../components/common/CivicMap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  UserCheck,
  MapPin,
  BarChart3,
} from 'lucide-react';

const CATEGORY_COLORS = ['#2C7A7B', '#F4B942', '#3182CE', '#E53E3E', '#805AD5', '#38A169'];

export const AdminDashboard: React.FC = () => {
  const { issues, workers } = useApp();

  const totalCount = issues.length;
  const pendingTriage = issues.filter(
    (i) => i.status === 'reported' || i.status === 'under_review'
  ).length;
  const inProgressCount = issues.filter(
    (i) => i.status === 'in_progress' || i.status === 'assigned'
  ).length;
  const resolvedCount = issues.filter(
    (i) => i.status === 'resolved' || i.status === 'verified'
  ).length;

  const urgentIssues = issues
    .filter((i) => i.priority === 'urgent' || (i.priority === 'high' && !i.assignedWorker))
    .slice(0, 5);

  const activeWorkers = workers.filter((w) => w.status === 'on_job' || w.status === 'available');

  // Chart data: Issues by Category
  const categoryDataMap: Record<string, number> = {};
  issues.forEach((issue) => {
    const key = issue.category.replace('_', ' ');
    categoryDataMap[key] = (categoryDataMap[key] || 0) + 1;
  });

  const categoryChartData = Object.keys(categoryDataMap).map((cat) => ({
    name: cat,
    count: categoryDataMap[cat],
  }));

  // Dynamic daily trends computed from real issues
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMap: Record<string, { day: string; reported: number; resolved: number }> = {};
  daysOfWeek.forEach((d) => {
    dailyMap[d] = { day: d, reported: 0, resolved: 0 };
  });

  issues.forEach((issue) => {
    if (issue.createdAt) {
      const day = daysOfWeek[new Date(issue.createdAt).getDay()];
      if (dailyMap[day]) dailyMap[day].reported += 1;
    }
    if (issue.resolvedAt) {
      const day = daysOfWeek[new Date(issue.resolvedAt).getDay()];
      if (dailyMap[day]) dailyMap[day].resolved += 1;
    }
  });

  const weeklyTrends = daysOfWeek.map((d) => dailyMap[d]);
  const hasTrends = issues.length > 0;

  const slaRate =
    totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) + '%' : '100%';

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-[#102A43] rounded-[18px] p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-900/80 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Operations & Dispatch Control Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Metropolis City Municipal Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time incident dispatching, worker telemetry, and SLA oversight across all 12 Wards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/issues"
            className="px-5 py-2.5 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Triage Queue ({pendingTriage})</span>
          </Link>
          <Link
            to="/admin/assignments"
            className="px-4 py-2.5 bg-[#1A365D] hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
          >
            Field Crews
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reported"
          value={totalCount}
          subtitle="All city wards"
          icon={ShieldAlert}
          iconBg="bg-slate-100"
          iconColor="text-[#102A43]"
        />

        <StatCard
          title="Pending Triage"
          value={pendingTriage}
          subtitle="Needs review & dispatch"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          badge={pendingTriage > 0 ? 'Requires Action' : undefined}
        />

        <StatCard
          title="Active Dispatches"
          value={inProgressCount}
          subtitle="Engineers on-site"
          icon={Wrench}
          iconBg="bg-cyan-50"
          iconColor="text-[#2C7A7B]"
        />

        <StatCard
          title="Resolved Rate"
          value={slaRate}
          subtitle="Fixed issues ratio"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Influx & Resolution Trend */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">
                Daily Inflow vs. Resolution Volume
              </h2>
              <p className="text-xs text-slate-500">
                Comparison of newly logged problems vs. successfully completed fixes.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-[#102A43]" /> Reported
              </span>
              <span className="flex items-center gap-1.5 text-[#2C7A7B]">
                <span className="w-3 h-3 rounded-sm bg-[#2C7A7B]" /> Resolved
              </span>
            </div>
          </div>

          <div className="h-64 pt-2">
            {!hasTrends ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <BarChart3 className="w-8 h-8 opacity-40" />
                <p className="text-xs">No daily incident activity recorded in database yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102A43',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="reported" fill="#102A43" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#2C7A7B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#102A43]">
              Issues by Category
            </h2>
            <p className="text-xs text-slate-500">
              Distribution of incoming reports
            </p>
          </div>

          <div className="h-44 flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <div className="text-center text-slate-400 space-y-1">
                <Layers className="w-6 h-6 mx-auto opacity-40" />
                <p className="text-xs">No categories logged</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102A43',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 min-h-[40px]">
            {categoryChartData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                />
                <span className="truncate text-slate-600 font-medium capitalize">{cat.name}:</span>
                <strong className="text-slate-800">{cat.count}</strong>
              </div>
            ))}
            {categoryChartData.length === 0 && (
              <div className="col-span-2 text-center text-slate-400 text-[11px]">
                0 records
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Issues Action Section */}
      <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">
                High Priority & Urgent Incidents Awaiting Attention
              </h2>
              <p className="text-xs text-slate-500">
                Critical safety hazards that need immediate assignment or on-site dispatch
              </p>
            </div>
          </div>

          <Link
            to="/admin/issues"
            className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] inline-flex items-center gap-1"
          >
            <span>View All Issues Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {urgentIssues.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <h4 className="text-xs font-bold text-[#102A43]">No Urgent Incidents Pending</h4>
            <p className="text-[11px] text-slate-500">
              No high-priority or urgent hazards currently requiring emergency triage.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {urgentIssues.map((issue) => (
              <div
                key={issue.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-slate-100 text-[#102A43] rounded-xl shrink-0">
                    <CategoryIcon category={issue.category} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {issue.trackingNumber}
                      </span>
                      <PriorityBadge priority={issue.priority} size="sm" />
                      <StatusBadge status={issue.status} size="sm" />
                    </div>
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-xs font-bold text-[#102A43] hover:text-[#2C7A7B] line-clamp-1"
                    >
                      {issue.title}
                    </Link>
                    <p className="text-[11px] text-slate-500">
                      {issue.location.address} • Reported by {issue.reporter.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <Link
                    to={`/issues/${issue.id}`}
                    className="px-3.5 py-1.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Manage Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Municipal Geographic Operations & Incident Map Section */}
      <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-[#2C7A7B] rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#102A43]">
                City Incident Map & Location Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live geographic overview of municipal incidents with priority-coded markers, triage filters, and live status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/nearby"
              className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] bg-teal-50 hover:bg-teal-100/70 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>Full Screen Map Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Interactive Map */}
        <CivicMap
          issues={issues}
          showFilters={true}
          height="h-[440px] sm:h-[500px]"
          title="Metropolis Live Incident Operations"
          subtitle="Priority color-coded markers"
        />
      </div>

      {/* Field Specialist Squad Status Grid */}
      <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#102A43]">
              Active Field Squads & Deployment ({activeWorkers.length} Active)
            </h2>
            <p className="text-xs text-slate-500">
              Field specialist availability and active incident workloads
            </p>
          </div>
          <Link
            to="/admin/workers"
            className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] inline-flex items-center gap-1"
          >
            <span>Worker Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {workers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <Users className="w-6 h-6 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-[#102A43]">No Field Specialists Registered</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Technicians and emergency repair crews will appear here upon registration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#102A43] truncate">
                      {worker.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{worker.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      worker.status === 'on_job'
                        ? 'bg-amber-100 text-amber-800'
                        : worker.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        worker.status === 'on_job'
                          ? 'bg-amber-500'
                          : worker.status === 'available'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {worker.status === 'on_job'
                      ? 'On Job'
                      : worker.status === 'available'
                      ? 'Available'
                      : 'Off Duty'}
                  </span>

                  <span className="text-[11px] text-slate-600 font-semibold">
                    {worker.activeIssuesCount} active tasks
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
