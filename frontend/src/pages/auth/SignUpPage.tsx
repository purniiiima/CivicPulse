import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  User,
  Wrench,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Check,
  X,
  Info,
  Building,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { evaluatePasswordStrength } from '../../services/authService';
import {
  validateFullName,
  validateEmail,
  validateIndianPhone,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validation';

type SignupType = 'CITIZEN' | 'WORKER';

const WORKER_DEPARTMENTS = [
  'Roadway & Pavement Repair',
  'Electrical Grid & Streetlights',
  'Water Utilities & Drainage Operations',
  'Public Sanitation & Environmental Management',
  'Parks & Public Tree Maintenance',
  'Traffic Signals & Signage Maintenance',
];

export const SignUpPage: React.FC = () => {
  const { registerCitizen, registerWorker, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [signupType, setSignupType] = useState<SignupType>(() => {
    const roleParam = searchParams.get('role')?.toUpperCase();
    if (roleParam === 'WORKER') return 'WORKER';
    return 'CITIZEN';
  });

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Worker-specific fields
  const [specialization, setSpecialization] = useState(WORKER_DEPARTMENTS[0]);
  const [skills, setSkills] = useState('');
  const [address, setAddress] = useState('Ward 1 - Downtown Core');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<SignupType>('CITIZEN');

  useEffect(() => {
    const roleParam = searchParams.get('role')?.toUpperCase();
    if (roleParam === 'WORKER') {
      setSignupType('WORKER');
    } else if (roleParam === 'CITIZEN') {
      setSignupType('CITIZEN');
    }
  }, [searchParams]);

  const handleTabChange = (type: SignupType) => {
    setSignupType(type);
    setSearchParams({ role: type.toLowerCase() });
    setErrorMessage(null);
  };

  const passwordStrength = evaluatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword ? password === confirmPassword : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    const nameVal = validateFullName(fullName);
    if (!nameVal.valid) {
      setErrorMessage(nameVal.error || 'Please enter a valid full name.');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      setErrorMessage(emailVal.error || 'Please enter a valid email address.');
      return;
    }

    const phoneVal = validateIndianPhone(phone, signupType === 'WORKER');
    if (!phoneVal.valid) {
      setErrorMessage(phoneVal.error || 'Please enter a valid 10-digit Indian phone number.');
      return;
    }

    const passVal = validatePassword(password);
    if (!passVal.valid) {
      setErrorMessage(passVal.error || 'Password must be at least 8 characters with upper, lower, and numbers.');
      return;
    }

    const confirmVal = validateConfirmPassword(password, confirmPassword);
    if (!confirmVal.valid) {
      setErrorMessage(confirmVal.error || 'Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the CivicPulse community guidelines and terms of service.');
      return;
    }

    setIsSubmitting(true);

    if (signupType === 'WORKER') {
      const res = await registerWorker({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword,
        specialization,
        skills: skills.trim() || undefined,
        address: address.trim() || undefined,
      });
      setIsSubmitting(false);

      if (res.success) {
        setRegisteredRole('WORKER');
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/worker');
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Worker registration failed. Please check your inputs and try again.');
      }
    } else {
      const res = await registerCitizen({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword,
      });
      setIsSubmitting(false);

      if (res.success) {
        setRegisteredRole('CITIZEN');
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/citizen');
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Citizen registration failed. Please check your inputs and try again.');
      }
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left / Top Form Panel */}
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
                    Public Registration
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-teal-50 text-teal-700 border-teal-200">
                Self-Registration
              </span>
            </div>

            {registrationSuccess ? (
              <div className="py-12 text-center space-y-4 animate-scale-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center ring-8 ring-emerald-50">
                  <CheckCircle className="w-9 h-9 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-[#102A43]">
                  Welcome to CivicPulse, {fullName}!
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your <strong>{registeredRole === 'WORKER' ? 'Field Worker' : 'Citizen'}</strong> account has been created and verified in the database. Initializing your secure session...
                </p>
                <div className="w-8 h-8 border-3 border-[#2C7A7B] border-t-transparent rounded-full animate-spin mx-auto pt-4" />
              </div>
            ) : (
              <>
                {/* Account Type Selection Tabs */}
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleTabChange('CITIZEN')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        signupType === 'CITIZEN'
                          ? 'bg-white text-[#102A43] shadow-xs'
                          : 'text-slate-600 hover:text-[#102A43]'
                      }`}
                    >
                      <User className="w-4 h-4 text-teal-600" />
                      <span>Citizen Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange('WORKER')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        signupType === 'WORKER'
                          ? 'bg-white text-[#102A43] shadow-xs'
                          : 'text-slate-600 hover:text-[#102A43]'
                      }`}
                    >
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span>Field Worker Account</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h1 className="text-xl font-black tracking-tight text-[#102A43]">
                    {signupType === 'WORKER' ? 'Create Field Worker Account' : 'Create Citizen Account'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {signupType === 'WORKER'
                      ? 'Register as a municipal field technician to receive dispatched work orders and submit resolution proofs.'
                      : 'Join your community to report local hazards, track repairs, and verify municipal work.'}
                  </p>
                </div>

                {/* Notice that Admin signups are restricted */}
                <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#2C7A7B] shrink-0 mt-0.5" />
                  <div>
                    <strong>Municipal Policy:</strong> Public registration is available for <strong>Citizens</strong> and <strong>Field Workers</strong>. Agency and Super Administrator accounts are pre-provisioned.
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#102A43] mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. user@example.com"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#102A43] mb-1">
                        Phone Number {signupType === 'CITIZEN' && <span className="text-slate-400 font-normal">(Optional)</span>}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          required={signupType === 'WORKER'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Worker-Specific Fields */}
                  {signupType === 'WORKER' && (
                    <div className="space-y-3 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl animate-fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Briefcase className="w-4 h-4 text-amber-700" />
                        <span>Field Work Credentials</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#102A43] mb-1">
                          Primary Department / Specialization *
                        </label>
                        <select
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-[#243B53] focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        >
                          {WORKER_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#102A43] mb-1">
                            Assigned District / Ward
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="e.g. Ward 1 - Downtown Core"
                              className="w-full bg-white border border-amber-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#243B53] focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#102A43] mb-1">
                            Skills / Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g. Heavy Equipment, High Voltage"
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-[#243B53] focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 space-y-1.5 animate-fade-in">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Password Strength:</span>
                          <span className="font-bold text-[#102A43]">{passwordStrength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-slate-500">
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasMinLength ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <X className="w-3 h-3 text-slate-300" />
                            )}
                            <span>8+ Characters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasUppercase ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <X className="w-3 h-3 text-slate-300" />
                            )}
                            <span>Uppercase Letter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasNumber ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <X className="w-3 h-3 text-slate-300" />
                            )}
                            <span>At least 1 Number</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasSpecialChar ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <X className="w-3 h-3 text-slate-300" />
                            )}
                            <span>Special Symbol (!@#$)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#102A43] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        className={`w-full bg-slate-50 border rounded-xl pl-10 pr-10 py-2 text-xs text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B] focus:border-transparent transition-all ${
                          confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-slate-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="pt-0.5">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-[#2C7A7B] focus:ring-[#2C7A7B] border-slate-300"
                      />
                      <span className="text-[11px] text-slate-600 leading-tight">
                        I agree to the CivicPulse Community Code of Conduct and acknowledge that work orders and reports submitted will be stored securely in the municipal database.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#102A43] hover:bg-[#1A365D] text-white text-xs font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registering Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete {signupType === 'WORKER' ? 'Worker' : 'Citizen'} Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer Link to Login */}
          <div className="pt-4 mt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#2C7A7B] hover:text-[#102A43] hover:underline">
              Sign In to your dashboard &rarr;
            </Link>
          </div>
        </div>

        {/* Right Highlights Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#102A43] via-[#1A365D] to-[#243B53] rounded-2xl shadow-xl p-6 sm:p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4B942] mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>CivicPulse Platform</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white mb-2">
              {signupType === 'WORKER' ? 'Field Workforce Operations' : 'Citizen Empowerment'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {signupType === 'WORKER'
                ? 'Join municipal field teams with real-time routing, photo resolution verification, and automated status synchronization.'
                : 'Report potholes, faulty streetlights, broken hydrants, or sanitation hazards directly to responsible municipal crews.'}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Database Role Verification</h4>
                  <p className="text-[11px] text-slate-300">
                    Accounts are provisioned with strict role separation verified directly by backend JWT middleware.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Geo-Dispatch & Routing</h4>
                  <p className="text-[11px] text-slate-300">
                    Pinpoint exact GPS coordinates and view assignments on interactive OpenStreetMap tiles.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Photo Resolution Verification</h4>
                  <p className="text-[11px] text-slate-300">
                    Workers capture photo evidence upon completion, which citizens inspect before closing tickets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-slate-400">
            CivicPulse Security: Real salted bcrypt password hashing and tamper-proof JWT bearer tokens.
          </div>
        </div>
      </div>
    </div>
  );
};
