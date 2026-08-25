import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  Smartphone,
  ChevronRight,
  BarChart3,
  ThumbsUp,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { categories, issues } = useApp();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const resolvedCount = issues.filter(
    (i) => i.status === 'resolved' || i.status === 'verified'
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#243B53] overflow-x-hidden w-full max-w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#102A43] via-[#0B1D30] to-[#102A43] text-white pt-12 pb-24 lg:pt-20 lg:pb-32 w-full">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#2C7A7B_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Core Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left min-w-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A365D] border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F4B942]" />
                <span>Modern Civic Tech & Incident Resolution</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight break-words">
                Report local problems.{' '}
                <span className="text-[#F4B942] block sm:inline">
                  Make your community better.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed break-words">
                CivicPulse bridges citizens, municipal departments, and field engineers.
                Snap a photo, pin the GPS location, track resolution in real time, and verify
                clean fixes across your neighborhood.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/report"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#1A365D] hover:bg-[#234E52] border border-slate-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Explore How It Works</span>
                </a>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-5 py-3.5 text-xs text-slate-300 hover:text-white font-semibold underline underline-offset-4"
                >
                  Sign In to Portal
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#F4B942]">
                    98.4%
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    Triage SLA in 2h
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-teal-400">
                    24h
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    Avg streetlight fix
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    45,000+
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    Citizens served
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive App Preview Mockup */}
            <div className="lg:col-span-5 min-w-0">
              <div className="relative mx-auto max-w-md bg-white border-4 border-slate-800 rounded-[24px] shadow-2xl p-5 text-slate-800">
                {/* Simulated Floating Status Notification */}
                <div className="absolute -top-4 left-2 sm:-left-4 bg-[#102A43] text-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-teal-500/40 flex items-center gap-2 sm:gap-3 text-xs max-w-[calc(100%-16px)] sm:max-w-xs animate-bounce">
                  <div className="p-2 bg-[#2C7A7B] text-white rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Water Leak Resolved</div>
                    <div className="text-[10px] text-slate-300">
                      Pine Street valve repaired in 3h
                    </div>
                  </div>
                </div>

                {/* Dashboard Header Preview */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#2C7A7B] flex items-center justify-center text-white font-bold text-xs">
                      CP
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#102A43]">
                        CivicPulse Live Stream
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Ward 14 • Metropolis City
                      </div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

                {/* Featured Live Report Preview */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      CP-2026-1048
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Stage: In Progress
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#102A43] mb-1">
                    Deep Hazardous Pothole on Oakridge Blvd
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-3">
                    Asphalt compacting unit on-site. Curing expected by 4 PM.
                  </p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-[#2C7A7B] h-full w-4/6" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Lead Specialist: Rajesh S.</span>
                    <span className="font-semibold text-teal-700">42 Citizens confirmed</span>
                  </div>
                </div>

                {/* Mini Metric Grid in Mockup */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-teal-50/60 border border-teal-200/60 rounded-xl">
                    <div className="font-bold text-[#102A43]">84.2%</div>
                    <div className="text-[10px] text-slate-500">Resolved On-Time</div>
                  </div>
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                    <div className="font-bold text-[#102A43]">1,420+</div>
                    <div className="text-[10px] text-slate-500">Civic Fixes Completed</div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <Link
                    to="/dashboard"
                    className="text-xs font-bold text-[#2C7A7B] hover:text-[#102A43] inline-flex items-center gap-1"
                  >
                    <span>Open Live Citizen Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Bar */}
      <section className="bg-white border-y border-slate-200/80 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-[#102A43]">1,840+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Problems Reported
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#2C7A7B]">1,520</div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Resolved & Verified
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#F4B942]">18.4 hrs</div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Avg. Resolution Turnaround
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-800">12 Wards</div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Active Municipal Coverage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2C7A7B] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-black text-[#102A43] tracking-tight mt-3">
            How CivicPulse Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            No endless phone holds or lost paper petitions. Report directly to the right municipal team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-[16px] p-6 shadow-xs relative flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F4B942] border border-amber-200 flex items-center justify-center font-black text-lg mb-5">
              <Camera className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Step 01
            </span>
            <h3 className="text-lg font-bold text-[#102A43] mb-2">
              Snap, Pin & Describe
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Take a quick photo of the broken streetlight, pothole, or water leak.
              The app automatically captures GPS coordinates and street address.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-[16px] p-6 shadow-xs relative flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#2C7A7B] border border-teal-200 flex items-center justify-center font-black text-lg mb-5">
              <Building className="w-6 h-6 text-[#2C7A7B]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Step 02
            </span>
            <h3 className="text-lg font-bold text-[#102A43] mb-2">
              Auto-Triage & Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CivicPulse categorizes urgency and routes the ticket directly to the specialized
              field maintenance team and closest engineer.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-[16px] p-6 shadow-xs relative flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-lg mb-5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Step 03
            </span>
            <h3 className="text-lg font-bold text-[#102A43] mb-2">
              Live Fix & Citizen Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive status notifications at every stage. Once field crews upload proof of work,
              the reporting citizen verifies the outcome.
            </p>
          </div>
        </div>
      </section>

      {/* Comprehensive Issue Categories */}
      <section id="categories" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Covered Problem Domains
            </span>
            <h2 className="text-3xl font-black text-[#102A43] tracking-tight mt-3">
              What You Can Report with CivicPulse
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every category is routed directly to certified municipal technicians with explicit SLA response targets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 bg-[#F7F9FC] flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2C7A7B] mb-3 shadow-2xs">
                  <CategoryIcon category={cat.id} className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#102A43] mb-1">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 leading-tight mb-3 flex-1">
                  {cat.description}
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Target SLA:</span>
                  <span className="font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                    ~{cat.avgResolutionHours}h
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#102A43] hover:text-[#2C7A7B] bg-white border border-slate-300 px-5 py-2.5 rounded-xl shadow-xs hover:shadow-sm"
            >
              <span>Submit a problem in any of these categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Tracking & Interactive Timeline Explanation */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2C7A7B] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Unmatched Transparency
            </span>
            <h2 className="text-3xl font-black text-[#102A43] tracking-tight">
              6-Stage Visual Resolution Timeline
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              No black boxes or unanswered tickets. CivicPulse provides a verifiable audit
              trail from initial report through citizen sign-off.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="p-2 rounded-lg bg-teal-50 text-[#2C7A7B] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#102A43]">
                    Live Field Updates
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Engineers post on-site status notes, equipment logs, and estimated completion times.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#102A43]">
                    Before & After Photographic Proof
                  </div>
                  <div className="text-[11px] text-slate-500">
                    High-resolution proof images required before any ticket can be marked resolved.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#102A43]">
                    Citizen Verification & Rating
                  </div>
                  <div className="text-[11px] text-slate-500">
                    The citizen who reported the problem rates the repair and confirms resolution in public view.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-[20px] p-6 shadow-md">
            <h4 className="text-sm font-bold text-[#102A43] mb-4 flex items-center justify-between">
              <span>Standard Resolution Lifecycle</span>
              <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono">
                CP-2026-LIVE
              </span>
            </h4>

            <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative flex items-center pl-8">
                <div className="absolute left-1 w-4 h-4 rounded-full bg-[#2C7A7B] text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </div>
                <div className="text-xs font-semibold text-[#102A43]">
                  1. Reported by Citizen <span className="text-slate-400 font-normal ml-2">Photo & GPS</span>
                </div>
              </div>

              <div className="relative flex items-center pl-8">
                <div className="absolute left-1 w-4 h-4 rounded-full bg-[#2C7A7B] text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </div>
                <div className="text-xs font-semibold text-[#102A43]">
                  2. Under Review <span className="text-slate-400 font-normal ml-2">Safety SLA assigned</span>
                </div>
              </div>

              <div className="relative flex items-center pl-8">
                <div className="absolute left-1 w-4 h-4 rounded-full bg-[#2C7A7B] text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </div>
                <div className="text-xs font-semibold text-[#102A43]">
                  3. Assigned <span className="text-slate-400 font-normal ml-2">Dispatched to specialist</span>
                </div>
              </div>

              <div className="relative flex items-center pl-8">
                <div className="absolute left-1 w-4 h-4 rounded-full bg-[#102A43] text-white flex items-center justify-center text-[9px] font-bold ring-4 ring-teal-100">
                  •
                </div>
                <div className="text-xs font-bold text-[#102A43] bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
                  4. In Progress <span className="text-teal-700 font-semibold ml-2">Crews active on-site</span>
                </div>
              </div>

              <div className="relative flex items-center pl-8 opacity-60">
                <div className="absolute left-1.5 w-3 h-3 rounded-full bg-slate-300" />
                <div className="text-xs text-slate-500">
                  5. Resolved <span className="text-slate-400 ml-2">Proof photo uploaded</span>
                </div>
              </div>

              <div className="relative flex items-center pl-8 opacity-60">
                <div className="absolute left-1.5 w-3 h-3 rounded-full bg-slate-300" />
                <div className="text-xs text-slate-500">
                  6. Verified <span className="text-slate-400 ml-2">Citizen confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact & Testimonials */}
      <section id="testimonials" className="py-16 bg-[#102A43] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4B942] bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Community Voices
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-3">
              Trusted by Citizens and Municipal Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1A365D] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-xs text-slate-200 leading-relaxed italic mb-4">
                "I reported a massive water line burst in front of our bakery. Within 45 minutes,
                Elena from the Water Board arrived with the excavation crew. Fixed before afternoon rush!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Purnima"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-400"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-white">Purnima</div>
                  <div className="text-[10px] text-slate-400">Ward 14 Resident</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1A365D] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-xs text-slate-200 leading-relaxed italic mb-4">
                "CivicPulse gave our road division real-time routing precision. Pothole turnaround
                dropped from 11 days to 48 hours, and citizen satisfaction scores reached an all-time high."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
                  alt="Marcus Vance"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-white">Marcus Vance</div>
                  <div className="text-[10px] text-slate-400">Chief Public Works Officer</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1A365D] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-xs text-slate-200 leading-relaxed italic mb-4">
                "Our neighborhood dark alley had 4 broken lamps. We logged them on CivicPulse with GPS pins,
                and they were re-lamped with LED fixtures the next evening."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                  alt="David Chen"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-400"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-white">David Chen</div>
                  <div className="text-[10px] text-slate-400">Neighborhood Green Society</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#2C7A7B] to-[#234E52] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            See a problem in your street right now?
          </h2>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto">
            Take 60 seconds to log it. Help your city maintenance teams fix it faster.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/report"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F4B942] hover:bg-[#D69E2E] text-[#102A43] font-black text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Report an Issue Now</span>
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#102A43] hover:bg-[#0B1D30] text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              Open Citizen Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Civic Footer */}
      <footer className="bg-[#0B1D30] text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <span className="w-6 h-6 rounded-lg bg-[#2C7A7B] flex items-center justify-center text-xs">
                CP
              </span>
              <span>Civic<span className="text-[#F4B942]">Pulse</span></span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Real-time civic reporting and resolution network bridging community residents and municipal departments.
            </p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Citizens
            </h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/report" className="hover:text-white">Report New Issue</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Citizen Dashboard</Link></li>
              <li><Link to="/my-reports" className="hover:text-white">Track My Reports</Link></li>
              <li><Link to="/nearby" className="hover:text-white">Nearby Problems Map</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Municipal Ops
            </h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/admin" className="hover:text-white">Command Dashboard</Link></li>
              <li><Link to="/admin/issues" className="hover:text-white">Issue Triage & Dispatch</Link></li>
              <li><Link to="/admin/assignments" className="hover:text-white">Field Squads</Link></li>
              <li><Link to="/admin/analytics" className="hover:text-white">City Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              Municipal Resources
            </h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/nearby" className="hover:text-white">Public Resolution Map</Link></li>
              <li><Link to="/login" className="hover:text-white">Staff & Worker Portal</Link></li>
              <li><span className="text-slate-400">Open Data API v1</span></li>
              <li><span className="text-slate-400">Civic Service Standards</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>© 2026 CivicPulse Platform. All rights reserved. Metropolis City Municipal Tech Initiative.</div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Open Data Standards</span>
            <span className="hover:text-white cursor-pointer">Accessibility</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
