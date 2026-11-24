export interface CrossingPoint {
  id: string
  name: string
  lat: number
  lng: number
}

export const TRAIN_CROSSINGS: CrossingPoint[] = [
  { id: 'crossing-west', name: 'N 141st Street', lat: 40.916109, lng: -96.529647 },
  { id: 'crossing-east', name: 'N 148th Street', lat: 40.920600, lng: -96.520912 },
]

export const CROSSING_GEOFENCE_CONFIG = {
  maxDistanceMeters: 1000,
  minAccuracyMeters: 100,
  enforceGeofence: true,
}
