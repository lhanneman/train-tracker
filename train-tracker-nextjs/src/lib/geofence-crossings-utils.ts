import { CROSSING_GEOFENCE_CONFIG, TRAIN_CROSSINGS, type CrossingPoint } from '@/config/geofence-crossings'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

export function calculateDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radians = Math.PI / 180
  const latDelta = (lat2 - lat1) * radians
  const lngDelta = (lng2 - lng1) * radians
  const fraction = Math.sin(latDelta / 2) ** 2
    + Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin(lngDelta / 2) ** 2
  return 2 * 6_371_000 * Math.asin(Math.sqrt(Math.min(1, fraction)))
}

function isWithinCrossingRange(location: unknown, crossing: CrossingPoint) {
  if (!location || typeof location !== 'object') return false
  const { latitude, longitude, accuracy } = location as Partial<LocationData>
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof accuracy !== 'number'
    || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(accuracy)
    || Math.abs(latitude) > 90 || Math.abs(longitude) > 180
    || accuracy < 0 || accuracy > CROSSING_GEOFENCE_CONFIG.minAccuracyMeters) return false

  return calculateDistanceInMeters(latitude, longitude, crossing.lat, crossing.lng)
    <= CROSSING_GEOFENCE_CONFIG.maxDistanceMeters
}

export function isWithinReportingArea(location: unknown) {
  return TRAIN_CROSSINGS.some(crossing => isWithinCrossingRange(location, crossing))
}
