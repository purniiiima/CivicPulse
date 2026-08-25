import { LocationInfo, MapCoordinates, IssuePriority, IssueCategory, IssueStatus, CivicIssue } from '../types';

export interface MapConfig {
  provider: 'leaflet' | 'openstreetmap' | 'carto' | 'custom_mock';
  defaultCenter: MapCoordinates;
  defaultZoom: number;
}

export const getMapConfig = (): MapConfig => {
  const providerEnv = (import.meta.env.VITE_MAP_PROVIDER || 'leaflet').toLowerCase();
  const validProvider: MapConfig['provider'] = 
    providerEnv === 'carto' ? 'carto' :
    providerEnv === 'openstreetmap' ? 'openstreetmap' :
    providerEnv === 'custom_mock' ? 'custom_mock' : 'leaflet';

  const defaultLat = parseFloat(import.meta.env.VITE_DEFAULT_MAP_LAT || '28.6139');
  const defaultLng = parseFloat(import.meta.env.VITE_DEFAULT_MAP_LNG || '77.2090');
  const defaultZoom = parseInt(import.meta.env.VITE_DEFAULT_MAP_ZOOM || '12', 10);

  return {
    provider: validProvider,
    defaultCenter: {
      lat: isNaN(defaultLat) ? 28.6139 : defaultLat,
      lng: isNaN(defaultLng) ? 77.2090 : defaultLng,
    },
    defaultZoom: isNaN(defaultZoom) ? 12 : defaultZoom,
  };
};

/**
 * Calculates great-circle distance between two geographic coordinates (Haversine formula in KM)
 */
export const calculateDistanceKm = (
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number => {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return Infinity;
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Human-friendly distance display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

/**
 * Priority marker presentation styling
 * Low → subtle
 * Medium → standard
 * High → prominent
 * Critical / Urgent → clearly highlighted
 */
export interface PriorityMarkerStyle {
  label: string;
  bgHex: string;
  borderHex: string;
  glowClass: string;
  pulse: boolean;
  sizeClass: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  level: 'subtle' | 'standard' | 'prominent' | 'critical';
}

export const getPriorityMarkerStyle = (priority: IssuePriority): PriorityMarkerStyle => {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Critical Priority',
        bgHex: '#E53E3E',
        borderHex: '#9B2C2C',
        glowClass: 'ring-4 ring-red-500/40 shadow-lg shadow-red-500/50',
        pulse: true,
        sizeClass: 'w-10 h-10',
        badgeBg: 'bg-red-100 border-red-300',
        badgeText: 'text-red-800',
        badgeLabel: 'CRITICAL',
        level: 'critical',
      };
    case 'high':
      return {
        label: 'High Priority',
        bgHex: '#DD6B20',
        borderHex: '#9C4221',
        glowClass: 'ring-3 ring-orange-400/40 shadow-md shadow-orange-500/30',
        pulse: false,
        sizeClass: 'w-9 h-9',
        badgeBg: 'bg-orange-100 border-orange-300',
        badgeText: 'text-orange-800',
        badgeLabel: 'HIGH',
        level: 'prominent',
      };
    case 'medium':
      return {
        label: 'Medium Priority',
        bgHex: '#D69E2E',
        borderHex: '#975A16',
        glowClass: 'ring-2 ring-amber-300/40 shadow-sm',
        pulse: false,
        sizeClass: 'w-8 h-8',
        badgeBg: 'bg-amber-100 border-amber-300',
        badgeText: 'text-amber-800',
        badgeLabel: 'MEDIUM',
        level: 'standard',
      };
    case 'low':
    default:
      return {
        label: 'Low Priority',
        bgHex: '#4A5568',
        borderHex: '#2D3748',
        glowClass: 'ring-1 ring-slate-300 shadow-xs opacity-90',
        pulse: false,
        sizeClass: 'w-7 h-7',
        badgeBg: 'bg-slate-100 border-slate-300',
        badgeText: 'text-slate-700',
        badgeLabel: 'LOW',
        level: 'subtle',
      };
  }
};

/**
 * Reverse Geocode coordinates to address
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<LocationInfo> => {
  const roundedLat = Number(lat.toFixed(5));
  const roundedLng = Number(lng.toFixed(5));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${roundedLat}&lon=${roundedLng}&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const road = addr.road || addr.street || addr.pedestrian || addr.cycleway || addr.suburb || 'Civic Corridor';
      const houseNumber = addr.house_number || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.city_district || 'Metropolitan Ward';
      const city = addr.city || addr.town || addr.municipality || 'Metropolis City';
      const postalCode = addr.postcode || '94103';

      const fullAddress = houseNumber ? `${houseNumber} ${road}` : road;

      return {
        address: fullAddress || `${roundedLat}, ${roundedLng}`,
        landmark: addr.building || addr.amenity || `Near ${suburb}`,
        wardOrZone: `${suburb}`,
        area: `${suburb}`,
        city: city,
        lat: roundedLat,
        lng: roundedLng,
        latitude: roundedLat,
        longitude: roundedLng,
        postalCode: postalCode,
      };
    }
  } catch {
    // Fallback to local deterministic location generator
  }

  // Graceful fallback for offline / rate-limited reverse geocoding
  const streets = [
    'Oakridge Blvd',
    'Pine Street',
    'Elm Avenue',
    'Market Parkway',
    'Mission Crossing',
    'Beacon Hill Road',
    'Riverside Drive',
    'Valencia Expressway',
    'Grandview Avenue',
    'Highland Way'
  ];
  const wards = [
    'Ward 14 - Central Metro',
    'Ward 3 - North Hills',
    'Ward 8 - East Bay Corridor',
    'Ward 5 - Westside Downtown',
    'Ward 12 - Southside District',
  ];

  const hash = Math.abs(Math.sin(lat * 1000 + lng * 1000));
  const streetIndex = Math.floor(hash * streets.length) % streets.length;
  const wardIndex = Math.floor((hash * 10) % wards.length);
  const houseNo = 100 + Math.floor(hash * 800);

  const ward = wards[wardIndex];
  const address = `${houseNo} ${streets[streetIndex]}`;

  return {
    address,
    landmark: `Near ${streets[(streetIndex + 1) % streets.length]} Junction`,
    wardOrZone: ward,
    area: ward,
    city: 'Metropolis City',
    lat: roundedLat,
    lng: roundedLng,
    latitude: roundedLat,
    longitude: roundedLng,
    postalCode: '94103',
  };
};

/**
 * Browser Geolocation Detector
 */
export const detectUserLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const loc = await reverseGeocode(latitude, longitude);
          resolve(loc);
        } catch {
          resolve({
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            wardOrZone: 'Current GPS Location',
            area: 'Current GPS Location',
            city: 'Current Area',
            lat: latitude,
            lng: longitude,
            latitude,
            longitude,
          });
        }
      },
      (error) => {
        // Fallback default city center coordinate if user denies or timeout
        console.warn('Geolocation failed/denied:', error.message);
        const defaultLoc: LocationInfo = {
          address: 'Connaught Place Civic Boulevard',
          landmark: 'Central Civic Plaza',
          wardOrZone: 'Ward 14 - Central Metro',
          area: 'Ward 14 - Central Metro',
          city: 'Metropolis City',
          lat: 28.6139,
          lng: 77.2090,
          latitude: 28.6139,
          longitude: 77.2090,
          postalCode: '110001',
        };
        resolve(defaultLoc);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
};
