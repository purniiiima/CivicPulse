import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import {
  CivicIssue,
  LocationInfo,
  IssueCategory,
  IssuePriority,
  IssueStatus,
} from '../../types';
import {
  getMapConfig,
  getPriorityMarkerStyle,
  reverseGeocode,
  detectUserLocation,
  calculateDistanceKm,
  formatDistance,
} from '../../services/mapService';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryIcon } from './CategoryIcon';
import {
  MapPin,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  Check,
  AlertTriangle,
  ExternalLink,
  ThumbsUp,
  X,
  Compass,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export interface CivicMapProps {
  issues?: CivicIssue[];
  selectedLocation?: LocationInfo;
  onSelectLocation?: (loc: LocationInfo) => void;
  isPicker?: boolean;
  allowMarkerDrag?: boolean;
  selectedIssueId?: string;
  onSelectIssue?: (issue: CivicIssue) => void;
  showFilters?: boolean;
  showNearbyRadius?: boolean;
  radiusKm?: number;
  height?: string;
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  title?: string;
  subtitle?: string;
  focusIssueId?: string;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  issues = [],
  selectedLocation,
  onSelectLocation,
  isPicker = false,
  allowMarkerDrag = true,
  selectedIssueId,
  onSelectIssue,
  showFilters = false,
  showNearbyRadius = false,
  radiusKm = 2,
  height = 'h-96',
  className = '',
  center,
  zoom,
  title,
  subtitle,
  focusIssueId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  const mapConfig = useMemo(() => getMapConfig(), []);

  // UI States
  const [activePopupIssue, setActivePopupIssue] = useState<CivicIssue | null>(() => {
    if (selectedIssueId) return issues.find((i) => i.id === selectedIssueId) || null;
    if (focusIssueId) return issues.find((i) => i.id === focusIssueId) || null;
    return null;
  });

  const [currentMapType, setCurrentMapType] = useState<'streets' | 'carto' | 'satellite'>('carto');
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filters State (for Admin & Explorer modes)
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Center and Zoom state
  const defaultCenter = center || {
    lat: selectedLocation?.lat || (issues.length > 0 ? issues[0].location.lat : mapConfig.defaultCenter.lat),
    lng: selectedLocation?.lng || (issues.length > 0 ? issues[0].location.lng : mapConfig.defaultCenter.lng),
  };

  // Filtered Issues list
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesTracking = issue.trackingNumber.toLowerCase().includes(query);
        const matchesAddress = issue.location.address.toLowerCase().includes(query);
        const matchesArea = issue.location.wardOrZone.toLowerCase().includes(query);
        if (!matchesTitle && !matchesTracking && !matchesAddress && !matchesArea) {
          return false;
        }
      }
      return true;
    });
  }, [issues, categoryFilter, priorityFilter, statusFilter, searchQuery]);

  // Helper to create priority-coded SVG HTML for custom Leaflet markers
  const createMarkerHtml = (issue: CivicIssue, isSelected: boolean) => {
    const priorityStyle = getPriorityMarkerStyle(issue.priority);
    const categoryName = issue.category.replace('_', ' ');

    let badgeIcon = '📍';
    if (issue.category === 'potholes') badgeIcon = '🕳️';
    else if (issue.category === 'streetlights') badgeIcon = '💡';
    else if (issue.category === 'garbage') badgeIcon = '🗑️';
    else if (issue.category === 'water_leakage') badgeIcon = '💧';
    else if (issue.category === 'damaged_roads') badgeIcon = '🚧';
    else if (issue.category === 'drainage') badgeIcon = '🌊';
    else if (issue.category === 'parks') badgeIcon = '🌳';
    else if (issue.category === 'electricity') badgeIcon = '⚡';

    const isUrgent = issue.priority === 'urgent';
    const isHigh = issue.priority === 'high';

    return `
      <div class="relative group cursor-pointer flex flex-col items-center transform transition-transform duration-200 hover:scale-110 ${
        isSelected ? 'scale-125 z-50' : 'z-20'
      }">
        <!-- Pulse ring for critical/urgent issues -->
        ${
          isUrgent
            ? `<div class="absolute -inset-2 rounded-full bg-red-500/40 animate-ping"></div>`
            : ''
        }
        
        <!-- Main Marker Pin -->
        <div class="relative flex items-center justify-center ${
          isUrgent
            ? 'w-10 h-10 bg-red-600 ring-4 ring-red-400/50 shadow-lg shadow-red-600/40'
            : isHigh
            ? 'w-9 h-9 bg-orange-600 ring-3 ring-orange-300/60 shadow-md shadow-orange-600/30'
            : issue.priority === 'medium'
            ? 'w-8 h-8 bg-amber-500 ring-2 ring-amber-200 shadow-sm'
            : 'w-7 h-7 bg-slate-700 ring-1 ring-slate-400 opacity-90'
        } rounded-full text-white text-xs font-bold border-2 border-white transition-all">
          <span class="text-sm select-none leading-none">${badgeIcon}</span>

          <!-- Priority Indicator Pip -->
          <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
            isUrgent
              ? 'bg-rose-900 animate-pulse'
              : isHigh
              ? 'bg-amber-400'
              : issue.priority === 'medium'
              ? 'bg-yellow-300'
              : 'bg-slate-400'
          }"></span>
        </div>

        <!-- Pin Tip Pointer -->
        <div class="w-2 h-2 -mt-1 rotate-45 ${
          isUrgent ? 'bg-red-600' : isHigh ? 'bg-orange-600' : issue.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-700'
        } border-r border-b border-white"></div>
      </div>
    `;
  };

  // Helper to create custom draggable location picker pin
  const createPickerPinHtml = () => {
    return `
      <div class="relative cursor-grab active:cursor-grabbing flex flex-col items-center -mt-6">
        <div class="absolute -inset-3 rounded-full bg-[#2C7A7B]/30 animate-ping"></div>
        <div class="relative w-11 h-11 bg-[#2C7A7B] text-white rounded-full flex items-center justify-center shadow-xl border-3 border-white ring-4 ring-[#2C7A7B]/40">
          <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div class="w-3 h-3 -mt-1.5 rotate-45 bg-[#2C7A7B] border-r-2 border-b-2 border-white"></div>
        <div class="mt-1 px-2.5 py-0.5 bg-[#102A43] text-[#F4B942] text-[10px] font-extrabold rounded-full shadow-md whitespace-nowrap border border-[#F4B942]/30">
          📍 Drag or Click to Move Pin
        </div>
      </div>
    `;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = center?.lat || selectedLocation?.lat || mapConfig.defaultCenter.lat;
    const initialLng = center?.lng || selectedLocation?.lng || mapConfig.defaultCenter.lng;
    const initialZoom = zoom || mapConfig.defaultZoom || 14;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Tile Layers
    const tileLayers = {
      carto: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }),
      streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }),
    };

    tileLayers[currentMapType].addTo(map);

    // Create marker layers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Handle Map Click in Location Picker Mode
    if (isPicker) {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        handleLocationChange(lat, lng);
      });
    }

    // Resize observer to ensure map renders smoothly on container layout changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when currentMapType changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (currentMapType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);
    } else if (currentMapType === 'streets') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
    }
  }, [currentMapType]);

  // Handle Location Change (Reverse Geocode & Callback)
  const handleLocationChange = useCallback(
    async (lat: number, lng: number) => {
      setIsAddressLoading(true);
      try {
        const locInfo = await reverseGeocode(lat, lng);
        if (onSelectLocation) {
          onSelectLocation(locInfo);
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
      } finally {
        setIsAddressLoading(false);
      }
    },
    [onSelectLocation]
  );

  // Render & Update Location Picker Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !isPicker) return;
    const map = mapInstanceRef.current;

    const targetLat = selectedLocation?.lat || mapConfig.defaultCenter.lat;
    const targetLng = selectedLocation?.lng || mapConfig.defaultCenter.lng;

    if (!pickerMarkerRef.current) {
      const pickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: createPickerPinHtml(),
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      const marker = L.marker([targetLat, targetLng], {
        icon: pickerIcon,
        draggable: allowMarkerDrag,
        zIndexOffset: 1000,
      }).addTo(map);

      if (allowMarkerDrag) {
        marker.on('dragend', (e) => {
          const markerPos = e.target.getLatLng();
          handleLocationChange(markerPos.lat, markerPos.lng);
        });
      }

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLatLng([targetLat, targetLng]);
    }

    // Render Nearby Radius Circle
    if (showNearbyRadius) {
      if (!radiusCircleRef.current) {
        radiusCircleRef.current = L.circle([targetLat, targetLng], {
          radius: radiusKm * 1000,
          color: '#2C7A7B',
          fillColor: '#2C7A7B',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '4, 6',
        }).addTo(map);
      } else {
        radiusCircleRef.current.setLatLng([targetLat, targetLng]);
        radiusCircleRef.current.setRadius(radiusKm * 1000);
      }
    }
  }, [selectedLocation, isPicker, allowMarkerDrag, showNearbyRadius, radiusKm, handleLocationChange]);

  // Render Issue Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    filteredIssues.forEach((issue) => {
      const lat = issue.location?.lat;
      const lng = issue.location?.lng;
      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
        return; // Skip rendering marker if coordinates are null/not set (e.g. manual location)
      }

      const isSelected = activePopupIssue?.id === issue.id;
      const markerHtml = createMarkerHtml(issue, isSelected);

      const customIcon = L.divIcon({
        className: 'custom-issue-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
      });

      marker.on('click', () => {
        setActivePopupIssue(issue);
        if (onSelectIssue) onSelectIssue(issue);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng], {
            animate: true,
            duration: 0.5,
          });
        }
      });

      marker.addTo(markersLayer);
    });
  }, [filteredIssues, activePopupIssue, onSelectIssue]);

  // Focus on specific issue if passed
  useEffect(() => {
    if (focusIssueId && mapInstanceRef.current) {
      const issue = issues.find((i) => i.id === focusIssueId);
      if (issue && issue.location?.lat != null && issue.location?.lng != null && !isNaN(issue.location.lat) && !isNaN(issue.location.lng)) {
        setActivePopupIssue(issue);
        mapInstanceRef.current.setView([issue.location.lat, issue.location.lng], 16, {
          animate: true,
        });
      }
    }
  }, [focusIssueId, issues]);

  // GPS Locate Current Location
  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const location = await detectUserLocation();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([location.lat, location.lng], 16, {
          animate: true,
        });
      }
      if (onSelectLocation) {
        onSelectLocation(location);
      }
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([defaultCenter.lat, defaultCenter.lng], zoom || 14, {
        animate: true,
      });
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[20px] border border-slate-200/90 shadow-soft-sm bg-slate-100 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : height
      } ${className}`}
    >
      {/* Map Header / Overlay Banner */}
      {(title || showFilters || isPicker) && (
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Title and stats pill */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2C7A7B] animate-pulse"></div>
            <div>
              <span className="font-extrabold text-[#102A43]">{title || 'Municipal Issue Map'}</span>
              {subtitle && <span className="text-[11px] text-slate-500 ml-1.5 hidden sm:inline">{subtitle}</span>}
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 border border-slate-200">
              {filteredIssues.length} issues
            </span>
          </div>

          {/* Quick Filter Buttons & Layer Switcher */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {showFilters && (
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className={`px-3 py-1.5 rounded-xl shadow-md border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterDrawerOpen || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                    ? 'bg-[#102A43] text-white border-[#102A43]'
                    : 'bg-white/95 text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {(categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-[#F4B942]"></span>
                )}
              </button>
            )}

            {/* Map Layer Switcher */}
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setCurrentMapType('carto')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  currentMapType === 'carto' ? 'bg-[#2C7A7B] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Light Vector Map"
              >
                Vector
              </button>
              <button
                type="button"
                onClick={() => setCurrentMapType('streets')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  currentMapType === 'streets' ? 'bg-[#2C7A7B] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Street Map"
              >
                Streets
              </button>
              <button
                type="button"
                onClick={() => setCurrentMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  currentMapType === 'satellite' ? 'bg-[#2C7A7B] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Satellite View"
              >
                Satellite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Drawer / Popover (Admin / Explorer Mode) */}
      {filterDrawerOpen && (
        <div className="absolute top-16 left-3 z-40 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 text-xs space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-extrabold text-[#102A43] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#2C7A7B]" />
              <span>Filter Map Markers</span>
            </h4>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, tracking #, area..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Issue Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
            >
              <option value="all">All Categories</option>
              <option value="potholes">Potholes & Road Cracks</option>
              <option value="streetlights">Streetlights & Lighting</option>
              <option value="garbage">Garbage & Sanitation</option>
              <option value="water_leakage">Water Leakage & Mains</option>
              <option value="drainage">Drainage & Stormwater</option>
              <option value="damaged_roads">Damaged Roads & Footpaths</option>
              <option value="parks">Parks & Public Recreation</option>
              <option value="electricity">Power Grid & Electrical</option>
              <option value="other">Other Civic Issues</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority Urgency</label>
            <div className="grid grid-cols-4 gap-1">
              {(['all', 'urgent', 'high', 'medium', 'low'] as const).slice(0, 5).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`py-1 text-[10px] font-bold rounded-lg uppercase transition-all ${
                    priorityFilter === p
                      ? p === 'urgent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : p === 'high'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : p === 'medium'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : p === 'low'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-[#102A43] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p === 'urgent' ? 'Critical' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Resolution Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2C7A7B]"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported (New)</option>
              <option value="under_review">Under Review / Triaged</option>
              <option value="assigned">Assigned to Crew</option>
              <option value="in_progress">In Progress (Active Work)</option>
              <option value="resolved">Resolved</option>
              <option value="verified">Verified by Citizen</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
            >
              Reset Filters
            </button>
            <span className="text-[11px] font-semibold text-[#2C7A7B]">
              Showing {filteredIssues.length} of {issues.length}
            </span>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[260px] z-10" />

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute right-3 bottom-6 z-30 flex flex-col gap-2 pointer-events-auto">
        {/* GPS Locate Me */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-[#2C7A7B] hover:bg-slate-50 flex items-center justify-center transition-all disabled:opacity-50"
          title="Detect My Location (GPS)"
        >
          <Navigation className={`w-4 h-4 text-[#2C7A7B] ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset View */}
        <button
          type="button"
          onClick={handleResetView}
          className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all"
          title="Reset Map Center"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Priority Legend Pill (Bottom Left) */}
      <div className="absolute left-3 bottom-3 z-30 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 text-[10px] font-bold text-slate-600 pointer-events-auto">
        <span className="text-slate-400 font-medium">Priority:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>Critical</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>High</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Medium</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          <span>Low</span>
        </span>
      </div>

      {/* Interactive Issue Preview Card / Modal (When a marker is clicked) */}
      {activePopupIssue && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 z-40 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-[#102A43]">
                <CategoryIcon category={activePopupIssue.category} className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{activePopupIssue.trackingNumber}
                </span>
                <h4 className="text-xs font-bold text-[#102A43] line-clamp-1 leading-snug">
                  {activePopupIssue.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setActivePopupIssue(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Issue Photo & Location Details */}
          <div className="flex gap-3 text-xs">
            {activePopupIssue.photos && activePopupIssue.photos.length > 0 && (
              <img
                src={activePopupIssue.photos[0]}
                alt={activePopupIssue.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="flex-1 min-w-0 space-y-1 text-slate-600 text-[11px]">
              <p className="flex items-center gap-1 font-semibold text-[#102A43] truncate">
                <MapPin className="w-3.5 h-3.5 text-[#2C7A7B] shrink-0" />
                <span className="truncate">{activePopupIssue.location.address}</span>
              </p>
              <p className="text-slate-500 truncate">
                {activePopupIssue.location.wardOrZone} • {activePopupIssue.location.city}
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <StatusBadge status={activePopupIssue.status} />
                <PriorityBadge priority={activePopupIssue.priority} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
              <span>{activePopupIssue.upvotes} Citizens upvoted</span>
            </div>
            <Link
              to={`/issues/${activePopupIssue.id}`}
              className="px-3.5 py-1.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
            >
              <span>View Details</span>
              <ExternalLink className="w-3 h-3 text-[#F4B942]" />
            </Link>
          </div>
        </div>
      )}

      {/* Geocoding Loading Indicator */}
      {isAddressLoading && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-[#102A43] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F4B942] animate-ping" />
          <span>Resolving Address & Coordinates...</span>
        </div>
      )}
    </div>
  );
};
