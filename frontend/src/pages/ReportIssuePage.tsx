import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  IssueCategory,
  IssuePriority,
  LocationInfo,
  CivicIssue,
} from '../types';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { CivicMap } from '../components/common/CivicMap';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { detectUserLocation, calculateDistanceKm, formatDistance, getMapConfig } from '../services/mapService';
import { INDIAN_STATES } from '../data/indianStates';
import {
  validateReportTitle,
  validateReportDescription,
  validateIndianPincode,
} from '../utils/validation';
import confetti from 'canvas-confetti';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Camera,
  MapPin,
  FileText,
  Sparkles,
  Upload,
  X,
  AlertTriangle,
  Info,
  ShieldCheck,
  Navigation,
  Compass,
  Layers,
  Search,
  ExternalLink,
  ThumbsUp,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  ArrowLeft,
  Plus,
  Edit3,
  Globe,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Category', icon: FileText },
  { id: 2, name: 'Description', icon: Info },
  { id: 3, name: 'Photos', icon: Camera },
  { id: 4, name: 'Location', icon: MapPin },
  { id: 5, name: 'Review & Submit', icon: Check },
];

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, createIssue, currentUser, issues, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [category, setCategory] = useState<IssueCategory>('potholes');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submittedIssue, setSubmittedIssue] = useState<CivicIssue | null>(null);
  
  // Location selection mode: Map or Manual
  const [locationMode, setLocationMode] = useState<'map' | 'manual'>('map');
  
  // Manual Location fields
  const [manualAddress, setManualAddress] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualPincode, setManualPincode] = useState('');
  const [manualLandmark, setManualLandmark] = useState('');

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [location, setLocation] = useState<LocationInfo>(() => {
    const mapConfig = getMapConfig();
    return {
      address: 'Central Civic Boulevard',
      landmark: 'Near Central Library & Metro Junction',
      wardOrZone: 'Ward 14 - Central Metro',
      area: 'Ward 14 - Central Metro',
      city: 'Metropolis City',
      lat: mapConfig.defaultCenter.lat,
      lng: mapConfig.defaultCenter.lng,
      latitude: mapConfig.defaultCenter.lat,
      longitude: mapConfig.defaultCenter.lng,
      postalCode: '110001',
    };
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Compute nearby reported issues around selected coordinates
  const nearbyIssues = issues.filter((iss) => {
    if (iss.location.lat == null || iss.location.lng == null || location.lat == null || location.lng == null) {
      return false;
    }
    const dist = calculateDistanceKm(location.lat, location.lng, iss.location.lat, iss.location.lng);
    return dist <= 2.5;
  }).sort((a, b) => {
    if (a.location.lat == null || b.location.lat == null) return 0;
    const distA = calculateDistanceKm(location.lat || 0, location.lng || 0, a.location.lat, a.location.lng || 0);
    const distB = calculateDistanceKm(location.lat || 0, location.lng || 0, b.location.lat, b.location.lng || 0);
    return distA - distB;
  });

  const handleGpsDetect = async () => {
    setIsLocatingGps(true);
    try {
      const detected = await detectUserLocation();
      setLocation(detected);
    } catch (err) {
      console.warn('GPS location detection failed:', err);
    } finally {
      setIsLocatingGps(false);
    }
  };

  // Selected category metadata
  const selectedCatMeta = categories.find((c) => c.id === category) || categories[0];

  const validateCurrentStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!category) {
        newErrors.category = 'Please select an issue category.';
      }
    } else if (step === 2) {
      const titleVal = validateReportTitle(title);
      if (!titleVal.valid) {
        newErrors.title = titleVal.error || 'Please enter a descriptive title (5-150 characters).';
      }
      const descVal = validateReportDescription(description);
      if (!descVal.valid) {
        newErrors.description = descVal.error || 'Please provide a detailed description (minimum 10 characters).';
      }
    } else if (step === 4) {
      if (locationMode === 'manual') {
        if (!manualAddress.trim() || manualAddress.trim().length < 3) {
          newErrors.manualAddress = 'Please enter a valid street address / location (minimum 3 characters).';
        }
        if (!manualCity.trim() || manualCity.trim().length < 2) {
          newErrors.manualCity = 'Please enter a valid city name (minimum 2 characters).';
        }
        if (!manualState.trim()) {
          newErrors.manualState = 'Please select a state or union territory.';
        }
        const pinVal = validateIndianPincode(manualPincode);
        if (!pinVal.valid) {
          newErrors.manualPincode = pinVal.error || 'Please enter a valid 6-digit Indian PIN code.';
        }
      } else {
        if (!location.address.trim() || location.address.trim().length < 3) {
          newErrors.address = 'Please provide a street address or location name.';
        }
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep(currentStep)) {
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (catId: IssueCategory) => {
    setCategory(catId);
    if (validationErrors.category) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy.category;
        return copy;
      });
    }
    // Auto-generate title placeholder suggestion if blank
    if (!title) {
      const suggestions: Record<IssueCategory, string> = {
        streetlights: 'Damaged or dark streetlight fixture on public walkway',
        potholes: 'Hazardous pothole causing vehicle bump and bike risk',
        garbage: 'Overflowing public waste dumpster requiring clearance',
        water_leakage: 'Pressurized water line leakage flooding sidewalk',
        damaged_roads: 'Broken curb and cracked asphalt requiring repair',
        drainage: 'Blocked stormwater grate causing rain puddle backup',
        infrastructure: 'Damaged public railing and transit shelter barrier',
        parks: 'Broken playground equipment and hazardous chain links',
        electricity: 'Low hanging electrical line and sparking mast arm',
        other: 'Public safety and civic obstruction issue',
      };
      setTitle(suggestions[catId] || '');
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError(null);

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Please select valid image files (JPG, PNG, WebP).');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError('Files must be under 10MB each.');
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setUploadedImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetForm = () => {
    setSubmittedIssue(null);
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setUploadedImages([]);
    setPriority('medium');
    setIsAnonymous(false);
    setLocationMode('map');
    setManualAddress('');
    setManualCity('');
    setManualState('');
    setManualPincode('');
    setManualLandmark('');
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(2) || !validateCurrentStep(4)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveLocation: LocationInfo = locationMode === 'manual'
        ? {
            address: manualAddress.trim(),
            city: manualCity.trim(),
            state: manualState.trim(),
            pincode: manualPincode.trim(),
            postalCode: manualPincode.trim(),
            landmark: manualLandmark.trim() || undefined,
            wardOrZone: `${manualCity.trim()} - ${manualPincode.trim()}`,
            area: `${manualCity.trim()} - ${manualPincode.trim()}`,
            location_source: 'MANUAL',
            lat: null as any,
            lng: null as any,
            latitude: null as any,
            longitude: null as any,
          }
        : {
            ...location,
            location_source: 'MAP',
          };

      const newIssue = await createIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'reported',
        location: effectiveLocation,
        images: uploadedImages,
        reporter: {
          id: currentUser.id,
          name: isAnonymous ? 'Anonymous Citizen' : currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          avatar: isAnonymous ? undefined : currentUser.avatar,
          isAnonymous,
        },
        department: selectedCatMeta.defaultDepartment,
        aiSuggestion: {
          suggestedPriority: priority,
          suggestedDepartment: selectedCatMeta.defaultDepartment,
          confidenceScore: 0.96,
          hazardAnalysis: 'Safety criteria verified based on category and reported coordinates.',
        },
      });

      if (newIssue) {
        setSubmittedIssue(newIssue);

        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.45 },
            colors: ['#2C7A7B', '#F4B942', '#319795', '#102A43'],
          });
        } catch {
          // ignore confetti if disabled
        }

        showToast(
          'Issue reported successfully! Municipal authorities have been notified.',
          'success'
        );
      } else {
        showToast('Failed to submit civic issue. Please check fields and try again.', 'error');
      }
    } catch (err: any) {
      console.error('Failed to create issue:', err);
      showToast(err?.message || 'Error occurred while saving issue report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (submittedIssue) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 sm:p-10 shadow-lg text-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100/80 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight">
              Report Submitted Successfully
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your issue has been officially logged in the Metropolis Municipal repository and queued for operations dispatch.
            </p>
          </div>

          {/* Details Summary Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tracking Number
                </span>
                <div className="font-mono text-lg sm:text-xl font-black text-[#102A43] tracking-wide flex items-center gap-2 mt-0.5">
                  <span>{submittedIssue.trackingNumber}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(submittedIssue.trackingNumber);
                      showToast({
                        type: 'info',
                        title: 'Copied to Clipboard',
                        message: `Tracking Number #${submittedIssue.trackingNumber} copied.`,
                      });
                    }}
                    title="Copy tracking number"
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider rounded-full shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  {submittedIssue.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 font-medium">Issue Title:</span>
                <p className="font-bold text-[#102A43] truncate mt-0.5">{submittedIssue.title}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Category:</span>
                <p className="font-bold text-[#102A43] capitalize mt-0.5">
                  {submittedIssue.category.replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Ward / Location:</span>
                <p className="font-bold text-[#102A43] truncate mt-0.5">
                  {submittedIssue.location?.wardOrZone || submittedIssue.location?.address}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Assigned Department:</span>
                <p className="font-bold text-[#2C7A7B] mt-0.5">{submittedIssue.department}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/issues/${submittedIssue.id}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#F4B942]" />
              <span>View Report</span>
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Return to Dashboard</span>
            </Link>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline transition-all"
            >
              + Report another civic issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
              Report a Civic Problem
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submit real-world issues directly to Metropolis Municipal Works in 5 easy steps.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Step {currentStep} of 5
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-[#2C7A7B] text-white'
                        : isCurrent
                        ? 'bg-[#102A43] text-white ring-4 ring-teal-100 shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-1.5 hidden sm:block ${
                      isCurrent
                        ? 'text-[#102A43]'
                        : isCompleted
                        ? 'text-[#2C7A7B]'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wizard Content Container */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 sm:p-8 shadow-xs">
        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#102A43]">
                Step 1: Select Issue Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                What type of problem are you reporting today?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {categories.map((cat) => {
                const isSelected = category === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2C7A7B] bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#2C7A7B] text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <CategoryIcon category={cat.id} className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#2C7A7B] text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-[#102A43] mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Target SLA:</span>
                      <span className="font-semibold text-slate-700">~{cat.avgResolutionHours}h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Problem Description & Severity */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#102A43]">
                Step 2: Describe the Problem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide clear details so municipal crews arrive with the correct tools.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Issue Summary / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationErrors.title) {
                      setValidationErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.title;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. Deep pothole on pedestrian crossing near central park"
                  className={`w-full text-xs sm:text-sm p-3.5 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] ${
                    validationErrors.title ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
                {validationErrors.title && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{validationErrors.title}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Detailed Description & Hazards <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (validationErrors.description) {
                      setValidationErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.description;
                        return copy;
                      });
                    }
                  }}
                  placeholder="Explain what is broken, how long it has been there, and whether it poses an immediate safety hazard..."
                  className={`w-full text-xs sm:text-sm p-3.5 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] ${
                    validationErrors.description ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
                {validationErrors.description && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{validationErrors.description}</span>
                  </p>
                )}
              </div>

              {/* Priority / Urgency selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Estimated Hazard Urgency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['low', 'medium', 'high', 'urgent'] as IssuePriority[]).map((p) => {
                    const isSelected = priority === p;
                    return (
                      <div
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          isSelected
                            ? 'border-[#2C7A7B] bg-teal-50/60 ring-2 ring-teal-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="mb-1">
                          <PriorityBadge priority={p} size="sm" />
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {p === 'urgent'
                            ? 'Immediate danger'
                            : p === 'high'
                            ? 'Major disruption'
                            : p === 'medium'
                            ? 'Normal repair'
                            : 'Cosmetic / Low'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photo Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#102A43]">
                Step 3: Upload Photos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Photos help technicians identify equipment, parts, and safety barriers required.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-[#2C7A7B] bg-teal-50/80 scale-[1.01]'
                  : 'border-slate-300 hover:border-[#2C7A7B] bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="issue-photos-input"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <label htmlFor="issue-photos-input" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-[#2C7A7B] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-[#102A43] mb-1">
                  Drag and drop your photos here, or <span className="text-[#2C7A7B] underline">browse files</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-2">
                  Supports JPG, PNG, WEBP up to 10MB each
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#2C7A7B] hover:bg-teal-50 shadow-2xs">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Select Photos from Device</span>
                </span>
              </label>

              {photoError && (
                <div className="mt-3 p-2 text-xs text-red-600 bg-red-50 rounded-lg font-semibold inline-block">
                  {photoError}
                </div>
              )}
            </div>

            {/* Preview gallery */}
            {uploadedImages.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Attached Photos ({uploadedImages.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setUploadedImages([])}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 h-28 group"
                    >
                      <img
                        src={img}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                No photos attached yet. Photos are optional but help technicians diagnose the issue faster.
              </div>
            )}
          </div>
        )}

        {/* Step 4: Location Map Picker or Manual Entry */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#102A43] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#2C7A7B]" />
                  <span>Step 4: Issue Location</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pin on the map or enter the address details manually.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex flex-wrap sm:flex-nowrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0 gap-1 sm:gap-0">
                <button
                  type="button"
                  onClick={() => setLocationMode('map')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-1 sm:flex-initial justify-center ${
                    locationMode === 'map'
                      ? 'bg-white text-[#102A43] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Interactive Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-1 sm:flex-initial justify-center ${
                    locationMode === 'manual'
                      ? 'bg-[#2C7A7B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Enter Location Manually</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Interactive Map Mode */}
            {locationMode === 'map' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-600">
                    Click or drag the marker anywhere on the map to pinpoint the exact location.
                  </span>

                  {/* GPS Quick Detect Button */}
                  <button
                    type="button"
                    onClick={handleGpsDetect}
                    disabled={isLocatingGps}
                    className="px-3.5 py-2 bg-[#2C7A7B] hover:bg-[#234E52] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 w-full sm:w-auto"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
                    <span>{isLocatingGps ? 'Detecting GPS...' : 'Use My Current Location'}</span>
                  </button>
                </div>

                {/* Interactive Map */}
                <CivicMap
                  isPicker
                  allowMarkerDrag
                  issues={issues}
                  selectedLocation={location}
                  onSelectLocation={(loc) => setLocation(loc)}
                  showNearbyRadius
                  radiusKm={1.5}
                  height="h-80 sm:h-96"
                  title="Issue Location Picker"
                  subtitle="Drag pin or click map"
                />

                {/* Form Fields for Address, Area, City, and Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Street Address / Landmark <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location.address}
                      onChange={(e) => {
                        setLocation({ ...location, address: e.target.value });
                        if (validationErrors.address) {
                          setValidationErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.address;
                            return copy;
                          });
                        }
                      }}
                      placeholder="e.g. 442 Maplewood Avenue"
                      className={`w-full text-xs p-3 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] ${
                        validationErrors.address ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {validationErrors.address && (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        {validationErrors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={location.city}
                      onChange={(e) =>
                        setLocation({ ...location, city: e.target.value })
                      }
                      placeholder="Metropolis City"
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Municipal Ward / Area
                    </label>
                    <input
                      type="text"
                      value={location.wardOrZone}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          wardOrZone: e.target.value,
                          area: e.target.value,
                        })
                      }
                      placeholder="e.g. Ward 14 - Central Metro"
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.lat ?? ''}
                      onChange={(e) => {
                        const newLat = parseFloat(e.target.value);
                        if (!isNaN(newLat)) {
                          setLocation({ ...location, lat: newLat, latitude: newLat });
                        }
                      }}
                      className="w-full text-xs p-3 font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.lng ?? ''}
                      onChange={(e) => {
                        const newLng = parseFloat(e.target.value);
                        if (!isNaN(newLng)) {
                          setLocation({ ...location, lng: newLng, longitude: newLng });
                        }
                      }}
                      className="w-full text-xs p-3 font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B]"
                    />
                  </div>
                </div>

                {/* Nearby Reported Issues Section */}
                {nearbyIssues.length > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2C7A7B]"></span>
                        <h4 className="text-xs font-extrabold text-[#102A43]">
                          Nearby Active Reports Within 2.5 km ({nearbyIssues.length})
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Check if your issue is already reported to prevent duplicate tickets
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {nearbyIssues.slice(0, 4).map((nearby) => {
                        const distKm = calculateDistanceKm(
                          location.lat || 0,
                          location.lng || 0,
                          nearby.location.lat || 0,
                          nearby.location.lng || 0
                        );
                        return (
                          <div
                            key={nearby.id}
                            className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-2xs hover:border-[#2C7A7B] transition-all text-xs"
                          >
                            <div className="p-1.5 rounded-lg bg-slate-100 text-[#102A43] shrink-0">
                              <CategoryIcon category={nearby.category} className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-[#102A43] truncate text-[11px]">
                                  {nearby.title}
                                </span>
                                <span className="text-[10px] font-bold text-[#2C7A7B] whitespace-nowrap bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100">
                                  {formatDistance(distKm)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {nearby.location.address}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <StatusBadge status={nearby.status} size="sm" />
                                <PriorityBadge priority={nearby.priority} size="sm" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Manual Location Entry Mode */}
            {locationMode === 'manual' && (
              <div className="space-y-5 p-6 bg-slate-50/70 border border-slate-200/90 rounded-2xl animate-fade-in">
                <div className="flex items-start gap-3 p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-teal-900">
                  <Info className="w-4 h-4 text-[#2C7A7B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Manual Location Mode:</span>
                    <p className="text-slate-600 mt-0.5">
                      Enter the address, city, state, and 6-digit Indian PIN code directly.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Address / Location */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Address / Location <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={manualAddress}
                      onChange={(e) => {
                        setManualAddress(e.target.value);
                        if (validationErrors.manualAddress) {
                          setValidationErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.manualAddress;
                            return copy;
                          });
                        }
                      }}
                      placeholder="e.g. Near HDFC Bank ATM, 4th Cross, 2nd Main, Indiranagar"
                      className={`w-full text-xs p-3.5 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] bg-white ${
                        validationErrors.manualAddress ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {validationErrors.manualAddress && (
                      <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{validationErrors.manualAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={manualCity}
                        onChange={(e) => {
                          setManualCity(e.target.value);
                          if (validationErrors.manualCity) {
                            setValidationErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.manualCity;
                              return copy;
                            });
                          }
                        }}
                        placeholder="e.g. Bengaluru, Mumbai, Delhi, Hyderabad"
                        className={`w-full text-xs p-3.5 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] bg-white ${
                          validationErrors.manualCity ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {validationErrors.manualCity && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{validationErrors.manualCity}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        State / UT <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={manualState}
                        onChange={(e) => {
                          setManualState(e.target.value);
                          if (validationErrors.manualState) {
                            setValidationErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.manualState;
                              return copy;
                            });
                          }
                        }}
                        className={`w-full text-xs p-3.5 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] bg-white ${
                          validationErrors.manualState ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      >
                        <option value="">-- Select State / Union Territory --</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {validationErrors.manualState && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{validationErrors.manualState}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pincode and Landmark */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        PIN Code (6 digits) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={manualPincode}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setManualPincode(digitsOnly);
                          if (validationErrors.manualPincode) {
                            setValidationErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.manualPincode;
                              return copy;
                            });
                          }
                        }}
                        placeholder="e.g. 560001, 110001, 400001"
                        className={`w-full text-xs font-mono p-3.5 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] bg-white ${
                          validationErrors.manualPincode ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {validationErrors.manualPincode && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{validationErrors.manualPincode}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Prominent Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={manualLandmark}
                        onChange={(e) => setManualLandmark(e.target.value)}
                        placeholder="e.g. Opposite City Central Hospital"
                        className="w-full text-xs p-3.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[#2C7A7B] bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#102A43]">
                Step 5: Review & Confirm Submission
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify the details below before official dispatch to municipal teams.
              </p>
            </div>

            {/* Civic Triage & Routing Box */}
            <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#2C7A7B] text-white rounded-xl shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-[#F4B942]" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#102A43] flex items-center gap-2">
                  <span>Automated Dispatch Routing</span>
                  <span className="bg-teal-100 text-teal-800 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                    SLA Verified
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Categorized to{' '}
                  <strong className="text-slate-800">{selectedCatMeta.defaultDepartment}</strong>.
                  Estimated field response SLA:{' '}
                  <strong className="text-[#2C7A7B]">~{selectedCatMeta.avgResolutionHours} hours</strong>.
                </p>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Category & Priority
                </div>
                <div className="flex items-center gap-2">
                  <CategoryIcon category={category} className="w-4 h-4 text-[#2C7A7B]" />
                  <span className="font-bold text-[#102A43]">{selectedCatMeta.name}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <PriorityBadge priority={priority} size="sm" />
                  <span className="text-slate-500">Urgency Level</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Location</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    locationMode === 'manual' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {locationMode === 'manual' ? 'Manual Entry' : 'Map Pinned'}
                  </span>
                </div>

                {locationMode === 'manual' ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-[#102A43]">
                      <MapPin className="w-4 h-4 text-[#2C7A7B] shrink-0" />
                      <span className="truncate">{manualAddress || 'Manual Address'}</span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      {manualCity}, {manualState} — <span className="font-mono font-bold">PIN: {manualPincode}</span>
                    </p>
                    {manualLandmark && (
                      <p className="text-slate-500 text-[11px]">
                        Landmark: {manualLandmark}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-[#102A43]">
                      <MapPin className="w-4 h-4 text-[#2C7A7B] shrink-0" />
                      <span className="truncate">{location.address}</span>
                    </div>
                    <div className="text-slate-500">{location.wardOrZone}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Title & Description
              </div>
              <h4 className="font-bold text-[#102A43] text-sm">{title}</h4>
              <p className="text-slate-600 leading-relaxed">{description}</p>
            </div>

            {/* Attached Photos Preview in Review */}
            {uploadedImages.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Attached Photos ({uploadedImages.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review photo ${idx + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-[#2C7A7B] rounded focus:ring-teal-500 border-slate-300"
              />
              <label htmlFor="anon" className="text-slate-700 font-medium cursor-pointer">
                Submit as Anonymous Reporter (Hides your name and profile avatar on public board)
              </label>
            </div>
          </div>
        )}

        {/* Wizard Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-3.5 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] text-xs sm:text-sm font-black rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Report...' : 'Submit Civic Report'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
