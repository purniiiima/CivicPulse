import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Search,
  PlusCircle,
  Shield,
  User,
  Wrench,
  ChevronDown,
  Activity,
  Menu,
  CheckCheck,
  Crown,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { StandardRole } from '../../types';
import { getRoleDashboardPath, normalizeRole } from '../../services/authService';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    unreadNotificationCount,
    notifications,
    markAllNotificationsAsRead,
    filterText,
    setFilterText,
  } = useApp();

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLandingMenuOpen, setIsLandingMenuOpen] = useState(false);

  const currentRole: StandardRole = user ? normalizeRole(user.role) : 'CITIZEN';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filterText.trim()) {
      if (currentRole === 'ORGANIZATION_ADMIN' || currentRole === 'SUPER_ADMIN') {
        navigate('/admin/issues');
      } else if (currentRole === 'WORKER') {
        navigate('/worker/issues');
      } else {
        navigate('/my-reports');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const handleNavigateRoleDashboard = (role: StandardRole) => {
    setIsRoleMenuOpen(false);
    const targetPath = getRoleDashboardPath(role);
    navigate(targetPath);
  };

  const isLanding = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-[#102A43] text-white border-b border-[#243B53] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            {!isLanding && onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2C7A7B] to-[#319795] flex items-center justify-center shadow-md ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  Civic<span className="text-[#F4B942]">Pulse</span>
                </span>
                <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-300 font-semibold leading-none">
                  Municipal Resolution Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar */}
          {!isLanding ? (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Search by Tracking ID, street, keyword..."
                  className="w-full bg-[#1A365D] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all"
                />
              </form>
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#categories" className="hover:text-white transition-colors">
                Categories
              </a>
              <a href="#impact" className="hover:text-white transition-colors">
                Impact
              </a>
              <a href="#testimonials" className="hover:text-white transition-colors">
                Testimonials
              </a>
            </nav>
          )}

          {/* Right Actions & User Account Status */}
          <div className="flex items-center gap-2.5">
            {/* Quick Report CTA */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </Link>

            {/* Authenticated Role Badge & Role Dashboard Access */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1A365D] hover:bg-[#234E52] border border-slate-700 rounded-xl text-xs font-semibold text-white transition-colors shrink-0"
                  title="View Role & Switch Dashboard"
                >
                  {currentRole === 'SUPER_ADMIN' ? (
                    <Crown className="w-3.5 h-3.5 text-[#F4B942]" />
                  ) : currentRole === 'ORGANIZATION_ADMIN' ? (
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                  ) : currentRole === 'WORKER' ? (
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-teal-300" />
                  )}
                  <span className="hidden lg:inline capitalize">
                    {currentRole === 'SUPER_ADMIN'
                      ? 'Super Admin'
                      : currentRole === 'ORGANIZATION_ADMIN'
                      ? 'Org Admin'
                      : currentRole === 'WORKER'
                      ? 'Field Worker'
                      : 'Citizen'}
                  </span>
                  {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZATION_ADMIN') && (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                </button>

                {/* Role Navigation Dropdown for Privileged Roles */}
                {isRoleMenuOpen && (currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZATION_ADMIN') && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 text-xs animate-fade-in">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Authorized Views for {currentRole.replace('_', ' ')}
                    </div>

                    {currentRole === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleNavigateRoleDashboard('SUPER_ADMIN')}
                        className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <Crown className="w-4 h-4 text-[#F4B942] shrink-0" />
                        <div>
                          <div className="font-bold">Super Admin Dashboard</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            System-wide control & user management
                          </div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigateRoleDashboard('ORGANIZATION_ADMIN')}
                      className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold">Organization Admin</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Department triage & worker dispatching
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavigateRoleDashboard('WORKER')}
                      className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold">Field Worker Dashboard</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Work orders & completion proof
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavigateRoleDashboard('CITIZEN')}
                      className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <div className="font-bold">Citizen Portal</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Public reports & community dashboard
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Popover */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#102A43]">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown box */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#102A43]">Notifications</h4>
                        <span className="text-[10px] text-slate-500">
                          {unreadNotificationCount} unread alert{unreadNotificationCount === 1 ? '' : 's'}
                        </span>
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] text-[#2C7A7B] hover:text-[#102A43] font-semibold flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                              !notif.read ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="font-bold text-[#102A43]">{notif.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              {notif.message}
                            </p>
                            {notif.issueId && (
                              <Link
                                to={`/issues/${notif.issueId}`}
                                onClick={() => setIsNotifOpen(false)}
                                className="inline-block mt-1 text-[10px] font-bold text-[#2C7A7B] hover:underline"
                              >
                                View issue &rarr;
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setIsNotifOpen(false)}
                        className="text-xs font-semibold text-[#2C7A7B] hover:text-[#102A43]"
                      >
                        View all notification history &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar / User Menu Popover or Login / Sign Up */}
            {isAuthenticated && user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2C7A7B]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 ring-2 ring-teal-500/40 flex items-center justify-center text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="hidden xl:inline text-xs font-semibold text-white">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 text-xs animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-[#102A43] truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-100 text-teal-800 uppercase">
                          {currentRole}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={
                        currentRole === 'SUPER_ADMIN'
                          ? '/super-admin/profile'
                          : currentRole === 'ORGANIZATION_ADMIN'
                          ? '/admin/profile'
                          : currentRole === 'WORKER'
                          ? '/worker/profile'
                          : '/profile'
                      }
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Settings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 border-t border-slate-100 font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-[#1A365D] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex px-3 py-1.5 bg-[#2C7A7B] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl shadow-xs transition-all items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
                {isLanding && (
                  <button
                    type="button"
                    onClick={() => setIsLandingMenuOpen(!isLandingMenuOpen)}
                    className="sm:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                    aria-label="Toggle Landing Navigation"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Landing Page Mobile Dropdown Menu */}
      {isLanding && isLandingMenuOpen && (
        <div className="sm:hidden bg-[#0B1D30] border-t border-[#243B53] px-4 py-4 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-2 text-xs font-medium text-slate-200">
            <a
              href="#how-it-works"
              onClick={() => setIsLandingMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#categories"
              onClick={() => setIsLandingMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Problem Domains & SLA
            </a>
            <a
              href="#testimonials"
              onClick={() => setIsLandingMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Community Voices
            </a>
          </nav>
          <div className="pt-2 border-t border-slate-700/80 flex flex-col gap-2">
            <Link
              to="/signup"
              onClick={() => setIsLandingMenuOpen(false)}
              className="w-full py-2.5 bg-[#2C7A7B] text-white text-xs font-bold rounded-xl text-center shadow-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Free Citizen Account</span>
            </Link>
            <Link
              to="/login"
              onClick={() => setIsLandingMenuOpen(false)}
              className="w-full py-2 bg-[#1A365D] text-slate-200 text-xs font-bold rounded-xl text-center border border-slate-700"
            >
              Staff & Municipal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
