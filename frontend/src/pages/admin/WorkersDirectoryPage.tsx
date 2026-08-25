import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Worker } from '../../types';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Briefcase,
  Shield,
  Plus,
  Award,
  User,
} from 'lucide-react';

export const WorkersDirectoryPage: React.FC = () => {
  const { workers, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      searchQuery === '' ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'all' || worker.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(workers.map((w) => w.department)));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            Certified Municipal Field Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of certified engineers, electricians, asphalt squads, and sanitation supervisors.
          </p>
        </div>

        <button
          onClick={() => {
            showToast({
              type: 'info',
              title: 'Worker Registration',
              message: 'Municipal HR onboarding portal open for new technician registrations.',
            });
          }}
          className="px-4 py-2.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Specialist</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by specialist name, department, expertise..."
            className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Municipal Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Specialist Cards Grid */}
      {filteredWorkers.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-[18px] p-12 text-center text-slate-400 space-y-2">
          <Users className="w-8 h-8 mx-auto opacity-40" />
          <p className="text-sm font-bold text-slate-700">No Field Technicians Registered</p>
          <p className="text-xs text-slate-500">
            Registered technicians and field engineers will appear in this directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {worker.avatar ? (
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-teal-500/30"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 ring-2 ring-teal-500/30 flex items-center justify-center text-slate-500">
                        <User className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-[#102A43]">{worker.name}</h3>
                      <p className="text-xs text-slate-500">{worker.role}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-700 font-bold mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{worker.rating} / 5.0</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      worker.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : worker.status === 'on_job'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {worker.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Skills Tags */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Certified Competencies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {worker.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="text-xs text-slate-600 space-y-1.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{worker.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{worker.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <div className="font-bold text-[#102A43]">{worker.completedJobs}</div>
                  <div className="text-[10px] text-slate-500">Jobs Completed</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <div className="font-bold text-[#2C7A7B]">{worker.activeIssuesCount}</div>
                  <div className="text-[10px] text-slate-500">Active Queue</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
