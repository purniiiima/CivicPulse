import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  Bell,
  User,
  ShieldAlert,
  Users,
  BarChart3,
  Settings,
  Briefcase,
  Layers,
  Wrench,
  Building2,
  Crown,
  LogOut,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { StandardRole } from '../../types';
import { normalizeRole } from '../../services/authService';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  highlight?: boolean;
  count?: number;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { unreadNotificationCount, issues } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const currentRole: StandardRole = user ? normalizeRole(user.role) : 'CITIZEN';

  const citizenNav: NavItem[] = [
    { name: 'Citizen Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Issue', to: '/report', icon: PlusCircle, highlight: true },
    {
      name: 'My Reports',
      to: '/my-reports',
      icon: FileText,
      count: issues.filter((i) => i.reporter.id === user?.id || i.reporter.email === user?.email).length,
    },
    { name: 'Nearby Issues', to: '/nearby', icon: MapPin },
    { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadNotificationCount },
    { name: 'Citizen Profile', to: '/profile', icon: User },
  ];

  const workerNav: NavItem[] = [
    { name: 'Field Task Board', to: '/worker', icon: LayoutDashboard },
    {
      name: 'Assigned Issues',
      to: '/worker/issues',
      icon: Wrench,
      count: issues.filter((i) => i.status === 'assigned' || i.status === 'in_progress').length,
    },
    { name: 'Field Map Overview', to: '/nearby', icon: MapPin },
    { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadNotificationCount },
    { name: 'Specialist Profile', to: '/worker/profile', icon: Award },
  ];

  const orgAdminNav: NavItem[] = [
    { name: 'Agency Overview', to: '/admin', icon: LayoutDashboard },
    { name: 'Issue Management', to: '/admin/issues', icon: ShieldAlert, count: issues.length },
    { name: 'Worker Dispatch', to: '/admin/assignments', icon: Briefcase },
    { name: 'Field Specialists', to: '/admin/workers', icon: Users },
    { name: 'Agency Analytics', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadNotificationCount },
    { name: 'Administrator Profile', to: '/admin/profile', icon: User },
    { name: 'Agency Settings', to: '/admin/settings', icon: Settings },
  ];

  const superAdminNav: NavItem[] = [
    { name: 'Metropolitan Hub', to: '/super-admin', icon: Crown },
    { name: 'Cross-Agency Issues', to: '/admin/issues', icon: ShieldAlert, count: issues.length },
    { name: 'Worker Dispatches', to: '/admin/assignments', icon: Briefcase },
    { name: 'User Directory (RBAC)', to: '/super-admin/users', icon: Users, highlight: true },
    { name: 'Municipal Agencies', to: '/super-admin/organizations', icon: Building2 },
    { name: 'Citywide Analytics', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadNotificationCount },
    { name: 'Super Admin Profile', to: '/super-admin/profile', icon: User },
    { name: 'Security & Governance', to: '/super-admin/settings', icon: Settings },
  ];

  let navItems = citizenNav;
  let sectionLabel = 'Citizen Portal';

  if (currentRole === 'SUPER_ADMIN') {
    navItems = superAdminNav;
    sectionLabel = 'Super Admin Directorate';
  } else if (currentRole === 'ORGANIZATION_ADMIN') {
    navItems = orgAdminNav;
    sectionLabel = 'Agency Operations';
  } else if (currentRole === 'WORKER') {
    navItems = workerNav;
    sectionLabel = 'Field Operations';
  }

  const handleLogout = async () => {
    await logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Card in Sidebar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#2C7A7B]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 ring-2 ring-teal-500/30 flex items-center justify-center text-slate-500">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#102A43] truncate">
                {user?.name || 'Authorized User'}
              </div>
              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    currentRole === 'SUPER_ADMIN'
                      ? 'bg-purple-500'
                      : currentRole === 'ORGANIZATION_ADMIN'
                      ? 'bg-blue-500'
                      : currentRole === 'WORKER'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-[10px] uppercase text-slate-700">{currentRole}</span>
              </div>
            </div>
          </div>

          {currentRole === 'CITIZEN' && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Civic Impact Score</span>
              <span className="font-bold text-[#2C7A7B] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {user?.impactScore || 120} pts
              </span>
            </div>
          )}

          {currentRole === 'WORKER' && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Service Ward</span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                {user?.ward || 'Ward 14'}
              </span>
            </div>
          )}

          {(currentRole === 'ORGANIZATION_ADMIN' || currentRole === 'SUPER_ADMIN') && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[10px] text-slate-500 truncate">
              {user?.organizationName || 'Metropolitan Governance Directorate'}
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {sectionLabel}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : item.highlight
                      ? 'bg-amber-50/80 text-amber-900 hover:bg-amber-100/80 border border-amber-200/60'
                      : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer with Logout button */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out Session</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

