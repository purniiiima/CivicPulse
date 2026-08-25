import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  validateFullName,
  validateIndianPhone,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  ShieldCheck,
  Bell,
  CheckCircle2,
  FileText,
  Star,
  Sparkles,
  Edit3,
  Camera,
  Trash2,
  KeyRound,
  Lock,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';

export const CitizenProfilePage: React.FC = () => {
  const { currentUser, showToast, issues } = useApp();
  const { user, updateProfile, changePassword } = useAuth();

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit form fields
  const [fullName, setFullName] = useState(user?.name || currentUser.name || '');
  const [phone, setPhone] = useState(user?.phone || currentUser.phone || '');
  const [ward, setWard] = useState(user?.ward || currentUser.ward || 'Ward 14 - Central Metro');
  const [avatar, setAvatar] = useState(user?.avatar || currentUser.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Notification preferences state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Profile image must be under 5MB.');
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

    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      setProfileError(nameValidation.message || 'Please enter a valid full name.');
      return;
    }

    if (phone.trim()) {
      const phoneValidation = validateIndianPhone(phone);
      if (!phoneValidation.isValid) {
        setProfileError(phoneValidation.message || 'Please enter a valid 10-digit Indian phone number.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        ward: ward.trim(),
        avatar: avatar || '',
      });

      if (res.success) {
        setIsEditing(false);
        showToast(
          'Your personal details and preferences have been updated.',
          'success'
        );
      } else {
        setProfileError(res.error || 'Failed to update profile.');
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

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    const passValidation = validatePassword(newPassword);
    if (!passValidation.isValid) {
      setPasswordError(passValidation.message || 'Password does not meet security requirements.');
      return;
    }

    const confirmValidation = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmValidation.isValid) {
      setPasswordError(confirmValidation.message || 'Passwords do not match.');
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
        setPasswordSuccess('Your password has been changed successfully.');
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

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'Preferences Saved',
      message: 'Your civic notification channels have been updated successfully.',
    });
  };

  const effectiveUser = user || currentUser;
  const userReportCount = issues.filter(
    (i) => i.reporter.id === effectiveUser.id || i.reporter.email === effectiveUser.email
  ).length;

  const userResolvedCount = issues.filter(
    (i) =>
      (i.reporter.id === effectiveUser.id || i.reporter.email === effectiveUser.email) &&
      (i.status === 'resolved' || i.status === 'verified')
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#1A365D] to-[#2C7A7B] rounded-[18px] p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              {effectiveUser.avatar ? (
                <img
                  src={effectiveUser.avatar}
                  alt={effectiveUser.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20 shadow-xl bg-slate-800"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-700 ring-4 ring-white/20 shadow-xl flex items-center justify-center text-slate-300">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black">{effectiveUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4B942] text-[#102A43] capitalize">
                  {effectiveUser.role?.toLowerCase().replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-300" />
                <span>{effectiveUser.ward || 'Ward 14 - Central Metro'}</span>
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {effectiveUser.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {effectiveUser.phone || 'No phone set'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {currentUser.joinedDate || '2026'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setIsChangingPassword(false);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Card (When active) */}
      {isEditing && (
        <div className="bg-white border border-teal-200 rounded-[18px] p-6 shadow-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-[#2C7A7B] rounded-xl">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#102A43]">Edit Profile Information</h2>
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
            {/* Photo Upload Row */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Profile Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#2C7A7B]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    id="profile-photo-input"
                    className="hidden"
                    onChange={(e) => handlePhotoSelect(e.target.files)}
                  />
                  <label
                    htmlFor="profile-photo-input"
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Neighborhood / Ward Location
              </label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Ward 14 - Central Metro"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#2C7A7B] hover:bg-[#234E52] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Card (When active) */}
      {isChangingPassword && (
        <div className="bg-white border border-amber-200 rounded-[18px] p-6 shadow-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#102A43]">Update Password</h2>
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
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="px-5 py-2 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isSubmittingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Civic Impact Score & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#F4B942]" />
              <span>Civic Impact Score</span>
            </div>
            <div className="text-3xl font-black text-[#102A43] pt-2">
              {currentUser.impactScore || 380} <span className="text-xs text-slate-400 font-normal">pts</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Active contributor to community infrastructure improvements.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#2C7A7B] font-bold">
            <span>Civic Recognition</span>
            <span>Level 3</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-[#2C7A7B]" />
              <span>Reported Issues</span>
            </div>
            <div className="text-3xl font-black text-[#102A43] pt-2">
              {userReportCount}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Issues submitted and routed to municipal triage.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-semibold">
            Logged under verified contact credentials
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolved & Verified</span>
            </div>
            <div className="text-3xl font-black text-emerald-700 pt-2">
              {userResolvedCount}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Confirmed municipal repairs across your local area.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-bold">
            Active Community Partner
          </div>
        </div>
      </div>

      {/* Citizen Badges Showcase */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F4B942]" />
          <span>Earned Civic Badges</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(currentUser.badges || ['First Report', 'Neighborhood Watch']).map((badge, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1"
            >
              <div className="w-8 h-8 rounded-full bg-teal-50 text-[#2C7A7B] flex items-center justify-center mx-auto">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[#102A43]">{badge}</div>
              <div className="text-[10px] text-slate-400">Verified Achievement</div>
            </div>
          ))}

          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Star className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-amber-900">Ward Partner</div>
            <div className="text-[10px] text-amber-700">Community Contributor</div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#102A43]">
            Notification & Alert Channels
          </h3>
          <p className="text-xs text-slate-500">
            Control how and when municipal status updates are delivered to you.
          </p>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div>
              <div className="text-xs font-bold text-[#102A43]">SMS Status Alerts</div>
              <div className="text-[11px] text-slate-500">
                Receive instant text when worker arrives on-site or completes fix
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-[#2C7A7B] rounded focus:ring-teal-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div>
              <div className="text-xs font-bold text-[#102A43]">Email Notifications</div>
              <div className="text-[11px] text-slate-500">
                Detailed resolution documentation and proof photos sent to {effectiveUser.email}
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-[#2C7A7B] rounded focus:ring-teal-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div>
              <div className="text-xs font-bold text-[#102A43]">Nearby Ward Safety Alerts</div>
              <div className="text-[11px] text-slate-500">
                Alerts about major water shutdowns, road paving, or electrical repairs in {effectiveUser.ward || 'Ward 14'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={(e) => setPushAlerts(e.target.checked)}
              className="w-4 h-4 text-[#2C7A7B] rounded focus:ring-teal-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Notification Settings
          </button>
        </form>
      </div>
    </div>
  );
};
