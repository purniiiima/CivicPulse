import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StandardRole } from '../../types';
import { AccessDeniedPage } from '../../pages/auth/AccessDeniedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: StandardRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isLoading, sessionExpired, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-[#2C7A7B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Verifying CivicPulse Security Credentials...
        </p>
      </div>
    );
  }

  if (sessionExpired) {
    return <Navigate to="/session-expired" state={{ from: location }} replace />;
  }

  if (requireAuth && (!isAuthenticated || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <AccessDeniedPage
        requiredRoles={allowedRoles}
        currentRole={user?.role || 'CITIZEN'}
      />
    );
  }

  return <>{children}</>;
};
