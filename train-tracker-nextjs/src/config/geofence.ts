export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoFenceZone {
  id: string;
  name: string;
  description: string;
  polygon: GeoPoint[];
  isTestZone?: boolean;  // Flag for test zones
  isActive: boolean;
}

// Configure your geo-fence zones here
// Coordinates extracted from coords.kml
export const GEOFENCE_ZONES: GeoFenceZone[] = [
  {
    id: 'train-crossings',
    name: 'Train Crossings Area',
    description: 'Main area covering both train crossings (Track Area 1)',
    isActive: true,
    polygon: [
      // Coordinates from "track area 1" in KML (converted from lng,lat to lat,lng)
      { lat: 40.9231843, lng: -96.5221398 },
      { lat: 40.9198767, lng: -96.5299718 },
      { lat: 40.9180931, lng: -96.5309159 },
      { lat: 40.9129692, lng: -96.5407436 },
      { lat: 40.9096935, lng: -96.5373962 },
      { lat: 40.9122881, lng: -96.5317313 },
      { lat: 40.9155312, lng: -96.5244357 },
      { lat: 40.9176878, lng: -96.518728 },
      { lat: 40.9232978, lng: -96.518964 },
      { lat: 40.9231843, lng: -96.5221398 }, // Close the polygon
    ]
  },
  {
    id: 'test-home',
    name: 'Test Zone - Home',
    description: 'Test zone for development (House Area)',
    isTestZone: true,
    isActive: true,
    polygon: [
      // House area centered on your actual GPS coordinates
      { lat: 40.9245, lng: -96.5275 },  // NW - around your location
      { lat: 40.9235, lng: -96.5275 },  // SW
      { lat: 40.9235, lng: -96.5265 },  // SE
      { lat: 40.9245, lng: -96.5265 },  // NE
      { lat: 40.9245, lng: -96.5275 },  // Close the polygon
    ]
  }
];

// Configuration settings
export const GEOFENCE_CONFIG = {
  // Allow test zones in development mode
  allowTestZones: process.env.NODE_ENV === 'development',

  // Minimum GPS accuracy required (in meters)
  minAccuracyMeters: 100,

  // Whether to enforce geo-fence
  // Can be toggled via NEXT_PUBLIC_ENFORCE_GEOFENCE environment variable
  // Set to 'false' in .env.local to disable location requirements for testing
  // Set to 'true' or remove the variable to enable location enforcement in production
  enforceGeofence: process.env.NEXT_PUBLIC_ENFORCE_GEOFENCE !== 'false',

  // Show debug information in console
  debug: process.env.NODE_ENV === 'development'
};