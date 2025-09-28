import { useState, useEffect, useCallback } from 'react';
import { validateGeofence, getNearestZone } from '@/lib/geofence-utils';
import type { GeoFenceZone } from '@/config/geofence';

export type LocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeofenceStatus {
  isValid: boolean;
  isInZone: boolean;
  zones: GeoFenceZone[];
  nearestZone?: { zone: GeoFenceZone; distance: number };
  reason?: string;
}

export interface UseLocationPermissionReturn {
  permissionState: LocationPermissionState;
  locationData: LocationData | null;
  geofenceStatus: GeofenceStatus | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
  checkGeofence: (location: LocationData) => GeofenceStatus;
}

const STORAGE_KEY = 'trainTracker_locationPermission';

export function useLocationPermission(): UseLocationPermissionReturn {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('prompt');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if geolocation is supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Check stored permission state
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState === 'granted' || storedState === 'denied') {
      setPermissionState(storedState as LocationPermissionState);
    }

    // Check actual permission state if available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionState(result.state as LocationPermissionState);
          localStorage.setItem(STORAGE_KEY, result.state);

          // Listen for permission changes
          result.addEventListener('change', () => {
            setPermissionState(result.state as LocationPermissionState);
            localStorage.setItem(STORAGE_KEY, result.state);
          });
        })
        .catch(() => {
          // Permissions API not fully supported, use stored state or prompt
          console.log('Permissions API not fully supported');
        });
    }
  }, []);

  // Helper function to get location and update state
  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocationData(data);

        // Check geo-fence status
        const validation = validateGeofence(
          data.latitude,
          data.longitude,
          data.accuracy
        );

        const nearestZone = getNearestZone({
          lat: data.latitude,
          lng: data.longitude
        });

        const status: GeofenceStatus = {
          isValid: validation.isValid,
          isInZone: validation.isInZone,
          zones: validation.zones,
          nearestZone: nearestZone || undefined,
          reason: validation.reason
        };

        setGeofenceStatus(status);
        setIsLoading(false);

        if (validation.debug) {
          console.log('Location update - geofence validation:', validation);
        }
      },
      (err) => {
        setIsLoading(false);
        let errorMessage = 'Unable to get location';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            setPermissionState('denied');
            localStorage.setItem(STORAGE_KEY, 'denied');
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000 // Cache for 15 seconds for periodic updates
      }
    );
  }, []);

  // Automatically get location when permission is granted
  useEffect(() => {
    if (permissionState === 'granted' && !locationData) {
      updateLocation();
    }
  }, [permissionState, locationData, updateLocation]);

  // Set up periodic location updates when permission is granted
  useEffect(() => {
    if (permissionState !== 'granted') return;

    // Update location every 30 seconds
    const interval = setInterval(() => {
      updateLocation();
    }, 30000);

    return () => clearInterval(interval);
  }, [permissionState, updateLocation]);

  const checkGeofence = useCallback((location: LocationData): GeofenceStatus => {
    const validation = validateGeofence(
      location.latitude,
      location.longitude,
      location.accuracy
    );

    const nearestZone = getNearestZone({
      lat: location.latitude,
      lng: location.longitude
    });

    const status: GeofenceStatus = {
      isValid: validation.isValid,
      isInZone: validation.isInZone,
      zones: validation.zones,
      nearestZone: nearestZone || undefined,
      reason: validation.reason
    };

    setGeofenceStatus(status);

    // Log debug info if enabled
    if (validation.debug) {
      console.log('Geofence validation:', validation);
    }

    return status;
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocationData(data);

          // Check geo-fence status
          checkGeofence(data);

          setIsLoading(false);
          resolve(data);
        },
        (err) => {
          setIsLoading(false);
          let errorMessage = 'Unable to get location';

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              setPermissionState('denied');
              localStorage.setItem(STORAGE_KEY, 'denied');
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          setError(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000 // Cache location for 30 seconds
        }
      );
    });
  }, [checkGeofence]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to get current location - this will trigger permission prompt if needed
      const location = await getCurrentLocation();

      if (location) {
        setPermissionState('granted');
        localStorage.setItem(STORAGE_KEY, 'granted');
        return true;
      } else {
        // Permission was denied or location failed
        return false;
      }
    } catch {
      setIsLoading(false);
      return false;
    }
  }, [getCurrentLocation]);

  return {
    permissionState,
    locationData,
    geofenceStatus,
    isLoading,
    error,
    requestPermission,
    getCurrentLocation,
    checkGeofence
  };
}