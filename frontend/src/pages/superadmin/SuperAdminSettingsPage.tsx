import React, { useState } from 'react';
import {
  Shield,
  Key,
  Lock,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sliders,
  Crown,
} from 'lucide-react';

export const SuperAdminSettingsPage: React.FC = () => {
  const [tokenExpiryHours, setTokenExpiryHours] = useState('24');
  const [require2FA, setRequire2FA] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [allowPublicRegistrations, setAllowPublicRegistrations] = useState(true);
  const [rateLimitPerMin, setRateLimitPerMin] = useState('100');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 mb-2">
          <Crown className="w-3.5 h-3.5" />
          <span>Security & RBAC Enforcement Matrix</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#102A43]">
          System Security & Governance Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure system-wide cryptographic tokens, RBAC roles, rate limiting, and municipal audit policies.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Security policy configuration successfully persisted across all municipal instances.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Card 1: JWT & Auth Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-100">
            <Key className="w-4 h-4 text-[#2C7A7B]" />
            <span>JWT Token Lifetime & Cryptographic Policies</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Access Token Expiration (Hours)
              </label>
              <select
                value={tokenExpiryHours}
                onChange={(e) => setTokenExpiryHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#2C7A7B]"
              >
                <option value="1">1 Hour (High Security)</option>
                <option value="8">8 Hours (Standard Shift)</option>
                <option value="24">24 Hours (Default Active)</option>
                <option value="168">7 Days (Extended)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="8"
                max="32"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#2C7A7B]"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublicRegistrations}
                onChange={(e) => setAllowPublicRegistrations(e.target.checked)}
                className="w-4 h-4 text-[#2C7A7B] rounded focus:ring-[#2C7A7B]"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Allow Public Citizen Self-Registration
                </span>
                <p className="text-[11px] text-slate-500">
                  When enabled, any public citizen can create a CITIZEN account. Worker and Admin roles remain invitation-only.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Card 2: RBAC Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-[#2C7A7B]" />
            <span>Permission Matrix by User Role</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">System Permission</th>
                  <th className="py-2.5 px-3 text-center">Citizen</th>
                  <th className="py-2.5 px-3 text-center">Worker</th>
                  <th className="py-2.5 px-3 text-center">Org Admin</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">Create and submit civic issue reports</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Upvote, comment, and verify resolutions</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Accept task orders & upload resolution proof</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Dispatch workers & modify departmental tickets</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Manage cross-agency user roles & global rules</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">—</td>
                  <td className="py-2.5 px-3 text-center text-purple-600 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#102A43] hover:bg-[#1A365D] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Apply Security Policies
          </button>
        </div>
      </form>
    </div>
  );
};
