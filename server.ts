import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'civicpulse-production-secure-random-jwt-key-2026';
const JWT_EXPIRES_IN = '24h';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'civicpulse_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type UserRole = 'CITIZEN' | 'WORKER' | 'ORGANIZATION_ADMIN' | 'SUPER_ADMIN';

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  points: number;
  is_active: boolean;
  must_change_password?: boolean;
  department?: string;
  organization_id?: string;
  organization_name?: string;
  ward?: string;
  city?: string;
  expertise?: string[];
  availability?: string;
  created_at: string;
  updated_at: string;
}

export interface DbIssue {
  id: string;
  tracking_number: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'verified';
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  ward: string;
  location_source?: 'MAP' | 'MANUAL';
  latitude: number | null;
  longitude: number | null;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string;
  reporter_avatar?: string;
  is_anonymous?: boolean;
  department: string;
  organization_id?: string;
  assigned_worker_id?: string;
  assigned_worker_name?: string;
  assigned_worker_email?: string;
  assigned_worker_phone?: string;
  assigned_worker_avatar?: string;
  assigned_worker_department?: string;
  images?: string[];
  proof_images?: string[];
  resolution_summary?: string;
  worker_notes?: string;
  resolved_at?: string;
  estimated_resolution_date?: string;
  upvotes_count: number;
  upvoted_user_ids?: string[];
  feedback_rating?: {
    score: number;
    comment?: string;
    verifiedByCitizen: boolean;
  };
  timeline: {
    id: string;
    status: string;
    title: string;
    description: string;
    timestamp: string;
    performedBy: {
      name: string;
      role: string;
      avatar?: string;
    };
    attachments?: string[];
  }[];
  comments: {
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
    isInternal?: boolean;
    attachments?: string[];
  }[];
  created_at: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  target_user_id?: string;
  target_role?: string;
  issue_id?: string;
  issue_tracking_number?: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: DbUser[];
  issues: DbIssue[];
  organizations: any[];
  categories: any[];
  activities: any[];
  notifications: DbNotification[];
}

// ==========================================
// BACKEND-ONLY DATABASE PROVISIONING & SEEDING
// ==========================================

interface AdminSeedDefinition {
  id: string;
  email: string;
  seedPassword: string; // Used ONLY during server boot bcrypt hashing; NEVER saved to DB
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  department?: string;
  organization_id?: string;
  organization_name?: string;
  ward: string;
  city: string;
  points: number;
}

const PRE_PROVISIONED_ADMINISTRATORS: AdminSeedDefinition[] = [
  // Super Administrators (Municipal Command Authority)
  {
    id: 'u-superadmin-01',
    email: 'superadmin@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Sandeep Kumar',
    phone: '+1 (555) 019-0001',
    role: 'SUPER_ADMIN',
    department: 'Citywide Governance Directorate',
    organization_id: 'org-metro-central',
    organization_name: 'Metropolitan Municipal Authority',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 1000,
  },
  {
    id: 'u-superadmin-02',
    email: 'director.superadmin@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Rajesh Patel',
    phone: '+1 (555) 019-0002',
    role: 'SUPER_ADMIN',
    department: 'Municipal Operations Oversight',
    organization_id: 'org-metro-central',
    organization_name: 'Metropolitan Municipal Authority',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 1000,
  },
  // Organization Administrators (Departmental Agency Admins)
  {
    id: 'u-admin-01',
    email: 'admin@metropolis.gov',
    seedPassword: 'Password123!',
    full_name: 'Neha Sharma',
    phone: '+1 (555) 431-9000',
    role: 'ORGANIZATION_ADMIN',
    department: 'Infrastructure Operations Directorate',
    organization_id: 'org-dot',
    organization_name: 'Metropolitan Public Works Department',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 500,
  },
  {
    id: 'u-admin-02',
    email: 'admin@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Amit Verma',
    phone: '+1 (555) 431-9001',
    role: 'ORGANIZATION_ADMIN',
    department: 'Transportation & Works',
    organization_id: 'org-dot',
    organization_name: 'Department of Transportation & Public Works',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 500,
  },
  {
    id: 'u-admin-03',
    email: 'roads.admin@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Pooja Deshmukh',
    phone: '+1 (555) 431-9002',
    role: 'ORGANIZATION_ADMIN',
    department: 'Roadways & Pavements Directorate',
    organization_id: 'org-dot',
    organization_name: 'Department of Transportation & Public Works',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 500,
  },
  {
    id: 'u-admin-04',
    email: 'water.admin@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Ananya Iyer',
    phone: '+1 (555) 431-9003',
    role: 'ORGANIZATION_ADMIN',
    department: 'Water Supply & Drainage Operations',
    organization_id: 'org-water',
    organization_name: 'Water Utilities & Drainage Authority',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 500,
  },
  {
    id: 'u-admin-05',
    email: 'sanitation.admin@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Suresh Menon',
    phone: '+1 (555) 431-9004',
    role: 'ORGANIZATION_ADMIN',
    department: 'Sanitation & Waste Management',
    organization_id: 'org-sanitation',
    organization_name: 'Public Sanitation & Environmental Management',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 500,
  },
  {
    id: 'u-admin-06',
    email: 'electrical.admin@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Kavita Rao',
    phone: '+1 (555) 431-9005',
    role: 'ORGANIZATION_ADMIN',
    department: 'Electrical Grid & Lighting Directorate',
    organization_id: 'org-dot',
    organization_name: 'Department of Transportation & Public Works',
    ward: 'All Wards',
    city: 'Metropolis City',
    points: 500,
  },
  // Public Citizen Account
  {
    id: 'u-citizen-01',
    email: 'citizen@example.com',
    seedPassword: 'Password123!',
    full_name: 'Sarah Jenkins',
    phone: '+1 (555) 892-3112',
    role: 'CITIZEN',
    ward: 'Ward 14 - Central Metro',
    city: 'Metropolis City',
    points: 120,
  },
  // Field Operations Technicians
  {
    id: 'u-worker-01',
    email: 'worker@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Marcus Thorne',
    phone: '+1 (555) 782-4410',
    role: 'WORKER',
    department: 'Transportation & Works',
    organization_id: 'org-dot',
    organization_name: 'Department of Transportation & Public Works',
    ward: 'Ward 14 - Central Metro',
    city: 'Metropolis City',
    points: 340,
  },
  {
    id: 'u-worker-02',
    email: 'worker2@civicpulse.gov',
    seedPassword: 'Password123!',
    full_name: 'Elena Cruz',
    phone: '+1 (555) 661-8932',
    role: 'WORKER',
    department: 'Water Utilities',
    organization_id: 'org-water',
    organization_name: 'Water Utilities & Drainage Authority',
    ward: 'Ward 14 - Central Metro',
    city: 'Metropolis City',
    points: 280,
  },
];

