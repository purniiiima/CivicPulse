import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CivicIssue, IssueStatus, IssuePriority, IssueCategory } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { AssignWorkerModal } from '../../components/common/AssignWorkerModal';
import { StatusChangeModal } from '../../components/common/StatusChangeModal';
import {
  Search,
  Filter,
  Download,
  CheckSquare,
  Square,
  User,
  Wrench,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const IssueManagementPage: React.FC = () => {
  const { issues, categories, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [activeIssueForAssign, setActiveIssueForAssign] = useState<CivicIssue | null>(null);
  const [activeIssueForStatus, setActiveIssueForStatus] = useState<CivicIssue | null>(null);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSearch =
        searchQuery === '' ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.reporter.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      const matchWard = wardFilter === 'all' || issue.location.wardOrZone.includes(wardFilter);

      return matchSearch && matchStatus && matchPriority && matchCategory && matchWard;
    });
  }, [issues, searchQuery, statusFilter, priorityFilter, categoryFilter, wardFilter]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredIssues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIssues.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Tracking Number', 'Title', 'Category', 'Priority', 'Status', 'Address', 'Reporter', 'Created Date'],
        ...filteredIssues.map((i) => [
          i.trackingNumber,
          `"${i.title.replace(/"/g, '""')}"`,
          i.category,
          i.priority,
          i.status,
          `"${i.location.address.replace(/"/g, '""')}"`,
          i.reporter.name,
          i.createdAt,
        ]),
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civicpulse_issues_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Export Complete',
      message: `Exported ${filteredIssues.length} civic issues to CSV.`,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            City Incident & Issue Management Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Filter, triage, dispatch field workers, and oversee ticket resolution SLAs across all municipal departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, street, citizen..."
              className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported (New)</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="verified">Verified by Citizen</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Items Batch Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#102A43]">
            <span className="font-bold">
              {selectedIds.length} ticket{selectedIds.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Batch Action',
                    message: 'Batch assignment dispatched to field maintenance squad.',
                  });
                }}
                className="px-3 py-1.5 bg-[#102A43] text-white font-bold rounded-lg text-xs"
              >
                Batch Dispatch Squad
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg text-xs"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Issues Table (Desktop/Tablet) & Cards (Mobile) */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] overflow-hidden shadow-xs">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredIssues.map((issue) => {
            const isSelected = selectedIds.includes(issue.id);

            return (
              <div
                key={`mobile-${issue.id}`}
                className={`p-4 space-y-3 transition-colors ${
                  isSelected ? 'bg-teal-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(issue.id)}
                      className="w-4 h-4 rounded text-[#2C7A7B]"
                    />
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {issue.trackingNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={issue.priority} size="sm" />
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                </div>

                <div>
                  <Link
                    to={`/issues/${issue.id}`}
                    className="font-bold text-sm text-[#102A43] hover:text-[#2C7A7B] line-clamp-2"
                  >
                    {issue.title}
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <CategoryIcon category={issue.category} className="w-3.5 h-3.5 text-[#2C7A7B]" />
                    <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate max-w-[55%]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.location.address}</span>
                  </div>

                  {issue.assignedWorker ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <img
                        src={issue.assignedWorker.avatar}
                        alt={issue.assignedWorker.name}
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[90px]">
                        {issue.assignedWorker.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Mobile Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveIssueForAssign(issue)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-[#102A43] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <User className="w-3.5 h-3.5 text-[#2C7A7B]" />
                    <span>Assign</span>
                  </button>
                  <button
                    onClick={() => setActiveIssueForStatus(issue)}
                    className="flex-1 py-2 px-3 bg-[#2C7A7B] hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Status</span>
                  </button>
                  <Link
                    to={`/issues/${issue.id}`}
                    className="py-2 px-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center min-h-[40px]"
                    title="View Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredIssues.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No civic issues match the selected filters.
            </div>
          )}
        </div>

        {/* Desktop / Tablet View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredIssues.length > 0 &&
                      selectedIds.length === filteredIssues.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#2C7A7B]"
                  />
                </th>
                <th className="py-3.5 px-4">Tracking ID</th>
                <th className="py-3.5 px-4">Incident Problem</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Specialist</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => {
                const isSelected = selectedIds.includes(issue.id);

                return (
                  <tr
                    key={issue.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(issue.id)}
                        className="w-4 h-4 rounded text-[#2C7A7B]"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {issue.trackingNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="font-bold text-[#102A43] hover:text-[#2C7A7B] line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                      <div className="text-[10px] text-slate-400">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <CategoryIcon category={issue.category} className="w-3.5 h-3.5 text-[#2C7A7B]" />
                        <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      {issue.assignedWorker ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={issue.assignedWorker.avatar}
                            alt={issue.assignedWorker.name}
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-semibold text-slate-800 truncate max-w-[100px]">
                            {issue.assignedWorker.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                      {issue.location.address}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveIssueForAssign(issue)}
                          className="p-1.5 text-slate-600 hover:text-[#102A43] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Assign Worker"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveIssueForStatus(issue)}
                          className="p-1.5 text-slate-600 hover:text-[#2C7A7B] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/issues/${issue.id}`}
                          className="p-1.5 text-slate-600 hover:text-[#102A43] hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {activeIssueForAssign && (
        <AssignWorkerModal
          isOpen={!!activeIssueForAssign}
          onClose={() => setActiveIssueForAssign(null)}
          issue={activeIssueForAssign}
        />
      )}

      {activeIssueForStatus && (
        <StatusChangeModal
          isOpen={!!activeIssueForStatus}
          onClose={() => setActiveIssueForStatus(null)}
          issue={activeIssueForStatus}
        />
      )}
    </div>
  );
};
