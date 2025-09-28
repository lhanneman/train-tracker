import { GeoPoint, GeoFenceZone, GEOFENCE_ZONES, GEOFENCE_CONFIG } from '@/config/geofence';

/**
 * Check if a point is inside a polygon using the ray casting algorithm
 * @param point The point to check
 * @param polygon The polygon vertices
 * @returns true if the point is inside the polygon
 */
export function isPointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Find which geo-fence zones contain a given point
 * @param point The point to check
 * @param includeTestZones Whether to include test zones in the check
 * @returns Array of zones that contain the point
 */
export function getContainingZones(
  point: GeoPoint,
  includeTestZones: boolean = GEOFENCE_CONFIG.allowTestZones
): GeoFenceZone[] {
  return GEOFENCE_ZONES.filter(zone => {
    // Skip inactive zones
    if (!zone.isActive) return false;

    // Skip test zones in production unless explicitly included
    if (zone.isTestZone && !includeTestZones) return false;

    // Check if point is in polygon
    return isPointInPolygon(point, zone.polygon);
  });
}

/**
 * Check if a location is within any valid geo-fence
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param accuracy GPS accuracy in meters
 * @returns Validation result with details
 */
export function validateGeofence(
  latitude: number,
  longitude: number,
  accuracy: number
): {
  isValid: boolean;
  isInZone: boolean;
  zones: GeoFenceZone[];
  reason?: string;
  debug?: {
    point: GeoPoint;
    accuracy: number;
    configEnforced: boolean;
  };
} {
  const point: GeoPoint = { lat: latitude, lng: longitude };

  // Check if geo-fence is enforced
  if (!GEOFENCE_CONFIG.enforceGeofence) {
    return {
      isValid: true,
      isInZone: false,
      zones: [],
      reason: 'Geo-fence validation disabled',
      debug: GEOFENCE_CONFIG.debug ? {
        point,
        accuracy,
        configEnforced: false
      } : undefined
    };
  }

  // Check GPS accuracy
  if (accuracy > GEOFENCE_CONFIG.minAccuracyMeters) {
    return {
      isValid: false,
      isInZone: false,
      zones: [],
      reason: `GPS accuracy too low (${Math.round(accuracy)}m). Need ${GEOFENCE_CONFIG.minAccuracyMeters}m or better.`,
      debug: GEOFENCE_CONFIG.debug ? {
        point,
        accuracy,
        configEnforced: true
      } : undefined
    };
  }

  // Check which zones contain the point
  const containingZones = getContainingZones(point);

  if (containingZones.length === 0) {
    return {
      isValid: false,
      isInZone: false,
      zones: [],
      reason: 'You must be near the train tracks to submit a report',
      debug: GEOFENCE_CONFIG.debug ? {
        point,
        accuracy,
        configEnforced: true
      } : undefined
    };
  }

  // Valid - user is in at least one zone
  const zoneNames = containingZones.map(z => z.name).join(', ');
  const isTestZone = containingZones.some(z => z.isTestZone);

  return {
    isValid: true,
    isInZone: true,
    zones: containingZones,
    reason: isTestZone
      ? `In test zone: ${zoneNames}`
      : `Within reporting zone: ${zoneNames}`,
    debug: GEOFENCE_CONFIG.debug ? {
      point,
      accuracy,
      configEnforced: true
    } : undefined
  };
}

/**
 * Calculate the center point of a polygon
 * Useful for displaying on maps or calculating distances
 */
export function getPolygonCenter(polygon: GeoPoint[]): GeoPoint {
  let latSum = 0;
  let lngSum = 0;

  for (const point of polygon) {
    latSum += point.lat;
    lngSum += point.lng;
  }

  return {
    lat: latSum / polygon.length,
    lng: lngSum / polygon.length
  };
}

/**
 * Calculate approximate distance between two points in meters
 * Uses Haversine formula
 */
export function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = point1.lat * Math.PI / 180;
  const lat2Rad = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get the nearest zone to a given point
 * Returns null if no zones are configured
 */
export function getNearestZone(point: GeoPoint): {
  zone: GeoFenceZone;
  distance: number;
} | null {
  const activeZones = GEOFENCE_ZONES.filter(z =>
    z.isActive && (!z.isTestZone || GEOFENCE_CONFIG.allowTestZones)
  );

  if (activeZones.length === 0) return null;

  let nearestZone = activeZones[0];
  let minDistance = Infinity;

  for (const zone of activeZones) {
    const center = getPolygonCenter(zone.polygon);
    const distance = calculateDistance(point, center);

    if (distance < minDistance) {
      minDistance = distance;
      nearestZone = zone;
    }
  }

  return {
    zone: nearestZone,
    distance: minDistance
  };
}