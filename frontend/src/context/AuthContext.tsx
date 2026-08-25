import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, StandardRole } from '../types';
import {
  authService,
  isTokenExpired,
  LoginPayload,
  normalizeRole,
  CitizenRegisterPayload,
  WorkerRegisterPayload,
} from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  register: (payload: CitizenRegisterPayload) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  registerCitizen: (payload: CitizenRegisterPayload) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  registerWorker: (payload: WorkerRegisterPayload) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  updateProfile: (payload: {
    fullName?: string;
    phone?: string;
    avatar?: string;
    ward?: string;
    department?: string;
    expertise?: string[];
    availability?: string;
  }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  changePassword: (payload: {
    currentPassword?: string;
    newPassword: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (roleOrRoles: StandardRole | StandardRole[] | string | string[]) => boolean;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return authService.getStoredUser();
  });

  const [token, setToken] = useState<string | null>(() => {
    return authService.getToken();
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  // Verify stored JWT and fetch fresh user profile on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      const existingToken = authService.getToken();

      if (existingToken) {
        if (isTokenExpired(existingToken)) {
          console.warn('[AUTH] Token expired, clearing session.');
          setSessionExpired(true);
          authService.clearSession();
          setUser(null);
          setToken(null);
        } else {
          try {
            const freshUser = await authService.getMe();
            if (freshUser) {
              setUser(freshUser);
              setToken(existingToken);
            } else {
              // Token was rejected by backend
              setUser(null);
              setToken(null);
            }
          } catch {
            // Keep stored user if backend temporary unavailable
          }
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    verifyAuth();

    // Check token expiration periodically every 60 seconds
    const interval = setInterval(() => {
      const currentToken = authService.getToken();
      if (currentToken && isTokenExpired(currentToken)) {
        console.warn('[AUTH] Periodic check: Token expired.');
        setSessionExpired(true);
        authService.clearSession();
        setUser(null);
        setToken(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      setIsLoading(true);
      const response = await authService.login(payload);
      setUser(response.user);
      setToken(response.tokens.accessToken);
      setSessionExpired(false);
      setIsLoading(false);
      return { success: true, user: response.user };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Authentication failed. Please check your email and password.',
      };
    }
  }, []);

  const registerCitizen = useCallback(async (payload: CitizenRegisterPayload) => {
    try {
      setIsLoading(true);
      const response = await authService.registerCitizen(payload);
      setUser(response.user);
      setToken(response.tokens.accessToken);
      setSessionExpired(false);
      setIsLoading(false);
      return { success: true, user: response.user };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Registration failed. Please check your information.',
      };
    }
  }, []);

  const registerWorker = useCallback(async (payload: WorkerRegisterPayload) => {
    try {
      setIsLoading(true);
      const response = await authService.registerWorker(payload);
      setUser(response.user);
      setToken(response.tokens.accessToken);
      setSessionExpired(false);
      setIsLoading(false);
      return { success: true, user: response.user };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Worker registration failed. Please check your information.',
      };
    }
  }, []);

  const register = useCallback(async (payload: CitizenRegisterPayload) => {
    return registerCitizen(payload);
  }, [registerCitizen]);

  const updateProfile = useCallback(
    async (payload: {
      fullName?: string;
      phone?: string;
      avatar?: string;
      ward?: string;
      department?: string;
      expertise?: string[];
      availability?: string;
    }) => {
      try {
        setIsLoading(true);
        const updatedUser = await authService.updateProfile(payload);
        setUser(updatedUser);
        setIsLoading(false);
        return { success: true, user: updatedUser };
      } catch (err: any) {
        setIsLoading(false);
        return {
          success: false,
          error: err.message || 'Failed to update user profile.',
        };
      }
    },
    []
  );

  const changePassword = useCallback(
    async (payload: {
      currentPassword?: string;
      newPassword: string;
      confirmPassword?: string;
    }) => {
      try {
        setIsLoading(true);
        const res = await authService.changePassword(payload);
        if (res.user) {
          setUser(res.user);
        } else if (user) {
          setUser({ ...user, mustChangePassword: false });
        }
        setIsLoading(false);
        return { success: true, message: res.message };
      } catch (err: any) {
        setIsLoading(false);
        return {
          success: false,
          error: err.message || 'Failed to change password. Please check your inputs.',
        };
      }
    },
    [user]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setToken(null);
    setIsLoading(false);
  }, []);

  // Real Database Role Checker
  const hasRole = useCallback(
    (roleOrRoles: StandardRole | StandardRole[] | string | string[]): boolean => {
      if (!user) return false;
      const userRole = normalizeRole(user.role);

      // Super Admin has universal access
      if (userRole === 'SUPER_ADMIN') return true;

      const rolesArray = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
      const normalizedAllowed = rolesArray.map((r) => normalizeRole(r));

      return normalizedAllowed.includes(userRole);
    },
    [user]
  );

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        sessionExpired,
        login,
        register,
        registerCitizen,
        registerWorker,
        updateProfile,
        changePassword,
        logout,
        hasRole,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