// Initial Database Seeding - Real accounts only, ZERO mock business data
function getInitialSeedDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);

  const users: DbUser[] = [];

  // Securely provision administrative accounts (hashing passwords before storage)
  for (const adminDef of PRE_PROVISIONED_ADMINISTRATORS) {
    const adminPasswordHash = bcrypt.hashSync(adminDef.seedPassword, salt);
    users.push({
      id: adminDef.id,
      email: adminDef.email,
      password_hash: adminPasswordHash,
      full_name: adminDef.full_name,
      phone: adminDef.phone,
      role: adminDef.role,
      avatar_url: adminDef.avatar_url,
      department: adminDef.department,
      organization_id: adminDef.organization_id,
      organization_name: adminDef.organization_name,
      ward: adminDef.ward,
      city: adminDef.city,
      points: adminDef.points,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });
  }

  const organizations = [
    {
      id: 'org-dot',
      name: 'Department of Transportation & Public Works',
      code: 'DOT-PW',
      type: 'Municipal Department',
      jurisdictionWard: 'All Metro Wards (1-18)',
      contactEmail: 'roads@civicpulse.gov',
      contactPhone: '(555) 019-2831',
      activeWorkersCount: 0,
      totalIssuesHandled: 0,
      slaComplianceRate: 100.0,
      status: 'active',
    },
    {
      id: 'org-sanitation',
      name: 'Public Sanitation & Environmental Management',
      code: 'SAN-ENV',
      type: 'Sanitation Authority',
      jurisdictionWard: 'All Metro Wards (1-18)',
      contactEmail: 'sanitation@civicpulse.gov',
      contactPhone: '(555) 019-4920',
      activeWorkersCount: 0,
      totalIssuesHandled: 0,
      slaComplianceRate: 100.0,
      status: 'active',
    },
    {
      id: 'org-water',
      name: 'Water Utilities & Drainage Authority',
      code: 'WATER-UTL',
      type: 'Utilities Authority',
      jurisdictionWard: 'All Metro Wards (1-18)',
      contactEmail: 'water@civicpulse.gov',
      contactPhone: '(555) 019-8833',
      activeWorkersCount: 0,
      totalIssuesHandled: 0,
      slaComplianceRate: 100.0,
      status: 'active',
    },
  ];

  const categories = [
    {
      id: 'streetlights',
      name: 'Broken Streetlights',
      description: 'Non-functional streetlights, blinking lamps, or dark public walkways',
      iconName: 'Lightbulb',
      color: '#D97706',
      defaultDepartment: 'Electrical & Lighting Division',
      avgResolutionHours: 24,
    },
    {
      id: 'potholes',
      name: 'Potholes',
      description: 'Road craters, surface fissures, and dangerous road cavities',
      iconName: 'CircleDotDashed',
      color: '#C53030',
      defaultDepartment: 'Roads & Highway Maintenance',
      avgResolutionHours: 48,
    },
    {
      id: 'garbage',
      name: 'Garbage & Waste',
      description: 'Overflowing dumpsters, illegal dumping, littering, or missed trash collection',
      iconName: 'Trash2',
      color: '#2F855A',
      defaultDepartment: 'Sanitation & Solid Waste Dept',
      avgResolutionHours: 18,
    },
    {
      id: 'water_leakage',
      name: 'Water Leakage',
      description: 'Burst pipelines, hydrants leaking, main supply pipe seepage',
      iconName: 'Droplets',
      color: '#2B6CB0',
      defaultDepartment: 'Water Supply & Sewerage Board',
      avgResolutionHours: 12,
    },
    {
      id: 'damaged_roads',
      name: 'Damaged Roads & Curbs',
      description: 'Broken sidewalks, uneven asphalt, collapsed dividers or medians',
      iconName: 'Construction',
      color: '#9C4221',
      defaultDepartment: 'Public Works Dept (PWD)',
      avgResolutionHours: 72,
    },
    {
      id: 'drainage',
      name: 'Drainage & Flooding',
      description: 'Clogged storm drains, stagnant monsoon water, open manhole covers',
      iconName: 'Waves',
      color: '#2C7A7B',
      defaultDepartment: 'Stormwater & Drainage Dept',
      avgResolutionHours: 36,
    },
    {
      id: 'infrastructure',
      name: 'Public Infrastructure',
      description: 'Damaged bus stops, broken public bridges, vandalized signs, railing hazards',
      iconName: 'Building2',
      color: '#4A5568',
      defaultDepartment: 'Urban Infrastructure Authority',
      avgResolutionHours: 96,
    },
    {
      id: 'parks',
      name: 'Parks & Recreation',
      description: 'Broken playground equipment, fallen branches, damaged benches, overgrown weeds',
      iconName: 'Trees',
      color: '#38A169',
      defaultDepartment: 'Horticulture & Parks Dept',
      avgResolutionHours: 48,
    },
    {
      id: 'electricity',
      name: 'Public Electricity Issues',
      description: 'Hanging electric wires, smoking transformer, damaged junction box',
      iconName: 'Zap',
      color: '#E53E3E',
      defaultDepartment: 'Electricity Grid Operations',
      avgResolutionHours: 8,
    },
    {
      id: 'other',
      name: 'Other Civic Issues',
      description: 'Stray animal hazards, noise complaints, public safety obstructions',
      iconName: 'AlertCircle',
      color: '#718096',
      defaultDepartment: 'Municipal Civic Helpdesk',
      avgResolutionHours: 48,
    },
  ];

  // ZERO dummy business data
  const activities: any[] = [];
  const issues: DbIssue[] = [];
  const notifications: DbNotification[] = [];

  return { users, issues, organizations, categories, activities, notifications };
}

// Load or initialize persistent database
let db: DatabaseSchema;
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
    if (!db.users || !Array.isArray(db.users)) {
      db = getInitialSeedDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } else {
      // Ensure arrays exist
      if (!Array.isArray(db.issues)) db.issues = [];
      if (!Array.isArray(db.activities)) db.activities = [];
      if (!Array.isArray(db.notifications)) db.notifications = [];
      if (!Array.isArray(db.organizations)) {
        db.organizations = getInitialSeedDatabase().organizations;
      }
      if (!Array.isArray(db.categories)) {
        db.categories = getInitialSeedDatabase().categories;
      }

      // Safe synchronization: Ensure all pre-provisioned administrators exist
      const initialSeed = getInitialSeedDatabase();
      let hasUpdates = false;
      for (const seedUser of initialSeed.users) {
        const existingIdx = db.users.findIndex((u) => u.email.toLowerCase() === seedUser.email.toLowerCase());
        if (existingIdx === -1) {
          db.users.push(seedUser);
          hasUpdates = true;
        } else {
          db.users[existingIdx].full_name = seedUser.full_name;
          db.users[existingIdx].role = seedUser.role;
          db.users[existingIdx].password_hash = seedUser.password_hash;
          db.users[existingIdx].is_active = true;
          hasUpdates = true;
        }
      }

      // Purge any legacy automatically assigned stock or unsplash avatars across existing accounts
      for (const user of db.users) {
        if (user.avatar_url && (user.avatar_url.includes('unsplash.com') || user.avatar_url.includes('images.unsplash'))) {
          user.avatar_url = undefined;
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      }
    }
  } else {
    db = getInitialSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('[DB] Error loading DB file, initializing fresh store:', err);
  db = getInitialSeedDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving database:', err);
  }
}

