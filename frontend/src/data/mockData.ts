import { CategoryMetadata, CivicIssue, Notification, UserProfile, Worker } from '../types';

export const CATEGORIES: CategoryMetadata[] = [
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

// ZERO dummy workers - registered workers are fetched from backend PostgreSQL database
export const MOCK_WORKERS: Worker[] = [];

export const MOCK_CITIZEN: UserProfile = {
  id: 'guest-citizen',
  name: 'Citizen User',
  email: 'citizen@example.com',
  role: 'CITIZEN',
  phone: '',
  avatar: '',
  address: 'Central District',
  ward: 'Ward 14 - Central Metro',
  city: 'Metropolis City',
  impactScore: 0,
  reportsSubmitted: 0,
  reportsResolved: 0,
  badges: [],
};

export const MOCK_WORKER_USER: UserProfile = {
  id: 'guest-worker',
  name: 'Technician',
  email: 'worker@example.com',
  role: 'WORKER',
  phone: '',
  avatar: '',
  address: 'Field Operations Hub',
  ward: 'Ward 14 - Central Metro',
  city: 'Metropolis City',
  department: 'Electrical & Lighting Division',
  organizationId: 'org-dot',
  organizationName: 'Department of Transportation & Public Works',
  impactScore: 0,
  reportsSubmitted: 0,
  reportsResolved: 0,
  badges: [],
};

export const MOCK_ADMIN: UserProfile = {
  id: 'guest-admin',
  name: 'Agency Admin',
  email: 'admin@metropolis.gov',
  role: 'ORGANIZATION_ADMIN',
  phone: '',
  avatar: '',
  address: 'Civic Center, Dept of Public Operations',
  ward: 'Central Municipal HQ',
  city: 'Metropolis City',
  organizationId: 'org-dot',
  organizationName: 'Department of Transportation & Public Works',
  department: 'Transportation & Works',
  impactScore: 0,
  reportsSubmitted: 0,
  reportsResolved: 0,
  badges: [],
};

export const MOCK_SUPER_ADMIN: UserProfile = {
  id: 'guest-super',
  name: 'Super Admin',
  email: 'superadmin@civicpulse.gov',
  role: 'SUPER_ADMIN',
  phone: '',
  avatar: '',
  address: 'Metropolitan Governance Tower',
  ward: 'Executive City District',
  city: 'Metropolis City',
  organizationId: 'org-metro-central',
  organizationName: 'Metropolitan Municipal Authority',
  department: 'Citywide Governance Directorate',
  impactScore: 0,
  reportsSubmitted: 0,
  reportsResolved: 0,
  badges: [],
};

export const MOCK_ORGANIZATIONS = [
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
    status: 'active' as const,
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
    status: 'active' as const,
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
    status: 'active' as const,
  },
];

// ZERO dummy user accounts - real users come from GET /api/v1/users
export const MOCK_USER_ACCOUNTS: any[] = [];

// ZERO dummy issues - real issues start at empty [] and persist to PostgreSQL/backend DB
export const INITIAL_ISSUES: CivicIssue[] = [];

// ZERO dummy notifications - real notifications start at empty [] and are generated on real events
export const INITIAL_NOTIFICATIONS: Notification[] = [];
