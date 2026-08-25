import React, { useState } from 'react';
import { CivicIssue, Worker } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import {
  UserCheck,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  User,
} from 'lucide-react';

interface AssignWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: CivicIssue | null;
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  isOpen,
  onClose,
  issue,
}) => {
  const { workers, assignWorkerToIssue } = useApp();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!issue) return null;

  const handleAssign = () => {
    if (!selectedWorkerId) return;
    setIsSubmitting(true);
    setTimeout(() => {
      assignWorkerToIssue(issue.id, selectedWorkerId, notes);
      setIsSubmitting(false);
      onClose();
      setSelectedWorkerId('');
      setNotes('');
    }, 400);
  };

  // Sort workers by smart match (matching department, availability, low workload, proximity)
  const rankedWorkers = [...workers].sort((a, b) => {
    const aDeptMatch = a.department.toLowerCase().includes(issue.department.toLowerCase()) ? 20 : 0;
    const bDeptMatch = b.department.toLowerCase().includes(issue.department.toLowerCase()) ? 20 : 0;
    const aAvail = a.availability === 'available' ? 15 : a.availability === 'busy' ? 5 : -50;
    const bAvail = b.availability === 'available' ? 15 : b.availability === 'busy' ? 5 : -50;
    const aScore = aDeptMatch + aAvail - a.currentWorkload * 0.1 - a.distanceKm * 2;
    const bScore = bDeptMatch + bAvail - b.currentWorkload * 0.1 - b.distanceKm * 2;
    return bScore - aScore;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch & Assign Field Worker"
      subtitle={`Assigning issue ${issue.trackingNumber}: "${issue.title}"`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Issue mini summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3 text-xs">
          <div className="p-2 bg-teal-50 text-[#2C7A7B] rounded-lg shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">
              Department: {issue.department}
            </div>
            <div className="text-slate-500 mt-0.5">
              Location: {issue.location.address} • Priority:{' '}
              <span className="font-semibold text-red-600 uppercase">
                {issue.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Worker selection list */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Select Field Specialist
          </label>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {rankedWorkers.map((worker, index) => {
              const isSelected = selectedWorkerId === worker.id;
              const isBestMatch = index === 0 && worker.availability === 'available';

              return (
                <div
                  key={worker.id}
                  onClick={() =>
                    worker.availability !== 'on_leave' && setSelectedWorkerId(worker.id)
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    worker.availability === 'on_leave'
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                      : isSelected
                      ? 'border-[#2C7A7B] bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  {isBestMatch && (
                    <span className="absolute -top-2.5 right-4 bg-[#2C7A7B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#F4B942]" />
                      Recommended Specialist
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {worker.avatar ? (
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#102A43]">
                            {worker.name}
                          </h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              worker.availability === 'available'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : worker.availability === 'busy'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {worker.availability.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {worker.role} • {worker.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{worker.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{worker.distanceKm} km away</span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise Tags & Workload bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {worker.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Workload:</span>
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            worker.currentWorkload > 70
                              ? 'bg-amber-500'
                              : 'bg-[#2C7A7B]'
                          }`}
                          style={{ width: `${worker.currentWorkload}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[11px]">
                        {worker.currentWorkload}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Dispatch Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Dispatch Instructions & Safety Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Please bring heavy-duty sealants and check adjacent valves as well..."
            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedWorkerId || isSubmitting}
            onClick={handleAssign}
            className="px-5 py-2.5 text-xs font-bold bg-[#102A43] hover:bg-[#0B1D30] text-white rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Dispatching...' : 'Confirm Assignment'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
