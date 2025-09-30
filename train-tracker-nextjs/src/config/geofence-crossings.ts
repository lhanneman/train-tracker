export interface CrossingPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Define the two train crossing locations
export const TRAIN_CROSSINGS: CrossingPoint[] = [
  {
    id: 'crossing-west',
    name: 'West Crossing',
    lat: 40.916109,
    lng: -96.529647,
  },
  {
    id: 'crossing-east',
    name: 'East Crossing',
    lat: 40.920600,  
    lng: -96.520912
  },
  // {
  //   id: 'crossing-test',
  //   name: 'Test Crossing',
  //   lat: 40.924040,  
  //   lng: -96.526827
  // }
];

// Configuration for distance-based geofencing
export const CROSSING_GEOFENCE_CONFIG = {
  // Maximum distance from a crossing to allow reports (in meters)
  maxDistanceMeters: 500, // Adjust this value as needed (e.g., 200m, 500m, etc.)

  // Minimum GPS accuracy required (in meters)
  minAccuracyMeters: 100,

  // Whether to enforce geo-fence (always enabled in production)
  enforceGeofence: true,

  // Show debug information in console
  debug: process.env.NODE_ENV === 'development'
};