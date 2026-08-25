import { AuthUser, StandardRole, UserProfile } from '../types';

const TOKEN_KEY = 'civicpulse_access_token';
const USER_KEY = 'civicpulse_auth_user';
const REMEMBER_KEY = 'civicpulse_remember_me';

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface CitizenRegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}

export interface WorkerRegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
  specialization?: string;
  skills?: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface PasswordStrength {
  score: number; // 0 - 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

// Map case-insensitively to standard uppercase role
export function normalizeRole(role?: string): StandardRole {
  if (!role) return 'CITIZEN';
  const upper = role.toUpperCase();
  if (upper === 'ADMIN' || upper === 'ORGANIZATION_ADMIN' || upper === 'ORG_ADMIN') return 'ORGANIZATION_ADMIN';
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN';
  if (upper === 'WORKER') return 'WORKER';
  return 'CITIZEN';
}

// Convert UserProfile to AuthUser
export function profileToAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: normalizeRole(profile.role),
    phone: profile.phone,
    avatar: profile.avatar,
    department: profile.department,
    organizationId: profile.organizationId,
    organizationName: profile.organizationName,
    ward: profile.ward,
    city: profile.city,
    impactScore: profile.impactScore,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

// Role destination paths according to user role
export function getRoleDashboardPath(role: StandardRole | string): string {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'ORGANIZATION_ADMIN':
      return '/admin';
    case 'WORKER':
      return '/worker';
    case 'CITIZEN':
    default:
      return '/citizen';
  }
}

// Real-time password strength checker
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let criteriaMet = 0;
  if (hasMinLength) criteriaMet++;
  if (hasUppercase) criteriaMet++;
  if (hasLowercase) criteriaMet++;
  if (hasNumber) criteriaMet++;
  if (hasSpecialChar) criteriaMet++;

  let score = 0;
  let label: PasswordStrength['label'] = 'Very Weak';
  let color = 'bg-red-500';

  if (!password) {
    score = 0;
    label = 'Very Weak';
    color = 'bg-slate-300';
  } else if (criteriaMet <= 2 || password.length < 6) {
    score = 1;
    label = 'Weak';
    color = 'bg-red-500';
  } else if (criteriaMet === 3 || password.length < 8) {
    score = 2;
    label = 'Fair';
    color = 'bg-amber-500';
  } else if (criteriaMet === 4 && password.length >= 8) {
    score = 3;
    label = 'Good';
    color = 'bg-teal-500';
  } else if (criteriaMet === 5 && password.length >= 10) {
    score = 4;
    label = 'Strong';
    color = 'bg-emerald-500';
  } else {
    score = 3;
    label = 'Good';
    color = 'bg-teal-500';
  }

  return {
    score,
    label,
    color,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}