// Helpers
function sanitizeUser(user: DbUser) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function generateJwt(user: DbUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.full_name,
    org_id: user.organization_id,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

interface AuthenticatedRequest extends Request {
  user?: DbUser;
}

// JWT Authentication Middleware
function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication token is missing.' });
  }

  const token = authHeader.substring(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.users.find((u) => u.id === decoded.sub);
    if (!user) {
      return res.status(401).json({ detail: 'User associated with token no longer exists.' });
    }
    if (!user.is_active) {
      return res.status(403).json({ detail: 'User account is inactive.' });
    }
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ detail: 'Invalid or expired authentication token.' });
  }
}

// Role Authorization Middleware Factory
function requireRoles(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Authentication required.' });
    }
    // Super admin has access to everything
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        detail: `Access forbidden: User has role '${req.user.role}', required one of [${allowedRoles.join(', ')}].`,
      });
    }
    next();
  };
}

// Server-Side Validation Helpers
function validateFullNameServer(name?: string | null): { valid: boolean; error?: string } {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) {
    return { valid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters long.' };
  }
  if (trimmed.length > 60) {
    return { valid: false, error: 'Full name must not exceed 60 characters.' };
  }
  if (/\d/.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid full name. Numbers are not allowed.' };
  }
  const validCharsRegex = /^[a-zA-Z\u00C0-\u024F\s'.-]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid full name.' };
  }
  const alphaMatch = trimmed.match(/[a-zA-Z\u00C0-\u024F]/g);
  if (!alphaMatch || alphaMatch.length < 2) {
    return { valid: false, error: 'Please enter a valid full name.' };
  }
  return { valid: true };
}

function validateEmailServer(email?: string | null): { valid: boolean; error?: string; normalized?: string } {
  const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!trimmed) {
    return { valid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed) || trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return { valid: false, error: 'Enter a valid email address.' };
  }
  return { valid: true, normalized: trimmed };
}

function validateIndianPhoneServer(phone?: string | null, required = false): { valid: boolean; error?: string; normalized?: string } {
  const raw = typeof phone === 'string' ? phone.trim() : '';
  if (!raw) {
    if (required) {
      return { valid: false, error: 'Phone number is required.' };
    }
    return { valid: true, normalized: undefined };
  }
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  if (digits.length !== 10) {
    return { valid: false, error: 'Enter a valid 10-digit Indian mobile number.' };
  }
  if (!/^[6-9]/.test(digits)) {
    return { valid: false, error: 'Indian mobile numbers must start with 6, 7, 8, or 9.' };
  }
  return { valid: true, normalized: `+91${digits}` };
}

function validatePasswordServer(password?: string | null): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must contain at least 8 characters, including uppercase, lowercase, and a number.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasNumber) {
    return { valid: false, error: 'Password must contain at least 8 characters, including uppercase, lowercase, and a number.' };
  }
  return { valid: true };
}

function validateIndianPincodeServer(pincode?: string | null): { valid: boolean; error?: string; normalized?: string } {
  const trimmed = typeof pincode === 'string' ? pincode.trim() : '';
  if (!trimmed) {
    return { valid: false, error: 'Pincode is required for manual location.' };
  }
  const pincodeRegex = /^[1-9]\d{5}$/;
  if (!pincodeRegex.test(trimmed)) {
    return { valid: false, error: 'Enter a valid 6-digit Indian PIN code.' };
  }
  return { valid: true, normalized: trimmed };
}

