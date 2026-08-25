import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDashboardPath } from '../../services/authService';
import { StandardRole } from '../../types';

interface AccessDeniedPageProps {
  requiredRoles?: StandardRole[];
  currentRole?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  requiredRoles = ['ORGANIZATION_ADMIN', 'SUPER_ADMIN'],
  currentRole,
}) => {
  const { user, logout } = useAuth();

  const userRole = currentRole || user?.role || 'CITIZEN';
  const myDashboard = getRoleDashboardPath(userRole);

  const roleDisplayNames: Record<string, string> = {
    CITIZEN: 'Citizen Reporter',
    WORKER: 'Field Worker / Specialist',
    ORGANIZATION_ADMIN: 'Organization Administrator',
    SUPER_ADMIN: 'Super Administrator',
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-fade-in">
        {/* Top Danger Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center ring-4 ring-white/20 mb-3 shadow-inner">
            <ShieldAlert className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            403 - Access Restricted
          </h1>
          <p className="text-xs text-red-100 mt-1 max-w-md mx-auto font-medium">
            Role-Based Access Control (RBAC) Security Policy Enforced
          </p>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-200">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Current Authenticated Role:
              </span>
              <span className="font-bold px-2.5 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700 border border-red-200">
                {roleDisplayNames[userRole] || userRole}
              </span>
            </div>

            <div className="flex items-start justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">Required Clearance:</span>
              <div className="text-right">
                {requiredRoles.map((r) => (
                  <span
                    key={r}
                    className="inline-block font-semibold px-2 py-0.5 rounded-md text-[10px] bg-slate-200 text-slate-700 ml-1.5 mb-1"
                  >
                    {roleDisplayNames[r] || r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              Your account does not possess the administrative credentials or jurisdictional permissions required to access this endpoint or module.
            </p>
            <p className="text-slate-500">
              If you believe you should have access to this resource, please contact your municipal department supervisor or sign in with an authorized account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to={myDashboard}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#102A43] hover:bg-[#1A365D] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Return to My Dashboard</span>
            </Link>

            <Link
              to="/login"
              onClick={() => logout()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Different Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