export function parseJwtPayload(token: string): { sub?: string; role?: string; exp?: number; email?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwtPayload(token);
    if (!payload || !payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const authService = {
  // Get stored token from local or session storage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  // Get stored auth user object
  getStoredUser(): AuthUser | null {
    const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  // Store token and user in storage
  saveSession(user: AuthUser, token: string, rememberMe = true): void {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(REMEMBER_KEY, 'true');
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(REMEMBER_KEY, 'false');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Clear session upon logout or expiration
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(REMEMBER_KEY);
  },

  // Public Citizen Registration (Strictly creates CITIZEN role in database)
  async registerCitizen(payload: CitizenRegisterPayload): Promise<AuthResponse> {
    const { fullName, email, phone, password, confirmPassword } = payload;

    // Client-side validation
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Please enter your full legal or display name (minimum 2 characters).');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new Error('Please provide a valid email address.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      throw new Error('Passwords do not match. Please re-type and confirm.');
    }

    const res = await fetch('/api/v1/auth/register/citizen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Registration failed. Please check your details.');
    }

    const role: StandardRole = normalizeRole(data.role || 'CITIZEN');

    const authUser: AuthUser = {
      id: data.user_id || data.id,
      name: data.full_name || fullName.trim(),
      email: data.email || email.trim().toLowerCase(),
      role, // STRICT CITIZEN ROLE
      phone: phone?.trim(),
      avatar: data.avatar || data.avatar_url || '',
      ward: data.ward || 'Ward 14 - Central Metro',
      city: data.city || 'Metropolis City',
      impactScore: data.points || 50,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in || 86400,
    };

    this.saveSession(authUser, tokens.accessToken, true);
    return { user: authUser, tokens };
  },

  // Public Worker Registration (Strictly creates WORKER role in database)
  async registerWorker(payload: WorkerRegisterPayload): Promise<AuthResponse> {
    const { fullName, email, phone, password, confirmPassword, specialization, skills, address } = payload;

    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Please enter your full legal or display name (minimum 2 characters).');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new Error('Please provide a valid email address.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      throw new Error('Passwords do not match. Please re-type and confirm.');
    }

    const res = await fetch('/api/v1/auth/register/worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        password,
        specialization: specialization?.trim(),
        skills: skills?.trim(),
        address: address?.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Worker registration failed. Please check your details.');
    }

    const role: StandardRole = normalizeRole(data.role || 'WORKER');

    const authUser: AuthUser = {
      id: data.user_id || data.id,
      name: data.full_name || fullName.trim(),
      email: data.email || email.trim().toLowerCase(),
      role, // STRICT WORKER ROLE
      phone: phone?.trim(),
      department: data.department || specialization || 'Field Operations Division',
      organizationId: data.organization_id || 'org-dot',
      organizationName: data.organization_name || 'Department of Transportation & Public Works',
      avatar: data.avatar || data.avatar_url || '',
      ward: data.ward || address || 'Ward 1 - Municipal District',
      city: data.city || 'Metropolis City',
      impactScore: data.points || 100,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in || 86400,
    };

    this.saveSession(authUser, tokens.accessToken, true);
    return { user: authUser, tokens };
  },

  // Generic register fallback (Citizen)
  async register(payload: CitizenRegisterPayload): Promise<AuthResponse> {
    return this.registerCitizen(payload);
  },

  // Real User Login: Connects to Backend & Database
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { email, password, rememberMe = true } = payload;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Please provide both email address and password.');
    }

    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Invalid email address or password.');
    }

    const role = normalizeRole(data.role || 'CITIZEN');
    const authUser: AuthUser = {
      id: data.user_id || data.id,
      name: data.full_name || data.name || cleanEmail.split('@')[0],
      email: data.email || cleanEmail,
      role,
      phone: data.phone,
      avatar: data.avatar || data.avatar_url,
      ward: data.ward || 'Ward 14 - Central Metro',
      city: data.city || 'Metropolis City',
      department: data.department,
      organizationId: data.organization_id || data.organizationId,
      organizationName: data.organization_name || data.organizationName,
      impactScore: data.points || data.impact_score || 0,
      isActive: true,
      mustChangePassword: !!data.must_change_password,
      expertise: data.expertise,
      availability: data.availability,
      createdAt: data.created_at || new Date().toISOString(),
    };

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in || 86400,
    };

    this.saveSession(authUser, tokens.accessToken, rememberMe);
    return { user: authUser, tokens };
  },

  // Get current authenticated user profile (/auth/me) with real JWT
  async getMe(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    if (isTokenExpired(token)) {
      this.clearSession();
      return null;
    }

    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const authUser: AuthUser = {
          id: data.id,
          name: data.full_name || data.name,
          email: data.email,
          role: normalizeRole(data.role),
          phone: data.phone,
          avatar: data.avatar_url || data.avatar,
          department: data.department,
          organizationId: data.organization_id,
          organizationName: data.organization_name,
          ward: data.ward,
          city: data.city,
          impactScore: data.points || data.impactScore || 0,
          isActive: data.is_active !== undefined ? data.is_active : true,
          mustChangePassword: !!data.must_change_password,
          expertise: data.expertise,
          availability: data.availability,
          createdAt: data.created_at || new Date().toISOString(),
        };
        // Update stored user cache
        const rememberMe = localStorage.getItem(REMEMBER_KEY) === 'true';
        this.saveSession(authUser, token, rememberMe);
        return authUser;
      } else if (res.status === 401 || res.status === 403) {
        this.clearSession();
        return null;
      }
    } catch {
      // Return cached user if network temporarily unavailable
    }

    return this.getStoredUser();
  },

  // Update authenticated user profile
  async updateProfile(payload: {
    fullName?: string;
    phone?: string;
    avatar?: string;
    ward?: string;
    department?: string;
    expertise?: string[];
    availability?: string;
  }): Promise<AuthUser> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication token required.');
    }

    const res = await fetch('/api/v1/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to update profile.');
    }

    const updatedUser: AuthUser = {
      id: data.id,
      name: data.full_name || data.name,
      email: data.email,
      role: normalizeRole(data.role),
      phone: data.phone,
      avatar: data.avatar_url || data.avatar,
      department: data.department,
      organizationId: data.organization_id,
      organizationName: data.organization_name,
      ward: data.ward,
      city: data.city,
      impactScore: data.points || 0,
      isActive: data.is_active !== undefined ? data.is_active : true,
      mustChangePassword: !!data.must_change_password,
      expertise: data.expertise,
      availability: data.availability,
      createdAt: data.created_at || new Date().toISOString(),
    };

    const rememberMe = localStorage.getItem(REMEMBER_KEY) === 'true';
    this.saveSession(updatedUser, token, rememberMe);
    return updatedUser;
  },

  // Change Password
  async changePassword(payload: {
    currentPassword?: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication token required.');
    }

    const res = await fetch('/api/v1/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to change password.');
    }

    if (data.user) {
      const updatedUser: AuthUser = {
        id: data.user.id,
        name: data.user.full_name || data.user.name,
        email: data.user.email,
        role: normalizeRole(data.user.role),
        phone: data.user.phone,
        avatar: data.user.avatar_url || data.user.avatar,
        department: data.user.department,
        organizationId: data.user.organization_id,
        organizationName: data.user.organization_name,
        ward: data.user.ward,
        city: data.user.city,
        impactScore: data.user.points || 0,
        isActive: data.user.is_active !== undefined ? data.user.is_active : true,
        mustChangePassword: false,
        expertise: data.user.expertise,
        availability: data.user.availability,
        createdAt: data.user.created_at || new Date().toISOString(),
      };
      const rememberMe = localStorage.getItem(REMEMBER_KEY) === 'true';
      this.saveSession(updatedUser, token, rememberMe);
      return { success: true, message: data.message, user: updatedUser };
    }

    return { success: true, message: data.message };
  },

  // Super Admin: Create Org Admin with Temporary Password
  async createOrgAdmin(payload: {
    fullName: string;
    email: string;
    phone?: string;
    organizationId?: string;
    organizationName?: string;
    department?: string;
    ward?: string;
    password?: string;
  }): Promise<{ user: any; temporaryPassword: string; message: string }> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin authentication token required.');
    }

    const res = await fetch('/api/v1/auth/create-org-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to create Organization Administrator.');
    }

    return {
      user: data.user,
      temporaryPassword: data.temporaryPassword,
      message: data.message,
    };
  },

  // Real backend logout
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    this.clearSession();
  },
};
