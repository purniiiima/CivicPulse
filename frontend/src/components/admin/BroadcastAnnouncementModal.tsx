import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Megaphone, X, Send, Radio } from 'lucide-react';

interface BroadcastAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastAnnouncementModal: React.FC<BroadcastAnnouncementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { broadcastAnnouncement, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [targetRole, setTargetRole] = useState<'all' | 'citizen' | 'worker' | 'admin'>('all');
  const [targetWard, setTargetWard] = useState('All Wards');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      await broadcastAnnouncement({
        title: title.trim(),
        message: message.trim(),
        priority,
        targetRole,
        targetWard,
      });

      showToast({
        type: 'success',
        title: 'Announcement Published',
        message: `Municipal broadcast published to ${targetRole === 'all' ? 'all citizens & workers' : targetRole + 's'}.`,
      });

      setTitle('');
      setMessage('');
      setPriority('normal');
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-[22px] max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Broadcast Municipal Announcement
              </h2>
              <p className="text-xs text-slate-500">
                Dispatches notice to citizens & field crews across the municipality
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Announcement Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Water Pipeline Maintenance in Ward 14"
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Announcement Message
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide detailed instructions, timing, affected zones, or safety warnings..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Priority Urgency
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
              >
                <option value="normal">Standard Notice</option>
                <option value="urgent">Urgent Advisory</option>
                <option value="emergency">🚨 Emergency Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Audience
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
              >
                <option value="all">All Citizens & Crews (Global)</option>
                <option value="citizen">Citizens Only</option>
                <option value="worker">Field Workers Only</option>
                <option value="admin">Administrators Only</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              This message will be dispatched through the municipal notification system and appear in targeted user inboxes.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !message.trim() || isSending}
              className="px-5 py-2 text-xs font-bold bg-[#102A43] hover:bg-[#0B1D30] text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-[#F4B942]" />
              <span>{isSending ? 'Sending...' : 'Broadcast Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
