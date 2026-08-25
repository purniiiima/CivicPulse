import React, { useState } from 'react';
import { CivicIssue, IssueStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Search,
  UserCheck,
  Wrench,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: CivicIssue | null;
}

const STATUS_OPTIONS: Array<{
  value: IssueStatus;
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    value: 'under_review',
    label: 'Under Review',
    desc: 'Verify hazard level, dispatch criteria & jurisdiction',
    icon: Search,
  },
  {
    value: 'assigned',
    label: 'Assigned',
    desc: 'Field squad assigned to problem',
    icon: UserCheck,
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    desc: 'Workers on-site performing repairs or maintenance',
    icon: Wrench,
  },
  {
    value: 'resolved',
    label: 'Resolved',
    desc: 'Work fully completed with photographic documentation',
    icon: CheckCircle2,
  },
];

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  issue,
}) => {
  const { updateIssueStatus } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(
    issue?.status || 'in_progress'
  );
  const [remarks, setRemarks] = useState('');
  const [proofImage, setProofImage] = useState<string>(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!issue) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (selectedStatus === 'resolved') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Safe confetti fallback
      }
    }

    setTimeout(() => {
      const proofImages = selectedStatus === 'resolved' && proofImage ? [proofImage] : undefined;
      updateIssueStatus(
        issue.id,
        selectedStatus,
        remarks,
        proofImages
      );
      setIsSubmitting(false);
      onClose();
      setRemarks('');
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Resolution Status"
      subtitle={`Updating progress for ${issue.trackingNumber}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current status display */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
          <span className="text-slate-600">Current Status:</span>
          <StatusBadge status={issue.status} size="sm" />
        </div>

        {/* Status choices */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            New Stage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStatus === opt.value;

              return (
                <div
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-[#2C7A7B] bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-[#2C7A7B] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#102A43]">
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {opt.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Status Update Remarks & Details
          </label>
          <textarea
            required
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Describe actions taken (e.g. Assembled hot-mix patch unit, sealed crack, cleared drainage line)..."
            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
          />
        </div>

        {/* Photo Proof for Resolution */}
        {selectedStatus === 'resolved' && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolution Proof Photo</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Citizens and supervisors will inspect this photographic proof to verify resolution.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {proofImage && (
                <img
                  src={proofImage}
                  alt="Proof thumbnail"
                  className="w-14 h-14 rounded-lg object-cover border border-emerald-300"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={proofImage}
                  onChange={(e) => setProofImage(e.target.value)}
                  placeholder="Image URL or upload proof"
                  className="w-full text-[11px] p-2 bg-white border border-emerald-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !remarks.trim()}
            className="px-5 py-2.5 text-xs font-bold bg-[#102A43] hover:bg-[#0B1D30] text-white rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Updating...' : 'Publish Update'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
