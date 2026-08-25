import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  User,
  Wrench,
  Shield,
  Crown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDashboardPath } from '../../services/authService';
import { StandardRole } from '../../types';

interface RoleConfig {
  role: StandardRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  description: string;
  signupText?: string;
  signupUrl?: string;
  adminNotice?: string;
}

const ROLE_CONFIGS: Record<StandardRole, RoleConfig> = {
  CITIZEN: {
    role: 'CITIZEN',
    title: 'Citizen Portal Sign In',
    subtitle: 'Report local community issues, track civic repairs, and earn civic impact points.',
    badge: 'Public Access',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: User,
    description: 'Submit geo-tagged reports, upvote neighborhood concerns, and verify repair completions.',
    signupText: 'New Citizen? Create Account',
    signupUrl: '/signup?role=citizen',
  },
  WORKER: {
    role: 'WORKER',
    title: 'Field Worker Operations Sign In',
    subtitle: 'Access municipal work orders, GPS navigation to site, and resolution proof submission.',
    badge: 'Field Operations',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Wrench,
    description: 'Accept assigned field tasks, update repair progress, and upload resolution proof photos.',
    signupText: 'New Field Worker? Create Account',
    signupUrl: '/signup?role=worker',
  },
  ORGANIZATION_ADMIN: {
    role: 'ORGANIZATION_ADMIN',
    title: 'Organization Administrator Sign In',
    subtitle: 'Manage agency work queues, dispatch field teams, and analyze municipal resolution metrics.',
    badge: 'Pre-Provisioned Authority',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Shield,
    description: 'Triage reported issues, assign workers, monitor SLAs, and manage departmental performance.',
    adminNotice: 'Administrative accounts are provisioned by municipal authority. Self-registration is restricted.',
  },
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Admin Command Directorate',
    subtitle: 'Comprehensive municipal oversight, organization governance, and system-wide audits.',
    badge: 'Root Authority',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Crown,
    description: 'System-wide analytics, organization provisioning, user role management, and global audit logs.',
    adminNotice: 'Super Administrator accounts are provisioned via municipal root governance. Public registration is disabled.',
  },
};

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [selectedRole, setSelectedRole] = useState<StandardRole>(() => {
    const roleParam = searchParams.get('role')?.toUpperCase();
    if (roleParam === 'WORKER') return 'WORKER';
    if (roleParam === 'ADMIN' || roleParam === 'ORGANIZATION_ADMIN') return 'ORGANIZATION_ADMIN';
    if (roleParam === 'SUPER_ADMIN' || roleParam === 'SUPERADMIN') return 'SUPER_ADMIN';
    return 'CITIZEN';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: StandardRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login({ email: email.trim(), password, rememberMe });
    setIsSubmitting(false);

    if (res.success && res.user) {
      if (redirectParam) {
        navigate(redirectParam);
      } else {
        const dest = getRoleDashboardPath(res.user.role);
        navigate(dest);
      }
    } else {
      setErrorMessage(res.error || 'Invalid email address or password. Please verify your credentials.');
    }
  };

  const config = ROLE_CONFIGS[selectedRole];
  const IconComponent = config.icon;

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left / Main Form Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 flex flex-col justify-between animate-fade-in">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2C7A7B] to-[#319795] flex items-center justify-center shadow-md ring-2 ring-teal-500/20">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-[#102A43]">
                    Civic<span className="text-[#F4B942]">Pulse</span>
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-none">
                    Municipal Authentication
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.badgeColor}`}>
                {config.badge}
              </span>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Sign in category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('CITIZEN')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'CITIZEN'
                      ? 'bg-white text-[#102A43] shadow-xs'
                      : 'text-slate-600 hover:text-[#102A43]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Citizen</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('WORKER')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'WORKER'
                      ? 'bg-white text-[#102A43] shadow-xs'
                      : 'text-slate-600 hover:text-[#102A43]'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Worker</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('ORGANIZATION_ADMIN')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'ORGANIZATION_ADMIN'
                      ? 'bg-white text-[#102A43] shadow-xs'
                      : 'text-slate-600 hover:text-[#102A43]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('SUPER_ADMIN')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'SUPER_ADMIN'
                      ? 'bg-white text-[#102A43] shadow-xs'
                      : 'text-slate-600 hover:text-[#102A43]'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-purple-600" />
                  <span>Super Admin</span>
                </button>
              </div>
            </div>

            {/* Portal Title & Subtitle */}
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <IconComponent className="w-5 h-5 text-[#2C7A7B]" />
                <h1 className="text-xl font-black tracking-tight text-[#102A43]">{config.title}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">{config.subtitle}</p>
            </div>

            {/* Admin Restriction Banner */}
            {config.adminNotice && (
              <div className="mb-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{config.adminNotice}</div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#102A43] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email address"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#102A43]">Password</label>
                  <span className="text-[11px] text-[#2C7A7B] font-medium hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2C7A7B] focus:ring-[#2C7A7B] border-slate-300"
                  />
                  <span className="text-xs text-slate-600">Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full mt-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#102A43] hover:bg-[#1A365D] text-white text-xs font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedRole.replace('_', ' ')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Action Links */}
          <div className="pt-4 mt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            {config.signupText && config.signupUrl ? (
              <div>
                <span>Don&apos;t have an account? </span>
                <Link
                  to={config.signupUrl}
                  className="font-bold text-[#2C7A7B] hover:text-[#102A43] hover:underline"
                >
                  {config.signupText} &rarr;
                </Link>
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px]">
                Administrative and command roles are provisioned internally by Municipal Operations.
              </div>
            )}
          </div>
        </div>

        {/* Right Info & Role Governance Overview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#102A43] via-[#1A365D] to-[#243B53] rounded-2xl shadow-xl p-6 sm:p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4B942] mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Municipal Access Control</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white mb-2">
              CivicPulse Platform Security
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Authorized municipal platform supporting community issue triage, field work order dispatch, and citywide infrastructure governance.
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-300 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Citizen Access</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Public registration allows residents to submit geo-tagged incident reports, track resolution progress, and verify completed civic repairs.
                </p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Field Operations</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Registered technicians receive dispatched assignments, navigate to service locations, and upload photo evidence of resolution.
                </p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Administrative Authority</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Pre-provisioned municipal accounts with role-based permissions for issue triage, SLA monitoring, and agency management.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure authentication with signed session tokens.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
