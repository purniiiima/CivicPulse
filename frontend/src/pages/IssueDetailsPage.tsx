import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { normalizeIssue } from '../utils/normalize';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { Timeline } from '../components/common/Timeline';
import { CivicMap } from '../components/common/CivicMap';
import { AssignWorkerModal } from '../components/common/AssignWorkerModal';
import { StatusChangeModal } from '../components/common/StatusChangeModal';
import {
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Star,
  ThumbsUp,
  MessageSquare,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Wrench,
  Clock,
  Sparkles,
  Shield,
  Send,
  BadgeCheck,
  Maximize2,
  X,
  Compass,
} from 'lucide-react';

export const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getIssueById,
    toggleUpvote,
    addComment,
    verifyIssueResolution,
    currentUser,
    showToast,
    issues,
  } = useApp();

  const appIssue = getIssueById(id || '');
  const [directFetchedIssue, setDirectFetchedIssue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!appIssue && !!id);
  const [fetchFailed, setFetchFailed] = useState<boolean>(false);

  const issue = appIssue || directFetchedIssue;

  // Direct backend fallback fetch if not in local store
  useEffect(() => {
    let isMounted = true;
    if (!appIssue && id) {
      setIsLoading(true);
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/issues/${encodeURIComponent(id)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Issue not found');
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            setDirectFetchedIssue(normalizeIssue(data));
            setIsLoading(false);
            setFetchFailed(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsLoading(false);
            setFetchFailed(true);
          }
        });
    } else if (appIssue) {
      setIsLoading(false);
      setFetchFailed(false);
    }
    return () => {
      isMounted = false;
    };
  }, [id, appIssue]);

  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Verification Rating state
  const [verificationRating, setVerificationRating] = useState<number>(5);
  const [verificationFeedback, setVerificationFeedback] = useState<string>('');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#2C7A7B] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-600">Loading civic issue record #{id}...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#102A43]">Civic Issue Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested tracking number or issue ID does not exist in our city repository.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(issue.id, newComment, isInternalNote);
    setNewComment('');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyIssueResolution(issue.id, verificationRating, verificationFeedback);
    setVerificationFeedback('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast({
      type: 'info',
      title: 'Link Copied',
      message: `Direct link for ${issue.trackingNumber} copied to clipboard.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#102A43] bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Issues</span>
        </button>

        {/* Action Controls for Admin/Worker/Citizen */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMapModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#102A43] bg-white border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            title="View on Interactive Map"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2C7A7B]" />
            <span>View on Map</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-slate-600 hover:text-[#102A43] bg-white border border-slate-200 rounded-xl transition-colors"
            title="Share Issue"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setAssignModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-[#102A43] text-white rounded-xl shadow-xs hover:bg-[#0B1D30] transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#F4B942]" />
              <span>Assign Worker</span>
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'worker') && (
            <button
              onClick={() => setStatusModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-[#2C7A7B] text-white rounded-xl shadow-xs hover:bg-teal-700 transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-teal-200" />
              <span>Update Status</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              {issue.trackingNumber}
            </span>
            <PriorityBadge priority={issue.priority} size="md" />
            <div className="flex items-center gap-1 text-xs font-semibold text-[#2C7A7B] ml-2">
              <CategoryIcon category={issue.category} className="w-4 h-4" />
              <span className="capitalize">{issue.category.replace('_', ' ')}</span>
            </div>
          </div>
          <StatusBadge status={issue.status} size="lg" />
        </div>

        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-black text-[#102A43] leading-snug">
            {issue.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Reporter & Meta row */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-[#2C7A7B] flex items-center justify-center font-bold shrink-0">
              {issue.reporter.avatar ? (
                <img
                  src={issue.reporter.avatar}
                  alt={issue.reporter.name}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Reporter
              </div>
              <div className="font-semibold text-slate-800">
                {issue.reporter.isAnonymous ? 'Anonymous Citizen' : issue.reporter.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Reported Date
              </div>
              <div className="font-semibold text-slate-800">
                {new Date(issue.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <button
              onClick={() => toggleUpvote(issue.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                issue.userUpvoted
                  ? 'bg-teal-50 text-[#2C7A7B] border-teal-300 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${issue.userUpvoted ? 'fill-current text-[#2C7A7B]' : ''}`}
              />
              <span>{issue.upvotes} Citizens confirmed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      {issue.images && issue.images.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#102A43]">
              Attached Photographic Evidence ({issue.images.length})
            </h3>
            <span className="text-xs text-slate-400">Click any image to enlarge</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {issue.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhoto(img)}
                className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 h-48 cursor-pointer group shadow-2xs"
              >
                <img
                  src={img}
                  alt={`Civic Report ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  View Full Resolution
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6-Stage Visual Resolution Timeline */}
      <Timeline currentStatus={issue.status} events={issue.timeline} />

      {/* Resolution Proof Card (if resolved/verified) */}
      {issue.resolutionProof && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-[18px] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Official Resolution Proof & Documentation</span>
          </div>

          <p className="text-xs text-emerald-800 leading-relaxed">
            {issue.resolutionProof.summary}
          </p>

          {issue.resolutionProof.images && issue.resolutionProof.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {issue.resolutionProof.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActivePhoto(img)}
                  className="rounded-xl overflow-hidden bg-white border border-emerald-300 h-44 cursor-pointer"
                >
                  <img
                    src={img}
                    alt="Resolution proof"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-[11px] text-emerald-700 pt-1">
            Resolved on: {new Date(issue.resolutionProof.resolvedDate).toLocaleString()} • Notes: "{issue.resolutionProof.workerNotes}"
          </div>
        </div>
      )}

      {/* Citizen Feedback & Verification Box (when resolved) */}
      {issue.status === 'resolved' && !issue.feedbackRating?.verifiedByCitizen && (
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-[#2C7A7B] rounded-[18px] p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-[#2C7A7B]" />
                <span>Verify This Fix as a Citizen</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Municipal crews marked this problem resolved. Does the repair look safe and complete?
              </p>
            </div>
            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-1 rounded-full">
              Citizen Action Required
            </span>
          </div>

          <form onSubmit={handleVerify} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Resolution Quality Rating (1 to 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setVerificationRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= verificationRating ? 'fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {verificationRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Verification Feedback (Optional)
              </label>
              <input
                type="text"
                value={verificationFeedback}
                onChange={(e) => setVerificationFeedback(e.target.value)}
                placeholder="e.g. Verified on my morning walk. Pothole is smooth and flush with asphalt!"
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Confirm & Verify Resolution</span>
            </button>
          </form>
        </div>
      )}

      {/* Two Column Grid: Assigned Worker & Location Map */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Assigned Worker Info */}
        <div className="md:col-span-6 bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned Field Specialist
            </h3>
            {issue.assignedWorker && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Dispatched
              </span>
            )}
          </div>

          {issue.assignedWorker ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {issue.assignedWorker.avatar ? (
                  <img
                    src={issue.assignedWorker.avatar}
                    alt={issue.assignedWorker.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-[#102A43]">
                    {issue.assignedWorker.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {issue.assignedWorker.role} • {issue.assignedWorker.department}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{issue.assignedWorker.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{issue.assignedWorker.rating} / 5 Rating</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                Awaiting Field Crew Assignment
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Municipal triage desk is selecting the nearest certified technician.
              </p>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl"
                >
                  Assign Specialist Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Location Map View */}
        <div className="md:col-span-6 bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Location Coordinates
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">
                {issue.location.lat}, {issue.location.lng}
              </span>
              <button
                type="button"
                onClick={() => setMapModalOpen(true)}
                className="text-[11px] font-bold text-[#2C7A7B] hover:text-[#102A43] flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Full Map</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-700 font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-4 h-4 text-[#2C7A7B] shrink-0" />
              <span className="truncate">{issue.location.address}, {issue.location.wardOrZone}</span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">{issue.location.city}</span>
          </div>

          <CivicMap
            issues={issues}
            focusIssueId={issue.id}
            selectedLocation={issue.location}
            height="h-48"
          />
        </div>
      </div>

      {/* Discussion & Public Notes Thread */}
      <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#102A43]">
              Community Discussion & Crew Notes
            </h3>
            <p className="text-xs text-slate-500">
              Public updates and official answers regarding this ticket
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {issue.comments.length} message{issue.comments.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {issue.comments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No comments posted yet. Start the conversation below.
            </div>
          ) : (
            issue.comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-xl text-xs space-y-2 ${
                  comment.isInternal
                    ? 'bg-amber-50/80 border border-amber-200'
                    : 'bg-slate-50 border border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-6 h-6 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="font-bold text-[#102A43]">
                      {comment.author.name}
                    </span>
                    {comment.author.badge && (
                      <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                        {comment.author.badge}
                      </span>
                    )}
                    {comment.isInternal && (
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                        Internal Staff Note
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(comment.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Post Comment Input */}
        <form onSubmit={handlePostComment} className="pt-4 border-t border-slate-100 space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add an update, ask a question, or provide additional on-site info..."
              className="w-full text-xs p-3.5 pr-12 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="absolute right-3 bottom-3 p-2 bg-[#102A43] hover:bg-[#0B1D30] text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {(currentUser.role === 'admin' || currentUser.role === 'worker') && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                id="internalNote"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-600 rounded"
              />
              <label htmlFor="internalNote" className="text-slate-600 cursor-pointer">
                Mark as internal municipal staff note (hidden from citizen public view)
              </label>
            </div>
          )}
        </form>
      </div>

      {/* Modals */}
      <AssignWorkerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        issue={issue}
      />

      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        issue={issue}
      />

      {/* Interactive Location Intelligence Fullscreen Modal */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-[#2C7A7B] rounded-2xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      #{issue.trackingNumber}
                    </span>
                    <h3 className="font-extrabold text-[#102A43] text-base">{issue.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {issue.location.address}, {issue.location.wardOrZone} • {issue.location.city} ({issue.location.lat}, {issue.location.lng})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMapModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Map View */}
            <div className="flex-1 relative w-full h-full">
              <CivicMap
                issues={issues}
                focusIssueId={issue.id}
                selectedLocation={issue.location}
                showFilters
                showNearbyRadius
                radiusKm={2}
                height="h-full"
                title={`${issue.trackingNumber} Geographic Location`}
                subtitle="Showing issue pin and nearby reports within 2km"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
