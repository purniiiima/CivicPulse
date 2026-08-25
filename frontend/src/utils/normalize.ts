import { CivicIssue, Worker, TimelineEvent, IssueComment, IssueCategory, IssuePriority, IssueStatus } from '../types';

export function formatStatusLabel(status: string): string {
  const map: Record<string, string> = {
    reported: 'Report Submitted',
    under_review: 'Under Review',
    assigned: 'Worker Assigned',
    in_progress: 'Work in Progress',
    resolved: 'Resolved',
    verified: 'Citizen Verified',
  };
  return map[status.toLowerCase()] || status;
}

export function normalizeIssue(raw: any): CivicIssue {
  if (!raw) return raw;

  // Location
  const loc = raw.location || {};
  const lat = raw.latitude ?? loc.lat ?? loc.latitude ?? 28.6139;
  const lng = raw.longitude ?? loc.lng ?? loc.longitude ?? 77.2090;
  const address = raw.address ?? loc.address ?? 'City Central Zone';
  const ward = raw.ward ?? loc.wardOrZone ?? loc.ward ?? loc.area ?? 'Ward 14 - Central Metro';
  const landmark = raw.landmark ?? loc.landmark ?? '';
  const city = raw.city ?? loc.city ?? 'Metropolis City';
  const state = raw.state ?? loc.state ?? 'State';
  const pincode = raw.pincode ?? loc.pincode ?? loc.postalCode ?? '110001';
  const location_source = raw.location_source ?? loc.location_source ?? 'MAP';

  // Category
  let categoryStr = 'other';
  if (typeof raw.category === 'string') {
    categoryStr = raw.category;
  } else if (raw.category?.slug) {
    categoryStr = raw.category.slug;
  } else if (raw.category?.name) {
    categoryStr = raw.category.name;
  } else if (raw.category_id) {
    categoryStr = raw.category_id;
  }
  const category = (categoryStr.toLowerCase().replace(/[\s-]+/g, '_')) as IssueCategory;

  // Reporter
  const rep = raw.reporter || {};
  const reporter = {
    id: rep.id || raw.reporter_id || 'citizen-guest',
    name: rep.name || rep.full_name || raw.reporter_name || 'Citizen Reporter',
    email: rep.email || raw.reporter_email || '',
    phone: rep.phone || raw.reporter_phone || '',
    avatar: rep.avatar || rep.avatar_url || '',
    isAnonymous: !!(rep.isAnonymous ?? raw.is_anonymous),
  };

  // Timeline / Status History
  let timeline: TimelineEvent[] = [];
  if (Array.isArray(raw.timeline) && raw.timeline.length > 0) {
    timeline = raw.timeline.map((t: any) => ({
      id: t.id || `t-${Math.random()}`,
      status: (t.status || 'reported').toLowerCase() as IssueStatus,
      title: t.title || formatStatusLabel(t.status || 'reported'),
      description: t.description || 'Status update recorded',
      timestamp: t.timestamp || t.created_at || new Date().toISOString(),
      performedBy: {
        name: t.performedBy?.name || t.changed_by_user?.full_name || 'Municipal Officer',
        role: t.performedBy?.role || t.changed_by_user?.role || 'Staff',
        avatar: t.performedBy?.avatar || '',
      },
      attachments: t.attachments || [],
    }));
  } else if (Array.isArray(raw.status_history) && raw.status_history.length > 0) {
    timeline = raw.status_history.map((sh: any) => ({
      id: sh.id || `sh-${Math.random()}`,
      status: (sh.new_status || sh.status || 'reported').toLowerCase() as IssueStatus,
      title: formatStatusLabel(sh.new_status || sh.status || 'reported'),
      description: sh.notes || 'Status updated',
      timestamp: sh.created_at || sh.timestamp || new Date().toISOString(),
      performedBy: {
        name: sh.changed_by_user?.full_name || sh.changed_by_user?.name || 'Municipal Staff',
        role: sh.changed_by_user?.role || 'Officer',
      },
    }));
  } else {
    // Default initial timeline event if empty
    timeline = [
      {
        id: `t-init-${raw.id || Date.now()}`,
        status: (raw.status || 'reported').toLowerCase() as IssueStatus,
        title: 'Report Submitted',
        description: `Issue "${raw.title || 'Civic Report'}" registered into system.`,
        timestamp: raw.created_at || raw.createdAt || new Date().toISOString(),
        performedBy: {
          name: reporter.name,
          role: 'Citizen',
        },
      },
    ];
  }

  // Assigned Worker
  let assignedWorker: Worker | undefined = undefined;
  const aw = raw.assignedWorker || raw.assigned_worker;
  if (aw) {
    assignedWorker = normalizeWorker(aw);
  }

  // Comments
  let comments: IssueComment[] = [];
  if (Array.isArray(raw.comments)) {
    comments = raw.comments.map((c: any) => ({
      id: c.id || `c-${Math.random()}`,
      author: {
        id: c.author?.id || c.user_id || c.user?.id || 'unknown',
        name: c.author?.name || c.user?.full_name || 'User',
        role: (c.author?.role || c.user?.role || 'citizen').toLowerCase() as any,
        avatar: c.author?.avatar || c.user?.avatar_url || '',
      },
      content: c.content || '',
      timestamp: c.created_at || c.timestamp || new Date().toISOString(),
      isInternal: !!(c.isInternal ?? c.is_internal),
      attachments: c.attachments || [],
    }));
  }

  // Images
  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    images = raw.images;
  } else if (Array.isArray(raw.attachments)) {
    images = raw.attachments.map((a: any) => (typeof a === 'string' ? a : a.file_url)).filter(Boolean);
  }

  const rawId = String(raw.id || `issue-${Date.now()}`);
  const trackingNumber = raw.trackingNumber || raw.tracking_number || `CP-2026-${rawId.slice(0, 4).toUpperCase()}`;

  return {
    id: rawId,
    trackingNumber,
    title: raw.title || 'Civic Issue',
    description: raw.description || '',
    category,
    priority: ((raw.priority || 'medium').toLowerCase()) as IssuePriority,
    status: ((raw.status || 'reported').toLowerCase()) as IssueStatus,
    location: {
      address,
      landmark,
      wardOrZone: ward,
      area: ward,
      city,
      state,
      pincode,
      postalCode: pincode,
      location_source,
      lat,
      lng,
      latitude: lat,
      longitude: lng,
    },
    images,
    reporter,
    assignedWorker,
    department: raw.department || raw.category?.department || 'Municipal Services',
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    resolvedAt: raw.resolvedAt || raw.resolved_at,
    estimatedResolutionDate: raw.estimatedResolutionDate || raw.estimated_resolution_date,
    upvotes: raw.upvotes ?? raw.upvotes_count ?? 0,
    userUpvoted: !!(raw.userUpvoted ?? raw.user_upvoted),
    timeline,
    comments,
    resolutionProof: raw.resolutionProof || (raw.resolution_photo_url ? {
      images: [raw.resolution_photo_url],
      summary: raw.resolution_notes || 'Resolved by field staff',
      resolvedDate: raw.resolved_at || new Date().toISOString(),
      workerNotes: raw.resolution_notes || '',
    } : undefined),
    feedbackRating: raw.feedbackRating || (raw.resolution_rating ? {
      score: raw.resolution_rating,
      comment: raw.resolution_feedback,
      verifiedByCitizen: true,
    } : undefined),
    aiSuggestion: raw.aiSuggestion,
  };
}

