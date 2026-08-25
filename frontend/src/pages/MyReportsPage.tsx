import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueStatus, IssueCategory, IssuePriority, CivicIssue } from '../types';
import { IssueCard } from '../components/common/IssueCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  Search,
  Filter,
  PlusCircle,
  LayoutGrid,
  List,
  ArrowUpDown,
  Calendar,
  MapPin,
  ThumbsUp,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const { issues, currentUser, categories } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'upvotes'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter issues belonging to current user or if admin viewing reports
  const userIssues = useMemo(() => {
    const safeIssues = Array.isArray(issues) ? issues : [];
    return safeIssues.filter(
      (issue) =>
        (currentUser?.id && issue?.reporter?.id === currentUser.id) ||
        (currentUser?.email && issue?.reporter?.email === currentUser.email) ||
        currentUser?.role === 'admin'
    );
  }, [issues, currentUser]);

  const filteredIssues = useMemo(() => {
    return userIssues.filter((issue) => {
      if (!issue) return false;
      // Search query
      const matchesSearch =
        searchQuery === '' ||
        (issue.title && issue.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (issue.trackingNumber && issue.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (issue.location?.address && issue.location.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status tab
      let matchesStatus = true;
      if (selectedStatusTab === 'pending') {
        matchesStatus = issue.status === 'reported' || issue.status === 'under_review';
      } else if (selectedStatusTab === 'assigned') {
        matchesStatus = issue.status === 'assigned';
      } else if (selectedStatusTab === 'in_progress') {
        matchesStatus = issue.status === 'in_progress';
      } else if (selectedStatusTab === 'resolved') {
        matchesStatus = issue.status === 'resolved' || issue.status === 'verified';
      }

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || issue.category === selectedCategory;

      // Priority filter
      const matchesPriority =
        selectedPriority === 'all' || issue.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return 0;
    });
  }, [userIssues, searchQuery, selectedStatusTab, selectedCategory, selectedPriority, sortBy]);

  const statusCounts = useMemo(() => {
    return {
      all: userIssues.length,
      pending: userIssues.filter((i) => i.status === 'reported' || i.status === 'under_review').length,
      assigned: userIssues.filter((i) => i.status === 'assigned').length,
      in_progress: userIssues.filter((i) => i.status === 'in_progress').length,
      resolved: userIssues.filter((i) => i.status === 'resolved' || i.status === 'verified').length,
    };
  }, [userIssues]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            {currentUser.role === 'admin' ? 'All Municipal Reports' : 'My Reported Issues'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track live resolution progress, comments, and field worker updates for all tickets.
          </p>
        </div>

        <Link
          to="/report"
          className="px-5 py-2.5 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-4 shadow-xs space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 border-b border-slate-100">
          {[
            { key: 'all', label: 'All Reports', count: statusCounts.all },
            { key: 'pending', label: 'Pending Review', count: statusCounts.pending },
            { key: 'assigned', label: 'Assigned', count: statusCounts.assigned },
            { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
            { key: 'resolved', label: 'Resolved & Verified', count: statusCounts.resolved },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatusTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedStatusTab === tab.key
                  ? 'bg-[#102A43] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  selectedStatusTab === tab.key
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, street..."
              className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
            />
          </div>

          {/* Category filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Confirmed</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="lg:col-span-2 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border text-xs ${
                viewMode === 'grid'
                  ? 'bg-[#102A43] text-white border-[#102A43]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg border text-xs ${
                viewMode === 'table'
                  ? 'bg-[#102A43] text-white border-[#102A43]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[16px] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#102A43]">No Reports Match Filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, status tabs, or category dropdowns.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatusTab('all');
              setSelectedCategory('all');
            }}
            className="text-xs font-bold text-[#2C7A7B] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Tracking ID</th>
                  <th className="py-3.5 px-4">Problem</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reported</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {issue.trackingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="font-bold text-[#102A43] hover:text-[#2C7A7B] line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CategoryIcon category={issue.category} className="w-3.5 h-3.5 text-[#2C7A7B]" />
                        <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate">
                      {issue.location.address}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43]"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
