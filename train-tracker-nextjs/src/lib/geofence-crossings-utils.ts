import { CrossingPoint, TRAIN_CROSSINGS, CROSSING_GEOFENCE_CONFIG } from '@/config/geofence-crossings';

/**
 * Calculate distance between two points in meters using Haversine formula
 * @param lat1 First point latitude
 * @param lng1 First point longitude
 * @param lat2 Second point latitude
 * @param lng2 Second point longitude
 * @returns Distance in meters
 */
export function calculateDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Find the nearest crossing and its distance from the user
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @returns Nearest crossing info or null if no crossings configured
 */
export function getNearestCrossing(
  userLat: number,
  userLng: number
): {
  crossing: CrossingPoint;
  distance: number;
} | null {
  if (TRAIN_CROSSINGS.length === 0) return null;

  let nearestCrossing = TRAIN_CROSSINGS[0];
  let minDistance = Infinity;

  for (const crossing of TRAIN_CROSSINGS) {
    const distance = calculateDistanceInMeters(
      userLat,
      userLng,
      crossing.lat,
      crossing.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestCrossing = crossing;
    }
  }

  return {
    crossing: nearestCrossing,
    distance: minDistance
  };
}

/**
 * Check if user is within range of any train crossing
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param accuracy GPS accuracy in meters
 * @returns Validation result with details
 */
export function validateCrossingGeofence(
  latitude: number,
  longitude: number,
  accuracy: number
): {
  isValid: boolean;
  isInRange: boolean;
  nearestCrossing: CrossingPoint | null;
  distanceToNearest: number | null;
  reason?: string;
  debug?: {
    userLocation: { lat: number; lng: number };
    accuracy: number;
    distances: Array<{ crossing: string; distance: number }>;
    configEnforced: boolean;
    maxAllowedDistance: number;
  };
} {
  // Check if geo-fence is enforced
  if (!CROSSING_GEOFENCE_CONFIG.enforceGeofence) {
    return {
      isValid: true,
      isInRange: false,
      nearestCrossing: null,
      distanceToNearest: null,
      reason: 'Geo-fence validation disabled',
      debug: CROSSING_GEOFENCE_CONFIG.debug ? {
        userLocation: { lat: latitude, lng: longitude },
        accuracy,
        distances: [],
        configEnforced: false,
        maxAllowedDistance: CROSSING_GEOFENCE_CONFIG.maxDistanceMeters
      } : undefined
    };
  }

  // Check GPS accuracy
  if (accuracy > CROSSING_GEOFENCE_CONFIG.minAccuracyMeters) {
    return {
      isValid: false,
      isInRange: false,
      nearestCrossing: null,
      distanceToNearest: null,
      reason: `GPS accuracy too low (${Math.round(accuracy)}m). Need ${CROSSING_GEOFENCE_CONFIG.minAccuracyMeters}m or better.`,
      debug: CROSSING_GEOFENCE_CONFIG.debug ? {
        userLocation: { lat: latitude, lng: longitude },
        accuracy,
        distances: [],
        configEnforced: true,
        maxAllowedDistance: CROSSING_GEOFENCE_CONFIG.maxDistanceMeters
      } : undefined
    };
  }


  // Calculate distances to all crossings
  const distances: Array<{ crossing: CrossingPoint; distance: number }> = [];
  let nearestCrossing: CrossingPoint | null = null;
  let minDistance = Infinity;
  let isWithinRange = false;

  for (const crossing of TRAIN_CROSSINGS) {
    const distance = calculateDistanceInMeters(
      latitude,
      longitude,
      crossing.lat,
      crossing.lng
    );

    distances.push({ crossing, distance });

    if (distance < minDistance) {
      minDistance = distance;
      nearestCrossing = crossing;
    }

    // Check if within range of this crossing
    if (distance <= CROSSING_GEOFENCE_CONFIG.maxDistanceMeters) {
      isWithinRange = true;
    }
  }

  // Prepare debug information
  const debugInfo = CROSSING_GEOFENCE_CONFIG.debug ? {
    userLocation: { lat: latitude, lng: longitude },
    accuracy,
    distances: distances.map(d => ({
      crossing: d.crossing.name,
      distance: Math.round(d.distance)
    })),
    configEnforced: true,
    maxAllowedDistance: CROSSING_GEOFENCE_CONFIG.maxDistanceMeters
  } : undefined;

  if (!isWithinRange) {
    return {
      isValid: false,
      isInRange: false,
      nearestCrossing,
      distanceToNearest: minDistance,
      reason: `Too far from train crossings (${Math.round(minDistance)}m away). Must be within ${CROSSING_GEOFENCE_CONFIG.maxDistanceMeters}m.`,
      debug: debugInfo
    };
  }

  // User is within range of at least one crossing
  return {
    isValid: true,
    isInRange: true,
    nearestCrossing,
    distanceToNearest: minDistance,
    reason: `Within range of ${nearestCrossing?.name} (${Math.round(minDistance)}m away)`,
    debug: debugInfo
  };
}

/**
 * Get a user-friendly description of the distance to crossings
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @returns Human-readable distance description
 */
export function getDistanceDescription(latitude: number, longitude: number): string {
  const nearest = getNearestCrossing(latitude, longitude);

  if (!nearest) {
    return 'No crossings configured';
  }

  const distanceInMeters = Math.round(nearest.distance);

  if (distanceInMeters < 100) {
    return `Very close to ${nearest.crossing.name}`;
  } else if (distanceInMeters < 500) {
    return `${distanceInMeters}m from ${nearest.crossing.name}`;
  } else if (distanceInMeters < 1000) {
    return `${distanceInMeters}m from ${nearest.crossing.name}`;
  } else {
    const distanceInKm = (distanceInMeters / 1000).toFixed(1);
    return `${distanceInKm}km from ${nearest.crossing.name}`;
  }
}