export function normalizeWorker(raw: any): Worker {
  if (!raw) return raw;
  const name = raw.name || raw.user?.full_name || raw.full_name || `Specialist ${raw.employee_code || ''}`.trim();
  const department = raw.department || 'Infrastructure';
  const specialization = raw.specialization || raw.department || 'General Maintenance';
  const expertise = Array.isArray(raw.expertise) ? raw.expertise : [specialization];
  const activeCount = raw.activeIssuesCount ?? raw.active_issues_count ?? 0;

  return {
    id: String(raw.id || ''),
    name,
    avatar: raw.avatar || raw.user?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    role: raw.role || 'Municipal Field Specialist',
    department,
    expertise,
    phone: raw.phone || raw.user?.phone || '+91 98765 43210',
    email: raw.email || raw.user?.email || 'specialist@civicpulse.gov.in',
    availability: raw.availability || (raw.status === 'AVAILABLE' || raw.status === 'available' ? 'available' : 'busy'),
    currentWorkload: raw.currentWorkload ?? (activeCount ? Math.min(100, activeCount * 25) : 30),
    activeIssuesCount: activeCount,
    rating: raw.rating ?? 4.8,
    distanceKm: raw.distanceKm ?? 1.5,
    completedTasks: raw.completedTasks ?? raw.completed_jobs ?? 0,
  };
}
