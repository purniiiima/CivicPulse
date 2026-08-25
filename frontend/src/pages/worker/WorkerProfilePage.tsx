import React, { useState, useRef } from 'react';
import {
  Wrench,
  Shield,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Building,
  Star,
  Activity,
  Edit3,
  Camera,
  Trash2,
  KeyRound,
  Lock,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const WorkerProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { workers, updateWorkerStatus, showToast } = useApp();

  const workerData = workers.find((w) => w.email === user?.email || w.id === user?.id);

  const [availability, setAvailability] = useState<'available' | 'busy' | 'on_leave'>(
    (user?.availability as any) || workerData?.availability || 'available'
  );

  // Edit Profile mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form fields
  const [fullName, setFullName] = useState(user?.name || workerData?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || workerData?.department || 'Public Works');
  const [ward, setWard] = useState(user?.ward || 'Ward 14');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [expertiseInput, setExpertiseInput] = useState(
    (user?.expertise || workerData?.expertise || [
      'High-voltage line tensioning',
      'Streetlight arrays',
      'Substation maintenance',
      'Hazardous containment',
    ]).join(', ')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'on_leave') => {
    setAvailability(newStatus);
    if (workerData?.id) {
      updateWorkerStatus(workerData.id, newStatus);
    }
    try {
      await updateProfile({ availability: newStatus });
      showToast({
        type: 'success',
        title: 'Duty Status Updated',
        message: `Your active field status is now set to ${newStatus.replace('_', ' ')}.`,
      });
    } catch {
      // Ignored
    }
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image file must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatar(result);
        setProfileError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setIsSaving(true);

    const expertiseList = expertiseInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        department: department.trim(),
        ward: ward.trim(),
        avatar: avatar || '',
        expertise: expertiseList,
      });

      if (res.success) {
        setIsEditing(false);
        showToast({
          type: 'success',
          title: 'Specialist Profile Saved',
          message: 'Your field credentials and details have been updated.',
        });
      } else {
        setProfileError(res.error || 'Failed to update worker profile.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess(null);
        }, 1500);
      } else {
        setPasswordError(res.error || 'Failed to change password. Verify your current password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Password update failed.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const currentAvatar = isEditing ? avatar : (user?.avatar || '');
  const currentName = user?.name || workerData?.name || 'Field Specialist';
  const currentDept = user?.department || workerData?.department || 'Roads & Infrastructure';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#102A43] via-[#1A365D] to-[#2C7A7B]" />

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="flex items-end gap-4">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={currentName}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-800 ring-4 ring-white shadow-md flex items-center justify-center text-slate-300">
                  <User className="w-12 h-12" />
                </div>
              )}

              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#102A43]">
                  {currentName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    FIELD SPECIALIST
                  </span>
                  <span>•</span>
                  <span>{currentDept}</span>
                </div>
              </div>
            </div>

            {/* Action buttons + Availability toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleStatusChange('available')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    availability === 'available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('busy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    availability === 'busy'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  On Duty
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('on_leave')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    availability === 'on_leave'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  On Leave
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setIsChangingPassword(false);
                  }}
                  className="px-3.5 py-1.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(!isChangingPassword);
                    setIsEditing(false);
                  }}
                  className="px-3.5 py-1.5 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] text-xs font-black rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks Completed</span>
              <div className="text-lg font-black text-[#102A43] mt-0.5">
                {workerData?.completedTasks || 24}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Specialist Rating</span>
              <div className="text-lg font-black text-amber-600 mt-0.5 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{workerData?.rating || 4.9}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Incidents</span>
              <div className="text-lg font-black text-[#2C7A7B] mt-0.5">
                {workerData?.activeIssuesCount || 0}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Service Ward</span>
              <div className="text-sm font-bold text-slate-700 mt-1 truncate">
                {user?.ward || workerData?.ward || 'Ward 14'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Worker Profile Card */}
      {isEditing && (
        <div className="bg-white border border-teal-200 rounded-[18px] p-6 shadow-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-[#2C7A7B] rounded-xl">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#102A43]">Edit Specialist Profile</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Specialist Avatar Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#2C7A7B]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    id="worker-photo-input"
                    className="hidden"
                    onChange={(e) => handlePhotoSelect(e.target.files)}
                  />
                  <label
                    htmlFor="worker-photo-input"
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image</span>
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Direct Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-8901"
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department / Trade
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Electrical & Grid Repairs"
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned Ward
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. Ward 14"
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Skills & Certifications (Comma separated)
              </label>
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                placeholder="High-voltage lines, Asphalt patching, Water valves"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#2C7A7B] hover:bg-[#234E52] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Card */}
      {isChangingPassword && (
        <div className="bg-white border border-amber-200 rounded-[18px] p-6 shadow-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#102A43]">Change Account Password</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="px-5 py-2 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isSubmittingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Details & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#2C7A7B]" />
            <span>Organizational Affiliation</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Agency / Org:</span>
              <span className="font-bold text-slate-800">
                {user?.organizationName || 'Metropolis Public Works Authority'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Official Email:</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Emergency Phone:</span>
              <span className="font-semibold text-slate-800">{user?.phone || '+1 (555) 234-8901'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Specialist ID:</span>
              <span className="font-mono font-bold text-[#2C7A7B]">EMP-{user?.id?.slice(0, 8) || 'W101'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F4B942]" />
            <span>Field Certifications & Skills</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {(user?.expertise || workerData?.expertise || [
              'High-voltage line tensioning',
              'Streetlight arrays',
              'Substation maintenance',
              'Hazardous containment',
            ]).map((exp) => (
              <span
                key={exp}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
              >
                {exp}
              </span>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/70 text-xs text-emerald-800">
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>OSHA & Municipal Safety Certified</span>
            </div>
            <p className="text-[11px] leading-tight">
              Cleared for field deployment, heavy equipment operation, and rapid repair triage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
