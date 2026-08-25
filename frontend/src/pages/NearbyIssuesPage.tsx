import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueCategory, CivicIssue, PriorityLevel, IssueStatus } from '../types';
import { CivicMap } from '../components/common/CivicMap';
import { IssueCard } from '../components/common/IssueCard';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { detectUserLocation, calculateDistanceKm, formatDistance, getMapConfig } from '../services/mapService';
import {
  MapPin,
  Filter,
  Navigation,
  Layers,
  Compass,
  AlertTriangle,
  Radio,
  SlidersHorizontal,
  Crosshair,
} from 'lucide-react';

export const NearbyIssuesPage: React.FC = () => {
  const { issues, categories, showToast } = useApp();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRadius, setSelectedRadius] = useState<number>(3); // in km
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Automatically focus issue if provided in URL
  useEffect(() => {
    if (focusId) {
      const match = issues.find((i) => i.id === focusId);
      if (match) {
        setSelectedIssue(match);
      }
    }
  }, [focusId, issues]);

  // GPS User location detection
  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    try {
      const coords = await detectUserLocation();
      setUserCoords(coords);
      showToast('GPS Location acquired. Filtering issues within range.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not detect location. Using city center.', 'error');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const centerPoint = userCoords || getMapConfig().defaultCenter;

  const safeIssues = Array.isArray(issues) ? issues : [];
  const filteredIssues = safeIssues.filter((issue) => {
    if (!issue) return false;
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
      return false;
    }
    if (selectedPriority !== 'all' && issue.priority !== selectedPriority) {
      return false;
    }
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) {
      return false;
    }
    if (selectedRadius > 0 && issue.location && typeof issue.location.lat === 'number' && typeof issue.location.lng === 'number') {
      const dist = calculateDistanceKm(
        centerPoint.lat,
        centerPoint.lng,
        issue.location.lat,
        issue.location.lng
      );
      if (dist > selectedRadius) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[18px] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2C7A7B] mb-1">
            <Compass className="w-4 h-4" />
            <span>GIS Location Intelligence & Area Coverage</span>
          </div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            City Issues & Geographic Hotspots
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore reported hazards on an interactive map. Filter by category, priority severity, and proximity.
          </p>
        </div>

        {/* Quick GPS Location Detect & Radius Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetectingGps}
            className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#2C7A7B] border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? 'Locating...' : 'My Location'}</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
            {[
              { label: '1 km', value: 1 },
              { label: '3 km', value: 3 },
              { label: '5 km', value: 5 },
              { label: 'All City', value: 0 },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => setSelectedRadius(r.value)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedRadius === r.value
                    ? 'bg-white text-[#102A43] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category & Status Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-3xl">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#102A43] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories ({issues.length})
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === c.id
                  ? 'bg-[#2C7A7B] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CategoryIcon category={c.id} className="w-3.5 h-3.5" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Priority & Status Filters */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Main Map & Issues Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Full Interactive CivicMap */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[18px] p-4 shadow-xs">
          <CivicMap
            issues={filteredIssues}
            height="h-[560px]"
            showFilters={false}
            focusIssueId={selectedIssue?.id}
            selectedLocation={selectedIssue?.location}
            showNearbyRadius={selectedRadius > 0}
            radiusKm={selectedRadius > 0 ? selectedRadius : undefined}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            title="Interactive City Incident Map"
            subtitle={`${filteredIssues.length} matching incidents`}
          />
        </div>

        {/* Right Column: Scrollable List of Issues in this Radius */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2C7A7B]" />
              <span>Visible Issues ({filteredIssues.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {selectedRadius > 0 ? `Within ${selectedRadius} km` : 'Entire Municipality'}
            </span>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[18px] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#102A43]">No Issues In This Radius</h4>
              <p className="text-xs text-slate-500">
                Try widening your search radius or clearing category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setSelectedStatus('all');
                  setSelectedRadius(0);
                }}
                className="px-4 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredIssues.map((issue) => {
                const isSelected = selectedIssue?.id === issue.id;
                const distanceKm = userCoords
                  ? calculateDistanceKm(
                      userCoords.lat,
                      userCoords.lng,
                      issue.location.lat,
                      issue.location.lng
                    )
                  : null;

                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-[#2C7A7B] rounded-[18px] shadow-sm transform scale-[1.01]'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="relative">
                      {distanceKm !== null && (
                        <div className="absolute top-3 right-3 z-10 bg-teal-50 border border-teal-200 text-[#2C7A7B] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                          {formatDistance(distanceKm)} away
                        </div>
                      )}
                      <IssueCard issue={issue} compact />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

