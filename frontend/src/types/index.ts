export type IssueCategory =
  | 'streetlights'
  | 'potholes'
  | 'garbage'
  | 'water_leakage'
  | 'damaged_roads'
  | 'drainage'
  | 'infrastructure'
  | 'parks'
  | 'electricity'
  | 'other';

export type IssueStatus =
  | 'reported'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'verified';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
export type PriorityLevel = IssuePriority;

export interface LocationInfo {
  address: string;
  landmark?: string;
  wardOrZone: string;
  area?: string; // Area / Ward name alias
  city: string;
  state?: string;
  pincode?: string;
  postalCode?: string;
  location_source?: 'MAP' | 'MANUAL';
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null; // Alias for latitude
  longitude?: number | null; // Alias for longitude
}

export type MapProviderType = 'leaflet' | 'openstreetmap' | 'carto' | 'custom_mock';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapFilterOptions {
  category?: IssueCategory | 'all';
  priority?: IssuePriority | 'all';
  status?: IssueStatus | 'all';
  searchQuery?: string;
  radiusKm?: number;
}

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  priority: IssuePriority;
  status: IssueStatus;
  category: IssueCategory;
  address?: string;
  area?: string;
  city?: string;
  issue?: CivicIssue;
}

export interface TimelineEvent {
  id: string;
  status: IssueStatus;
  title: string;
  description: string;
  timestamp: string;
  performedBy: {
    name: string;
    role: string;
    avatar?: string;
  };
  attachments?: string[];
}

export interface IssueComment {
  id: string;
  author: {
    id: string;
    name: string;
    role: 'citizen' | 'admin' | 'worker';
    avatar?: string;
    badge?: string;
  };
  content: string;
  timestamp: string;
  isInternal?: boolean; // For admin/worker only
  attachments?: string[];
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  expertise: string[];
  phone: string;
  email: string;
  availability: 'available' | 'busy' | 'on_leave';
  currentWorkload: number; // 0 - 100%
  activeIssuesCount: number;
  rating: number; // 1-5
  distanceKm: number;
  completedTasks: number;
}

export interface CivicIssue {
  id: string;
  trackingNumber: string; // e.g. "CP-2026-8841"
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: LocationInfo;
  images: string[];
  reporter: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    isAnonymous?: boolean;
  };
  assignedWorker?: Worker;
  department: string;
  createdAt: string;
  updatedAt: string;
  estimatedResolutionDate?: string;
  resolvedAt?: string;
  upvotes: number;
  userUpvoted?: boolean;
  timeline: TimelineEvent[];
  comments: IssueComment[];
  resolutionProof?: {
    images: string[];
    summary: string;
    resolvedDate: string;
    workerNotes: string;
  };
  feedbackRating?: {
    score: number; // 1-5
    comment?: string;
    verifiedByCitizen: boolean;
  };
  aiSuggestion?: {
    suggestedPriority: IssuePriority;
    suggestedDepartment: string;
    confidenceScore: number;
    hazardAnalysis: string;
  };
}

export type UserRole =
  | 'CITIZEN'
  | 'WORKER'
  | 'ORGANIZATION_ADMIN'
  | 'SUPER_ADMIN'
  | 'citizen'
  | 'worker'
  | 'admin'
  | 'organization_admin'
  | 'super_admin';

export type StandardRole = 'CITIZEN' | 'WORKER' | 'ORGANIZATION_ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: StandardRole;
  phone?: string;
  avatar?: string;
  organizationId?: string;
  organizationName?: string;
  department?: string;
  ward?: string;
  city?: string;
  impactScore?: number;
  isActive: boolean;
  mustChangePassword?: boolean;
  expertise?: string[];
  availability?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'worker' | 'organization_admin' | 'super_admin' | 'CITIZEN' | 'WORKER' | 'ORGANIZATION_ADMIN' | 'SUPER_ADMIN';
  avatar: string;
  phone?: string;
  address?: string;
  ward?: string;
  city?: string;
  impactScore: number;
  reportsSubmitted: number;
  reportsResolved: number;
  organizationId?: string;
  organizationName?: string;
  department?: string;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  code: string;
  type: string;
  jurisdictionWard: string;
  contactEmail: string;
  contactPhone: string;
  activeWorkersCount: number;
  totalIssuesHandled: number;
  slaComplianceRate: number;
  status: 'active' | 'inactive';
}

export type Organization = OrganizationInfo;

export interface UserAccountItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: StandardRole;
  organizationName?: string;
  organizationId?: string;
  department?: string;
  ward?: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLogin?: string;
  impactPoints: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'status_change' | 'worker_assigned' | 'resolved' | 'community_alert' | 'comment';
  read: boolean;
  createdAt: string;
  issueId?: string;
  issueTrackingNumber?: string;
}

export interface CategoryMetadata {
  id: IssueCategory;
  name: string;
  description: string;
  iconName: string;
  color: string;
  defaultDepartment: string;
  avgResolutionHours: number;
}

export interface LiveActivity {
  id: string;
  type: 'report' | 'dispatch' | 'status' | 'resolved' | 'announcement' | 'comment';
  title: string;
  description: string;
  timestamp: string;
  issueId?: string;
  category?: IssueCategory;
  priority?: IssuePriority;
  author?: string;
}

export interface AnnouncementPayload {
  title: string;
  message: string;
  priority?: 'normal' | 'urgent' | 'emergency';
  targetRole?: 'all' | 'citizen' | 'worker' | 'admin';
  targetWard?: string;
}

