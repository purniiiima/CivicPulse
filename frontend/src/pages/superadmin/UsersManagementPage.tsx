import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Crown,
  Wrench,
  UserCheck,
  UserX,
  Edit2,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  X,
  Building2,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { StandardRole, UserAccountItem } from '../../types';
import { authService } from '../../services/authService';

export const UsersManagementPage: React.FC = () => {
  const [usersList, setUsersList] = useState<UserAccountItem[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit User / Reassign Role Modal state
  const [editingUser, setEditingUser] = useState<UserAccountItem | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<StandardRole>('CITIZEN');
  const [selectedNewOrg, setSelectedNewOrg] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // New User Creation Modal
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<StandardRole>('ORGANIZATION_ADMIN');
  const [newOrg, setNewOrg] = useState('Department of Transportation');
  const [newWard, setNewWard] = useState('Ward 14 - Central Metro');

  // Temporary Password Shown Once Modal
  const [provisionedCredentials, setProvisionedCredentials] = useState<{
    fullName: string;
    email: string;
    role: StandardRole;
    temporaryPassword: string;
    organizationName?: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = authService.getToken();

    fetch(`${API_BASE_URL}/api/v1/users`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setUsersList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/v1/organizations`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrganizations(data))
      .catch(() => {});
  }, []);

  const filteredUsers = usersList.filter((user) => {
    const matchSearch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.organizationName && user.organizationName.toLowerCase().includes(search.toLowerCase()));

    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleStatus = async (userId: string) => {
    const current = usersList.find((u) => u.id === userId);
    if (!current) return;
    const nextStatus = !current.isActive;

    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: nextStatus } : u))
    );

    try {
      const token = authService.getToken();
      await fetch(`/api/v1/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ is_active: nextStatus }),
      });
    } catch {}

    setFeedbackMsg('User status updated successfully.');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSaveRoleEdit = async () => {
    if (!editingUser) return;

    setUsersList((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              role: selectedNewRole,
              organizationName:
                selectedNewRole === 'CITIZEN' ? undefined : selectedNewOrg || u.organizationName,
            }
          : u
      )
    );

    try {
      const token = authService.getToken();
      await fetch(`/api/v1/users/${editingUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          role: selectedNewRole,
          organization_name: selectedNewRole === 'CITIZEN' ? null : selectedNewOrg,
        }),
      });
    } catch {}

    setEditingUser(null);
    setFeedbackMsg(`Role for ${editingUser.fullName} updated to ${selectedNewRole}.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;

    try {
      if (newRole === 'ORGANIZATION_ADMIN') {
        const res = await authService.createOrgAdmin({
          fullName: newFullName,
          email: newEmail,
          phone: newPhone,
          organizationName: newOrg,
          department: newOrg,
          ward: newWard,
        });

        const createdItem: UserAccountItem = {
          id: res.user?.id || `u-${Date.now()}`,
          fullName: newFullName,
          email: newEmail,
          phone: newPhone || '+1 (555) 311-0000',
          role: 'ORGANIZATION_ADMIN',
          organizationName: newOrg,
          ward: newWard,
          isActive: true,
          mustChangePassword: true,
          createdAt: new Date().toISOString(),
          impactPoints: 500,
        };

        setUsersList([createdItem, ...usersList]);
        setIsCreatingUser(false);

        // Show Temporary Password ONCE
        setProvisionedCredentials({
          fullName: newFullName,
          email: newEmail,
          role: 'ORGANIZATION_ADMIN',
          organizationName: newOrg,
          temporaryPassword: res.temporaryPassword,
        });

        setNewFullName('');
        setNewEmail('');
        setNewPhone('');
        return;
      } else if (newRole === 'WORKER') {
        await fetch(`${API_BASE_URL}/api/v1/auth/register/worker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newEmail,
            password: newPassword,
            full_name: newFullName,
            phone: newPhone,
            department: newOrg,
            specialization: newOrg,
          }),
        });
      } else if (newRole === 'CITIZEN') {
        await fetch(`${API_BASE_URL}/api/v1/auth/register/citizen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newEmail,
            password: newPassword,
            full_name: newFullName,
            phone: newPhone,
          }),
        });
      }

      const created: UserAccountItem = {
        id: `u-${Date.now()}`,
        fullName: newFullName,
        email: newEmail,
        phone: newPhone || '+1 (555) 000-0000',
        role: newRole,
        organizationName: newRole === 'CITIZEN' ? undefined : newOrg,
        ward: newWard,
        isActive: true,
        createdAt: new Date().toISOString(),
        impactPoints: newRole === 'CITIZEN' ? 50 : 500,
      };

      setUsersList([created, ...usersList]);
      setIsCreatingUser(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setFeedbackMsg(`User account for ${newFullName} created with role ${newRole}.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Failed to create user account.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const getRoleBadge = (role: StandardRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
            <Crown className="w-3 h-3 text-purple-600" />
            SUPER ADMIN
          </span>
        );
      case 'ORGANIZATION_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            <Shield className="w-3 h-3 text-blue-600" />
            ORG ADMIN
          </span>
        );
      case 'WORKER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            <Wrench className="w-3 h-3 text-amber-600" />
            FIELD SPECIALIST
          </span>
        );
      case 'CITIZEN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
            <Users className="w-3 h-3 text-teal-600" />
            CITIZEN
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#102A43]">
            Municipal Identity & Access Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global directory of verified citizens, field specialists, and agency administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingUser(true)}
          className="px-4 py-2.5 bg-[#2C7A7B] hover:bg-[#234E52] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]/20"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]/20"
          >
            <option value="all">All Security Roles</option>
            <option value="SUPER_ADMIN">SUPER ADMIN</option>
            <option value="ORGANIZATION_ADMIN">ORGANIZATION ADMIN</option>
            <option value="WORKER">WORKER (Field Tech)</option>
            <option value="CITIZEN">CITIZEN (Public)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]/20"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Accounts Only</option>
            <option value="inactive">Disabled / Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">User Name & Contact</th>
                <th className="py-3 px-4">Role & Jurisdiction</th>
                <th className="py-3 px-4">Affiliated Agency</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold">No user accounts found matching your query.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#102A43]">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getRoleBadge(u.role)}
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">{u.ward}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.organizationName ? (
                        <div className="text-slate-800 font-medium">
                          {u.organizationName}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None (Public Citizen)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                        {u.mustChangePassword && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                            <KeyRound className="w-2.5 h-2.5" />
                            Pending Password Setup
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedNewRole(u.role);
                            setSelectedNewOrg(u.organizationName || '');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#2C7A7B] hover:bg-teal-50 rounded-lg border border-teal-200 transition-colors"
                        >
                          Edit Role
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u.id)}
                          className={`p-1 rounded-lg border transition-colors ${
                            u.isActive
                              ? 'text-red-600 hover:bg-red-50 border-red-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={u.isActive ? 'Disable Account' : 'Reactivate Account'}
                        >
                          {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#2C7A7B]" />
                <span>Reassign Role & Agency</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-slate-500 font-medium">User:</span>
                <strong className="block text-sm text-[#102A43]">{editingUser.fullName}</strong>
                <span className="text-slate-400">{editingUser.email}</span>
              </div>

              <div>
                <label className="font-bold text-[#102A43] block mb-1">Assigned Security Role</label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value as StandardRole)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  <option value="CITIZEN">CITIZEN (Public Reporting)</option>
                  <option value="WORKER">WORKER (Field Specialist)</option>
                  <option value="ORGANIZATION_ADMIN">ORGANIZATION_ADMIN (Agency Manager)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (System Director)</option>
                </select>
              </div>

              {selectedNewRole !== 'CITIZEN' && (
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Municipal Department / Agency</label>
                  <select
                    value={selectedNewOrg}
                    onChange={(e) => setSelectedNewOrg(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="">Select Department...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoleEdit}
                  className="px-4 py-2 bg-[#2C7A7B] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreatingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#2C7A7B]" />
                <span>Provision Municipal Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingUser(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#102A43] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Officer Rachel Zane"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-[#102A43] block mb-1">Official Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@city.gov"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as StandardRole)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="WORKER">WORKER (Field Tech)</option>
                    <option value="ORGANIZATION_ADMIN">ORG_ADMIN</option>
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {newRole !== 'CITIZEN' && (
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Agency Affiliation</label>
                  <select
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-[#102A43] block mb-1">Jurisdiction / Ward</label>
                <input
                  type="text"
                  value={newWard}
                  onChange={(e) => setNewWard(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingUser(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2C7A7B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Password Display Modal (Shown ONCE to Super Admin) */}
      {provisionedCredentials && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-scale-up border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 border border-amber-200 mx-auto sm:mx-0">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#102A43]">
                Temporary Credentials Provisioned
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                The Organization Administrator account for{' '}
                <strong className="text-slate-800">{provisionedCredentials.fullName}</strong> has been successfully created.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Login Email:</span>
                <span className="font-mono font-bold text-slate-900">{provisionedCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Role:</span>
                <span className="font-bold text-blue-700">ORGANIZATION ADMIN</span>
              </div>
              {provisionedCredentials.organizationName && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Agency:</span>
                  <span className="font-bold text-slate-800">{provisionedCredentials.organizationName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Temporary Password (Visible Once)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-slate-100 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 tracking-wide select-all">
                  {provisionedCredentials.temporaryPassword}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(provisionedCredentials.temporaryPassword)}
                  className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    copiedPassword
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#2C7A7B] hover:bg-[#235e5f] text-white'
                  }`}
                >
                  {copiedPassword ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> Share this temporary password securely. The administrator will be required to create a new password immediately upon first signing in.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setProvisionedCredentials(null);
                  setCopiedPassword(false);
                }}
                className="px-6 py-2.5 bg-[#102A43] hover:bg-[#1A365D] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                I Have Saved Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