// Helper to convert DbIssue to frontend CivicIssue format
function formatDbIssue(issue: DbIssue) {
  const isMap = issue.location_source === 'MAP' || (issue.latitude != null && issue.longitude != null);
  return {
    id: issue.id,
    trackingNumber: issue.tracking_number,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    priority: issue.priority,
    status: issue.status,
    location: {
      address: issue.address,
      city: issue.city || 'Metropolis City',
      state: issue.state,
      pincode: issue.pincode,
      postalCode: issue.pincode,
      landmark: issue.landmark,
      wardOrZone: issue.ward,
      area: issue.ward,
      location_source: issue.location_source || (isMap ? 'MAP' : 'MANUAL'),
      lat: issue.latitude,
      lng: issue.longitude,
      latitude: issue.latitude,
      longitude: issue.longitude,
    },
    images: issue.images || [],
    reporter: {
      id: issue.reporter_id,
      name: issue.reporter_name,
      email: issue.reporter_email,
      phone: issue.reporter_phone,
      avatar: issue.reporter_avatar,
      isAnonymous: issue.is_anonymous || false,
    },
    assignedWorker: issue.assigned_worker_id
      ? {
          id: issue.assigned_worker_id,
          name: issue.assigned_worker_name || 'Assigned Specialist',
          email: issue.assigned_worker_email || '',
          phone: issue.assigned_worker_phone || '',
          avatar: issue.assigned_worker_avatar || '',
          role: 'Municipal Field Specialist',
          department: issue.assigned_worker_department || issue.department,
          expertise: [],
          availability: 'busy',
          currentWorkload: 50,
          activeIssuesCount: 1,
          rating: 5.0,
          distanceKm: 1.0,
          completedTasks: 0,
        }
      : undefined,
    department: issue.department,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    resolvedAt: issue.resolved_at,
    estimatedResolutionDate: issue.estimated_resolution_date,
    upvotes: issue.upvotes_count || 0,
    userUpvoted: false,
    timeline: issue.timeline || [],
    comments: issue.comments || [],
    resolutionProof: issue.proof_images?.length
      ? {
          images: issue.proof_images,
          summary: issue.resolution_summary || 'Incident resolved.',
          resolvedDate: issue.resolved_at || new Date().toISOString(),
          workerNotes: issue.worker_notes || '',
        }
      : undefined,
    feedbackRating: issue.feedback_rating,
  };
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check probe
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'CivicPulse Full-Stack Authentication & Gateway',
      environment: process.env.NODE_ENV || 'development',
      activeUsers: db.users.length,
      totalIssues: db.issues.length,
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // REAL AUTHENTICATION ROUTES (/auth & /api/v1/auth)
  // ==========================================

  const authRouter = express.Router();

  // Citizen Self-Registration
  const handleCitizenRegistration = (req: Request, res: Response) => {
    try {
      const { email, password, fullName, full_name, phone, role } = req.body;

      // Role security: public signup MUST only create CITIZEN role
      if (role && role !== 'CITIZEN') {
        return res.status(403).json({ detail: 'Arbitrary role selection is forbidden during citizen registration.' });
      }

      const userName = (fullName || full_name || '').trim();
      const nameVal = validateFullNameServer(userName);
      if (!nameVal.valid) {
        return res.status(400).json({ detail: nameVal.error });
      }

      const emailVal = validateEmailServer(email);
      if (!emailVal.valid || !emailVal.normalized) {
        return res.status(400).json({ detail: emailVal.error });
      }
      const cleanEmail = emailVal.normalized;

      const passVal = validatePasswordServer(password);
      if (!passVal.valid) {
        return res.status(400).json({ detail: passVal.error });
      }

      const phoneVal = validateIndianPhoneServer(phone, false);
      if (!phoneVal.valid) {
        return res.status(400).json({ detail: phoneVal.error });
      }
      const userPhone = phoneVal.normalized;

      const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ detail: 'An account with this email already exists.' });
      }

      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(password, salt);

      const newUser: DbUser = {
        id: `u-cit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: cleanEmail,
        password_hash,
        full_name: userName,
        phone: userPhone,
        role: 'CITIZEN', // STRICT CITIZEN
        points: 0,
        is_active: true,
        ward: 'Ward 14 - Central Metro',
        city: 'Metropolis City',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.users.push(newUser);
      saveDatabase();

      console.log(`[AUTH] New Citizen registered: ${newUser.email}`);
      const accessToken = generateJwt(newUser);

      return res.status(201).json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 86400,
        user_id: newUser.id,
        role: newUser.role,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar_url,
        ward: newUser.ward,
        city: newUser.city,
        points: newUser.points,
      });
    } catch (err: any) {
      console.error('[AUTH Register Citizen Error]:', err);
      return res.status(500).json({ detail: 'An unexpected server error occurred during registration.' });
    }
  };

  authRouter.post('/register', handleCitizenRegistration);
  authRouter.post('/register/citizen', handleCitizenRegistration);

  // Worker Self-Registration
  authRouter.post('/register/worker', (req: Request, res: Response) => {
    try {
      const { email, password, fullName, full_name, phone, specialization, skills, address, role } = req.body;

      if (role && role !== 'WORKER') {
        return res.status(403).json({ detail: 'Arbitrary role selection is forbidden during worker registration.' });
      }

      const userName = (fullName || full_name || '').trim();
      const nameVal = validateFullNameServer(userName);
      if (!nameVal.valid) {
        return res.status(400).json({ detail: nameVal.error });
      }

      const emailVal = validateEmailServer(email);
      if (!emailVal.valid || !emailVal.normalized) {
        return res.status(400).json({ detail: emailVal.error });
      }
      const cleanEmail = emailVal.normalized;

      const passVal = validatePasswordServer(password);
      if (!passVal.valid) {
        return res.status(400).json({ detail: passVal.error });
      }

      const phoneVal = validateIndianPhoneServer(phone, true);
      if (!phoneVal.valid) {
        return res.status(400).json({ detail: phoneVal.error });
      }
      const userPhone = phoneVal.normalized;
      const userSpecialization = (specialization || '').trim();

      const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ detail: 'An account with this email already exists.' });
      }

      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(password, salt);

      const newUser: DbUser = {
        id: `u-wrk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: cleanEmail,
        password_hash,
        full_name: userName,
        phone: userPhone,
        role: 'WORKER', // STRICT WORKER
        department: userSpecialization || 'Field Operations Division',
        organization_id: 'org-dot',
        organization_name: 'Department of Transportation & Public Works',
        points: 0,
        is_active: true,
        ward: address ? address.trim() : 'Ward 1 - Municipal District',
        city: 'Metropolis City',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.users.push(newUser);
      saveDatabase();

      console.log(`[AUTH] New Field Worker registered: ${newUser.email}`);
      const accessToken = generateJwt(newUser);

      return res.status(201).json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 86400,
        user_id: newUser.id,
        role: newUser.role,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        department: newUser.department,
        organization_id: newUser.organization_id,
        organization_name: newUser.organization_name,
        avatar: newUser.avatar_url,
        ward: newUser.ward,
        city: newUser.city,
        points: newUser.points,
      });
    } catch (err: any) {
      console.error('[AUTH Register Worker Error]:', err);
      return res.status(500).json({ detail: 'An unexpected server error occurred during worker registration.' });
    }
  });

  // Login
  authRouter.post('/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !password) {
        return res.status(400).json({ detail: 'Please enter both email address and password.' });
      }

      const emailVal = validateEmailServer(cleanEmail);
      if (!emailVal.valid) {
        return res.status(400).json({ detail: emailVal.error });
      }

      const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return res.status(401).json({ detail: 'Invalid email address or password.' });
      }

      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ detail: 'Invalid email address or password.' });
      }

      if (!user.is_active) {
        return res.status(403).json({ detail: 'Account is currently disabled. Please contact administrator.' });
      }

      console.log(`[AUTH] User authenticated: ${user.email} (${user.role})`);
      const accessToken = generateJwt(user);

      return res.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 86400,
        user_id: user.id,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar_url,
        department: user.department,
        organization_id: user.organization_id,
        organization_name: user.organization_name,
        ward: user.ward,
        city: user.city,
        points: user.points,
        must_change_password: !!user.must_change_password,
        expertise: user.expertise,
        availability: user.availability,
      });
    } catch (err: any) {
      console.error('[AUTH Login Error]:', err);
      return res.status(500).json({ detail: 'An unexpected server error occurred during authentication.' });
    }
  });

  // Update Profile (Authenticated user)
  const handleProfileUpdate = (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ detail: 'Authentication required.' });
      }

      const { fullName, full_name, phone, avatar, avatar_url, ward, department, expertise, availability } = req.body;

      const userIndex = db.users.findIndex((u) => u.id === req.user!.id);
      if (userIndex === -1) {
        return res.status(404).json({ detail: 'User not found in system.' });
      }

      const targetUser = db.users[userIndex];

      const rawName = fullName !== undefined ? fullName : full_name;
      if (rawName !== undefined) {
        const nameVal = validateFullNameServer(rawName);
        if (!nameVal.valid) {
          return res.status(400).json({ detail: nameVal.error });
        }
        targetUser.full_name = rawName.trim();
      }

      if (phone !== undefined) {
        const phoneVal = validateIndianPhoneServer(phone, false);
        if (!phoneVal.valid) {
          return res.status(400).json({ detail: phoneVal.error });
        }
        targetUser.phone = phoneVal.normalized;
      }

      if (avatar !== undefined || avatar_url !== undefined) {
        const chosenAvatar = avatar !== undefined ? avatar : avatar_url;
        targetUser.avatar_url = chosenAvatar && chosenAvatar.trim().length > 0 ? chosenAvatar.trim() : undefined;
      }

      if (ward !== undefined && targetUser.role === 'CITIZEN') {
        targetUser.ward = ward.trim();
      }

      if (targetUser.role === 'WORKER') {
        if (department !== undefined) targetUser.department = department.trim();
        if (expertise !== undefined && Array.isArray(expertise)) targetUser.expertise = expertise;
        if (availability !== undefined) targetUser.availability = availability;
      }

      targetUser.updated_at = new Date().toISOString();
      saveDatabase();

      console.log(`[AUTH] Profile updated for: ${targetUser.email} (${targetUser.role})`);
      return res.json(sanitizeUser(targetUser));
    } catch (err: any) {
      console.error('[AUTH Profile Update Error]:', err);
      return res.status(500).json({ detail: 'An unexpected error occurred while saving profile changes.' });
    }
  };

  authRouter.patch('/profile', authenticateJwt, handleProfileUpdate);
  authRouter.put('/profile', authenticateJwt, handleProfileUpdate);

  // Change Password (Forces or updates user password)
  authRouter.post('/change-password', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ detail: 'Authentication required.' });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      const passVal = validatePasswordServer(newPassword);
      if (!passVal.valid) {
        return res.status(400).json({ detail: passVal.error });
      }

      if (confirmPassword && newPassword !== confirmPassword) {
        return res.status(400).json({ detail: 'New passwords do not match.' });
      }

      const userIndex = db.users.findIndex((u) => u.id === req.user!.id);
      if (userIndex === -1) {
        return res.status(404).json({ detail: 'User not found.' });
      }

      const user = db.users[userIndex];

      // If user had a temporary password or must change password, currentPassword validation is optional if matching
      if (currentPassword) {
        const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!isMatch) {
          return res.status(400).json({ detail: 'Current temporary or previous password is incorrect.' });
        }
      }

      const salt = bcrypt.genSaltSync(10);
      user.password_hash = bcrypt.hashSync(newPassword, salt);
      user.must_change_password = false;
      user.updated_at = new Date().toISOString();

      saveDatabase();
      console.log(`[AUTH] Password changed successfully for: ${user.email}`);

      return res.json({
        success: true,
        message: 'Password has been changed successfully. You can now access your dashboard.',
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('[AUTH Change Password Error]:', err);
      return res.status(500).json({ detail: 'An unexpected error occurred while changing password.' });
    }
  });

  // Super Admin: Create Organization Admin with Temporary Password
  const handleCreateOrgAdmin = (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fullName, full_name, email, phone, organizationId, organizationName, organization_name, department, ward, password } = req.body;

      const userName = (fullName || full_name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!userName || userName.length < 2) {
        return res.status(400).json({ detail: 'Please provide a valid full name for the Administrator.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return res.status(400).json({ detail: 'Please provide a valid official email address.' });
      }

      const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ detail: `An account with email '${cleanEmail}' already exists in CivicPulse.` });
      }

      // Generate secure temporary password if not provided
      const tempPassword = password && password.trim().length >= 8
        ? password.trim()
        : `Admin#${Math.random().toString(36).substring(2, 6).toUpperCase()}!${Math.floor(1000 + Math.random() * 9000)}`;

      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(tempPassword, salt);

      const newAdmin: DbUser = {
        id: `u-orgadm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: cleanEmail,
        password_hash,
        full_name: userName,
        phone: phone ? phone.trim() : '+1 (555) 311-0000',
        role: 'ORGANIZATION_ADMIN',
        department: department || 'Municipal Administration',
        organization_id: organizationId || 'org-metro-central',
        organization_name: organizationName || organization_name || 'Metropolis Municipal Operations',
        ward: ward || 'Ward 14 - Central Metro',
        city: 'Metropolis City',
        points: 500,
        is_active: true,
        must_change_password: true, // Requires password change upon first login
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.users.push(newAdmin);
      saveDatabase();

      console.log(`[AUTH] Super Admin created new Org Admin: ${newAdmin.email} with temporary password`);

      // Return the temporary password ONLY in this immediate response for the Super Admin to copy
      return res.status(201).json({
        success: true,
        user: sanitizeUser(newAdmin),
        temporaryPassword: tempPassword,
        message: 'Organization Administrator account provisioned successfully.',
      });
    } catch (err: any) {
      console.error('[AUTH Create Org Admin Error]:', err);
      return res.status(500).json({ detail: 'An unexpected server error occurred while creating admin.' });
    }
  };

  authRouter.post('/create-org-admin', authenticateJwt, requireRoles(['SUPER_ADMIN']), handleCreateOrgAdmin);

  // Me
  authRouter.get('/me', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Unauthenticated.' });
    }
    return res.json(sanitizeUser(req.user));
  });

  // Logout
  authRouter.post('/logout', (req: Request, res: Response) => {
    return res.json({ message: 'Successfully logged out of CivicPulse.' });
  });

  app.use('/auth', authRouter);
  app.use('/api/v1/auth', authRouter);

  // Super Admin shortcut route for org admin creation
  app.post('/api/v1/users/org-admin', authenticateJwt, requireRoles(['SUPER_ADMIN']), handleCreateOrgAdmin);

  // ==========================================
  // PROTECTED USER MANAGEMENT ROUTES
  // ==========================================

  // GET /api/v1/users (Admin / Super Admin)
  app.get(
    '/api/v1/users',
    authenticateJwt,
    requireRoles(['ORGANIZATION_ADMIN', 'SUPER_ADMIN']),
    (req: AuthenticatedRequest, res: Response) => {
      const sanitizedUsers = db.users.map((u) => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        organizationName: u.organization_name,
        department: u.department,
        ward: u.ward || 'Ward 14 - Central Metro',
        isActive: u.is_active,
        mustChangePassword: !!u.must_change_password,
        createdAt: u.created_at,
        impactPoints: u.points,
      }));
      res.json(sanitizedUsers);
    }
  );

  // PATCH /api/v1/users/:id/role (Super Admin)
  app.patch(
    '/api/v1/users/:id/role',
    authenticateJwt,
    requireRoles(['SUPER_ADMIN']),
    (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { role, department, organization_id, organization_name, is_active } = req.body;

      const userIndex = db.users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ detail: 'User not found.' });
      }

      if (role) db.users[userIndex].role = role;
      if (department !== undefined) db.users[userIndex].department = department;
      if (organization_id !== undefined) db.users[userIndex].organization_id = organization_id;
      if (organization_name !== undefined) db.users[userIndex].organization_name = organization_name;
      if (is_active !== undefined) db.users[userIndex].is_active = is_active;
      db.users[userIndex].updated_at = new Date().toISOString();

      saveDatabase();
      return res.json(sanitizeUser(db.users[userIndex]));
    }
  );

  // GET /api/v1/workers (Returns registered workers from database)
  app.get('/api/v1/workers', (req: Request, res: Response) => {
    const workerUsers = db.users.filter((u) => u.role === 'WORKER' && u.is_active);
    const workers = workerUsers.map((u) => {
      const activeCount = db.issues.filter(
        (i) => i.assigned_worker_id === u.id && i.status !== 'resolved' && i.status !== 'verified'
      ).length;
      const completedCount = db.issues.filter(
        (i) => i.assigned_worker_id === u.id && (i.status === 'resolved' || i.status === 'verified')
      ).length;

      return {
        id: u.id,
        name: u.full_name,
        avatar: u.avatar_url || '',
        role: 'Field Specialist',
        department: u.department || 'Transportation & Works',
        expertise: [u.department || 'General Maintenance'],
        phone: u.phone || '+1 (555) 311-0000',
        email: u.email,
        availability: activeCount > 3 ? 'busy' : 'available',
        currentWorkload: Math.min(100, activeCount * 25),
        activeIssuesCount: activeCount,
        rating: 5.0,
        distanceKm: 1.5,
        completedTasks: completedCount,
      };
    });
    res.json(workers);
  });

  // ==========================================
  // REAL ISSUES API ROUTES (/api/v1/issues)
  // ==========================================

  // GET /api/v1/issues
  app.get('/api/v1/issues', (req: Request, res: Response) => {
    const formatted = db.issues.map(formatDbIssue);
    res.json(formatted);
  });

  // POST /api/v1/issues
  app.post('/api/v1/issues', (req: Request, res: Response) => {
    try {
      const payload = req.body;

      // Validate Title
      const title = typeof payload.title === 'string' ? payload.title.trim() : '';
      if (!title) {
        return res.status(400).json({ detail: 'Issue title is required.' });
      }
      if (title.length < 5) {
        return res.status(400).json({ detail: 'Issue title must be at least 5 characters long.' });
      }
      if (title.length > 150) {
        return res.status(400).json({ detail: 'Issue title cannot exceed 150 characters.' });
      }

      // Validate Description
      const description = typeof payload.description === 'string' ? payload.description.trim() : '';
      if (!description) {
        return res.status(400).json({ detail: 'Issue description is required.' });
      }
      if (description.length < 10) {
        return res.status(400).json({ detail: 'Please provide a more detailed description (minimum 10 characters).' });
      }

      // Validate Category
      const category = typeof payload.category === 'string' ? payload.category.trim() : '';
      if (!category) {
        return res.status(400).json({ detail: 'Please select an issue category.' });
      }

      // Validate Priority
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const priority = validPriorities.includes(payload.priority) ? payload.priority : 'medium';

      // Location Handling & Validation
      const loc = payload.location || {};
      const isManual =
        loc.location_source === 'MANUAL' ||
        payload.location_source === 'MANUAL' ||
        (loc.lat == null && payload.latitude == null);

      let address = (loc.address || payload.address || '').trim();
      let city = (loc.city || payload.city || '').trim();
      let state = (loc.state || payload.state || '').trim();
      let pincode = (loc.pincode || loc.postalCode || payload.pincode || '').trim();
      let landmark = (loc.landmark || payload.landmark || '').trim() || undefined;
      let ward = (loc.wardOrZone || loc.ward || payload.ward || '').trim();

      let latitude: number | null = null;
      let longitude: number | null = null;
      let location_source: 'MAP' | 'MANUAL' = 'MAP';

      if (isManual) {
        location_source = 'MANUAL';
        if (!address) {
          return res.status(400).json({ detail: 'Address / Street Location is required.' });
        }
        if (address.length < 3) {
          return res.status(400).json({ detail: 'Address must be at least 3 characters.' });
        }
        if (!city) {
          return res.status(400).json({ detail: 'City is required for manual location.' });
        }
        if (!state) {
          return res.status(400).json({ detail: 'Please select a State / Union Territory.' });
        }
        const pinVal = validateIndianPincodeServer(pincode);
        if (!pinVal.valid || !pinVal.normalized) {
          return res.status(400).json({ detail: pinVal.error });
        }
        pincode = pinVal.normalized;
        if (!ward) {
          ward = `${city} - ${pincode}`;
        }
        latitude = null;
        longitude = null;
      } else {
        location_source = 'MAP';
        if (!address) {
          return res.status(400).json({ detail: 'Address or map location is required.' });
        }
        const rawLat = loc.lat ?? loc.latitude ?? payload.latitude;
        const rawLng = loc.lng ?? loc.longitude ?? payload.longitude;
        latitude = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : 28.6139;
        longitude = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 77.209;
        if (!city) city = 'Metropolis City';
        if (!ward) ward = 'Ward 14 - Central Metro';
      }

      const trackingNumber = `CP-${new Date().getFullYear()}-${1000 + db.issues.length + 1}`;
      const issueId = `issue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newIssue: DbIssue = {
        id: issueId,
        tracking_number: trackingNumber,
        title,
        description,
        category,
        priority,
        status: 'reported',
        address,
        city,
        state: state || undefined,
        pincode: pincode || undefined,
        landmark,
        ward,
        location_source,
        latitude,
        longitude,
        reporter_id: payload.reporter?.id || payload.reporter_id || 'anonymous',
        reporter_name: payload.reporter?.name || payload.reporter_name || 'Citizen Reporter',
        reporter_email: payload.reporter?.email || payload.reporter_email || '',
        reporter_phone: payload.reporter?.phone || payload.reporter_phone,
        reporter_avatar: payload.reporter?.avatar,
        is_anonymous: payload.reporter?.isAnonymous || false,
        department: payload.department || 'Municipal Works',
        organization_id: payload.organization_id || 'org-dot',
        images: payload.images || [],
        proof_images: [],
        upvotes_count: 0,
        upvoted_user_ids: [],
        timeline: [
          {
            id: `t-${Date.now()}-1`,
            status: 'reported',
            title: 'Report Submitted',
            description: 'Incident ticket received into municipal queue.',
            timestamp: new Date().toISOString(),
            performedBy: {
              name: payload.reporter?.name || 'Citizen Reporter',
              role: 'Citizen',
            },
          },
        ],
        comments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.issues.unshift(newIssue);

      // Create activity
      const activity = {
        id: `act-${Date.now()}`,
        type: 'report',
        title: `New issue reported in ${newIssue.ward}`,
        description: `#${newIssue.tracking_number}: ${newIssue.title}`,
        timestamp: new Date().toISOString(),
        issueId: newIssue.id,
        category: newIssue.category,
        priority: newIssue.priority,
      };
      db.activities.unshift(activity);
      if (db.activities.length > 50) db.activities.pop();

      // Create notification
      const notif: DbNotification = {
        id: `notif-${Date.now()}`,
        title: 'New Issue Logged',
        message: `Report "${newIssue.title}" submitted under #${newIssue.tracking_number}`,
        type: 'status_change',
        read: false,
        target_user_id: newIssue.reporter_id,
        issue_id: newIssue.id,
        issue_tracking_number: newIssue.tracking_number,
        created_at: new Date().toISOString(),
      };
      db.notifications.unshift(notif);

      saveDatabase();

      const formatted = formatDbIssue(newIssue);

      return res.status(201).json(formatted);
    } catch (err: any) {
      console.error('[POST /api/v1/issues Error]:', err);
      return res.status(500).json({ detail: 'Failed to create issue report.' });
    }
  });

  // GET /api/v1/issues/:id
  app.get('/api/v1/issues/:id', (req: Request, res: Response) => {
    const rawId = req.params.id || '';
    const needle = rawId.toLowerCase();
    const issue = db.issues.find(
      (i) => i.id.toLowerCase() === needle || (i.tracking_number && i.tracking_number.toLowerCase() === needle)
    );
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found.' });
    }
    return res.json(formatDbIssue(issue));
  });

  // PATCH /api/v1/issues/:id (Update status / assign worker / resolve)
  app.patch('/api/v1/issues/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const needle = (id || '').toLowerCase();
    const issueIdx = db.issues.findIndex(
      (i) => i.id.toLowerCase() === needle || (i.tracking_number && i.tracking_number.toLowerCase() === needle)
    );
    if (issueIdx === -1) {
      return res.status(404).json({ detail: 'Issue not found.' });
    }

    const current = db.issues[issueIdx];
    const {
      status,
      assignedWorkerId,
      assignedWorkerName,
      assignedWorkerEmail,
      assignedWorkerDepartment,
      assignedWorkerAvatar,
      remarks,
      proofImages,
      resolutionSummary,
      workerNotes,
      updatedBy,
    } = req.body;

    const oldStatus = current.status;

    if (status) {
      current.status = status;
      if (status === 'resolved' || status === 'verified') {
        current.resolved_at = new Date().toISOString();
      }
    }

    if (assignedWorkerId) {
      current.assigned_worker_id = assignedWorkerId;
      current.assigned_worker_name = assignedWorkerName || current.assigned_worker_name;
      current.assigned_worker_email = assignedWorkerEmail || current.assigned_worker_email;
      current.assigned_worker_department = assignedWorkerDepartment || current.assigned_worker_department;
      current.assigned_worker_avatar = assignedWorkerAvatar || current.assigned_worker_avatar;
      if (current.status === 'reported' || current.status === 'under_review') {
        current.status = 'assigned';
      }
    }

    if (proofImages && Array.isArray(proofImages)) {
      current.proof_images = proofImages;
    }
    if (resolutionSummary) {
      current.resolution_summary = resolutionSummary;
    }
    if (workerNotes) {
      current.worker_notes = workerNotes;
    }

    current.updated_at = new Date().toISOString();

    // Append timeline event
    current.timeline.push({
      id: `t-${Date.now()}`,
      status: current.status,
      title:
        status === 'resolved'
          ? 'Issue Resolved'
          : status === 'in_progress'
          ? 'Work in Progress'
          : assignedWorkerId
          ? 'Worker Dispatched'
          : `Status Updated to ${current.status}`,
      description: remarks || workerNotes || `Updated by ${updatedBy || 'Municipal Staff'}`,
      timestamp: new Date().toISOString(),
      performedBy: {
        name: updatedBy || 'Municipal Operations',
        role: 'Operations',
      },
      attachments: proofImages,
    });

    // Create activity
    const isResolved = current.status === 'resolved' || current.status === 'verified';
    const activity = {
      id: `act-${Date.now()}`,
      type: isResolved ? 'resolved' : assignedWorkerId ? 'dispatch' : 'status',
      title: isResolved
        ? `Issue #${current.tracking_number} marked as Resolved`
        : assignedWorkerId
        ? `${current.assigned_worker_name || 'Worker'} assigned to #${current.tracking_number}`
        : `Issue #${current.tracking_number} changed to ${current.status}`,
      description: remarks || workerNotes || `Status updated`,
      timestamp: new Date().toISOString(),
      issueId: current.id,
    };
    db.activities.unshift(activity);
    if (db.activities.length > 50) db.activities.pop();

    // Create notification for reporter
    const notif: DbNotification = {
      id: `notif-${Date.now()}`,
      title: isResolved ? 'Report Resolved' : 'Report Update',
      message: `Your report #${current.tracking_number} is now ${current.status.replace('_', ' ')}.`,
      type: isResolved ? 'resolved' : 'status_change',
      read: false,
      target_user_id: current.reporter_id,
      issue_id: current.id,
      issue_tracking_number: current.tracking_number,
      created_at: new Date().toISOString(),
    };
    db.notifications.unshift(notif);

    saveDatabase();

    const formatted = formatDbIssue(current);

    return res.json(formatted);
  });

  // POST /api/v1/issues/:id/upvote
  app.post('/api/v1/issues/:id/upvote', (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;
    const issue = db.issues.find((i) => i.id === id || i.tracking_number === id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found.' });
    }

    if (!issue.upvoted_user_ids) issue.upvoted_user_ids = [];
    const uid = userId || 'anonymous';
    const existsIdx = issue.upvoted_user_ids.indexOf(uid);

    if (existsIdx === -1) {
      issue.upvoted_user_ids.push(uid);
      issue.upvotes_count = (issue.upvotes_count || 0) + 1;
    } else {
      issue.upvoted_user_ids.splice(existsIdx, 1);
      issue.upvotes_count = Math.max(0, (issue.upvotes_count || 0) - 1);
    }

    saveDatabase();
    return res.json({ upvotes: issue.upvotes_count, userUpvoted: existsIdx === -1 });
  });

  // POST /api/v1/issues/:id/comments
  app.post('/api/v1/issues/:id/comments', (req: Request, res: Response) => {
    const { id } = req.params;
    const issue = db.issues.find((i) => i.id === id || i.tracking_number === id);
    if (!issue) {
      return res.status(404).json({ detail: 'Issue not found.' });
    }

    const { content, author, isInternal, attachments } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ detail: 'Comment content cannot be empty.' });
    }

    const newComment = {
      id: `comm-${Date.now()}`,
      author: author || {
        id: 'anon',
        name: 'Citizen',
        role: 'citizen' as const,
      },
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isInternal: !!isInternal,
      attachments: attachments || [],
    };

    if (!issue.comments) issue.comments = [];
    issue.comments.push(newComment);
    saveDatabase();

    return res.status(201).json(newComment);
  });

  // DELETE /api/v1/issues/:id
  app.delete(
    '/api/v1/issues/:id',
    authenticateJwt,
    requireRoles(['ORGANIZATION_ADMIN', 'SUPER_ADMIN']),
    (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const idx = db.issues.findIndex((i) => i.id === id);
      if (idx === -1) {
        return res.status(404).json({ detail: 'Issue not found.' });
      }
      db.issues.splice(idx, 1);
      saveDatabase();
      return res.json({ message: 'Issue removed.' });
    }
  );

  // ==========================================
  // ORGANIZATIONS & CATEGORIES API
  // ==========================================

  // GET /api/v1/organizations
  app.get('/api/v1/organizations', (req: Request, res: Response) => {
    const orgs = (db.organizations || []).map((org) => {
      const orgWorkers = db.users.filter((u) => u.organization_id === org.id && u.role === 'WORKER').length;
      const orgIssues = db.issues.filter((i) => i.organization_id === org.id || i.department === org.name).length;
      const resolvedOrgIssues = db.issues.filter(
        (i) => (i.organization_id === org.id || i.department === org.name) && (i.status === 'resolved' || i.status === 'verified')
      ).length;
      const slaRate = orgIssues > 0 ? Number(((resolvedOrgIssues / orgIssues) * 100).toFixed(1)) : 100.0;

      return {
        ...org,
        activeWorkersCount: orgWorkers,
        totalIssuesHandled: orgIssues,
        slaComplianceRate: slaRate,
      };
    });
    res.json(orgs);
  });

  // POST /api/v1/organizations (Super Admin)
  app.post(
    '/api/v1/organizations',
    authenticateJwt,
    requireRoles(['SUPER_ADMIN']),
    (req: AuthenticatedRequest, res: Response) => {
      const { name, code, type, jurisdictionWard, contactEmail, contactPhone } = req.body;
      if (!name || !code) {
        return res.status(400).json({ detail: 'Name and code are required.' });
      }
      const newOrg = {
        id: `org-${Date.now()}`,
        name,
        code,
        type: type || 'Municipal Department',
        jurisdictionWard: jurisdictionWard || 'All Metro Wards (1-18)',
        contactEmail: contactEmail || `ops@${code.toLowerCase()}.gov`,
        contactPhone: contactPhone || '+1 (555) 311-0000',
        activeWorkersCount: 0,
        totalIssuesHandled: 0,
        slaComplianceRate: 100.0,
        status: 'active',
      };
      db.organizations.push(newOrg);
      saveDatabase();
      return res.status(201).json(newOrg);
    }
  );

  // GET /api/v1/categories
  app.get('/api/v1/categories', (req: Request, res: Response) => {
    res.json(db.categories || []);
  });

  // ==========================================
  // NOTIFICATIONS & ACTIVITIES API
  // ==========================================

  // GET /api/v1/notifications
  app.get('/api/v1/notifications', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    let notifs = db.notifications || [];
    if (userId) {
      notifs = notifs.filter((n) => !n.target_user_id || n.target_user_id === userId);
    }
    const formatted = notifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.created_at,
      issueId: n.issue_id,
      issueTrackingNumber: n.issue_tracking_number,
    }));
    res.json(formatted);
  });

  // PATCH /api/v1/notifications/:id/read
  app.patch('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
    const notif = (db.notifications || []).find((n) => n.id === req.params.id);
    if (notif) {
      notif.read = true;
      saveDatabase();
    }
    res.json({ status: 'ok' });
  });

  // PATCH /api/v1/notifications/read-all
  app.patch('/api/v1/notifications/read-all', (req: Request, res: Response) => {
    (db.notifications || []).forEach((n) => {
      n.read = true;
    });
    saveDatabase();
    res.json({ status: 'ok' });
  });

  // GET /api/activities
  app.get('/api/activities', (req: Request, res: Response) => {
    res.json({ activities: db.activities || [] });
  });

  // ==========================================
  // REAL-TIME ANALYTICS (CALCULATED FROM DB)
  // ==========================================

  // GET /api/v1/analytics
  app.get('/api/v1/analytics', (req: Request, res: Response) => {
    const totalIssues = db.issues.length;
    const resolvedIssues = db.issues.filter((i) => i.status === 'resolved' || i.status === 'verified').length;
    const inProgressIssues = db.issues.filter((i) => i.status === 'in_progress' || i.status === 'assigned').length;
    const pendingIssues = db.issues.filter((i) => i.status === 'reported' || i.status === 'under_review').length;

    const resolutionRate = totalIssues > 0 ? Number(((resolvedIssues / totalIssues) * 100).toFixed(1)) : 0;

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    db.issues.forEach((i) => {
      categoryMap[i.category] = (categoryMap[i.category] || 0) + 1;
    });

    const categoryBreakdown = Object.keys(categoryMap).map((k) => ({
      category: k,
      count: categoryMap[k],
    }));

    // Ward breakdown
    const wardMap: Record<string, { total: number; resolved: number }> = {};
    db.issues.forEach((i) => {
      const ward = i.ward || 'Ward 14';
      if (!wardMap[ward]) wardMap[ward] = { total: 0, resolved: 0 };
      wardMap[ward].total += 1;
      if (i.status === 'resolved' || i.status === 'verified') {
        wardMap[ward].resolved += 1;
      }
    });

    const wardBreakdown = Object.keys(wardMap).map((k) => ({
      ward: k,
      issues: wardMap[k].total,
      resolved: wardMap[k].resolved,
    }));

    res.json({
      totalReports: totalIssues,
      resolved: resolvedIssues,
      inProgress: inProgressIssues,
      pending: pendingIssues,
      resolutionRate,
      averageResolutionHours: 0,
      totalRegisteredUsers: db.users.length,
      totalWorkers: db.users.filter((u) => u.role === 'WORKER').length,
      totalCitizens: db.users.filter((u) => u.role === 'CITIZEN').length,
      totalOrgAdmins: db.users.filter((u) => u.role === 'ORGANIZATION_ADMIN').length,
      totalSuperAdmins: db.users.filter((u) => u.role === 'SUPER_ADMIN').length,
      totalOrganizations: (db.organizations || []).length,
      categoryBreakdown,
      wardBreakdown,
    });
  });

  // ==========================================
  // MUNICIPAL ANNOUNCEMENTS REST API
  // ==========================================
  app.post('/api/v1/announcements', (req: Request, res: Response) => {
    const { title, message, priority, targetRole, targetWard, author } = req.body;
    if (!title || !message) {
      return res.status(400).json({ detail: 'Title and message are required.' });
    }

    const announcement: DbNotification = {
      id: `notif-announcement-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type: 'community_alert',
      target_role: targetRole || 'all',
      created_at: new Date().toISOString(),
      read: false,
    };

    const activity = {
      id: `act-${Date.now()}`,
      type: 'announcement',
      title: `Announcement: ${announcement.title}`,
      description: announcement.message,
      timestamp: new Date().toISOString(),
    };

    db.notifications.unshift(announcement);
    db.activities.unshift(activity);
    saveDatabase();

    return res.status(201).json({ status: 'ok', announcement, activity });
  });

  app.post('/api/v1/admin/announcements', (req: Request, res: Response) => {
    const { title, message, priority, targetRole, targetWard, author } = req.body;
    if (!title || !message) {
      return res.status(400).json({ detail: 'Title and message are required.' });
    }

    const announcement: DbNotification = {
      id: `notif-announcement-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type: 'community_alert',
      target_role: targetRole || 'all',
      created_at: new Date().toISOString(),
      read: false,
    };

    const activity = {
      id: `act-${Date.now()}`,
      type: 'announcement',
      title: `Announcement: ${announcement.title}`,
      description: announcement.message,
      timestamp: new Date().toISOString(),
    };

    db.notifications.unshift(announcement);
    db.activities.unshift(activity);
    saveDatabase();

    return res.status(201).json({ status: 'ok', announcement, activity });
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(` CivicPulse Production Gateway & Authentication API Active`);
    console.log(` Server listening on: http://0.0.0.0:${PORT}`);
    console.log(` REST Auto-Sync & Polling Active (Interval: 5s)`);
    console.log(` Auth APIs: POST /auth/login, POST /auth/register, GET /auth/me`);
    console.log(` Issues APIs: GET /api/v1/issues, POST /api/v1/issues, PATCH /api/v1/issues/:id`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CivicPulse Server:', err);
  process.exit(1);
});
