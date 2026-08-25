import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SessionExpiredPage: React.FC = () => {
  const { clearSessionExpired } = useAuth();
  const location = useLocation();
  const returnTo = (location.state as any)?.from?.pathname || '/dashboard';

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-fade-in text-center">
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-[#102A43] to-[#1A365D] p-8 text-white">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-[#F4B942] animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Security Session Expired
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            JWT token expiration policy for civic data protection
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed">
            Your authenticated session has timed out due to security inactivity or token expiry. Please re-authenticate to continue accessing the CivicPulse municipal hub.
          </p>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 text-left">
            <strong>Security Notice:</strong> All pending local changes and issue drafts have been safeguarded. Re-logging in will immediately return you to your previous page.
          </div>

          <Link
            to={`/login?redirect=${encodeURIComponent(returnTo)}`}
            onClick={() => clearSessionExpired()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2C7A7B] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Re-Authenticate with CivicPulse</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
