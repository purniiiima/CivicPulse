import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  ShieldAlert,
  BarChart3,
  User,
  Wrench,
  Crown,
  Users,
} from 'lucide-react';
import { StandardRole } from '../../types';
import { normalizeRole } from '../../services/authService';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const currentRole: StandardRole = user ? normalizeRole(user.role) : 'CITIZEN';

  if (currentRole === 'SUPER_ADMIN') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/super-admin"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Crown className="w-5 h-5" />
          <span>Directorate</span>
        </NavLink>

        <NavLink
          to="/super-admin/users"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/report"
          className="flex flex-col items-center -top-3 relative"
        >
          <div className="w-12 h-12 rounded-full bg-[#102A43] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <PlusCircle className="w-6 h-6 text-[#F4B942]" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Report</span>
        </NavLink>

        <NavLink
          to="/admin/issues"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <ShieldAlert className="w-5 h-5" />
          <span>Issues</span>
        </NavLink>

        <NavLink
          to="/super-admin/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    );
  }

  if (currentRole === 'ORGANIZATION_ADMIN') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/admin/issues"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <ShieldAlert className="w-5 h-5" />
          <span>Issues</span>
        </NavLink>

        <NavLink
          to="/report"
          className="flex flex-col items-center -top-3 relative"
        >
          <div className="w-12 h-12 rounded-full bg-[#102A43] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <PlusCircle className="w-6 h-6 text-[#F4B942]" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Report</span>
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    );
  }

  if (currentRole === 'WORKER') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/worker"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Task Board</span>
        </NavLink>

        <NavLink
          to="/worker/issues"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Wrench className="w-5 h-5" />
          <span>Assigned</span>
        </NavLink>

        <NavLink
          to="/nearby"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <MapPin className="w-5 h-5" />
          <span>Map Sites</span>
        </NavLink>

        <NavLink
          to="/worker/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
              isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Specialist</span>
        </NavLink>
      </div>
    );
  }

  // CITIZEN Default
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/my-reports"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <FileText className="w-5 h-5" />
        <span>My Reports</span>
      </NavLink>

      {/* Floating Center Report Button */}
      <NavLink
        to="/report"
        className="flex flex-col items-center -top-3 relative"
      >
        <div className="w-12 h-12 rounded-full bg-[#102A43] text-white flex items-center justify-center shadow-lg border-2 border-white">
          <PlusCircle className="w-6 h-6 text-[#F4B942]" />
        </div>
        <span className="text-[10px] font-bold text-slate-700 mt-0.5">Report</span>
      </NavLink>

      <NavLink
        to="/nearby"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <MapPin className="w-5 h-5" />
        <span>Nearby</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            isActive ? 'text-[#2C7A7B]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </NavLink>
    </div>
  );
};

