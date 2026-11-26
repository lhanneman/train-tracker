"use client"

import { useCallback, useEffect, useState } from 'react'
import type { LocationData } from '@/lib/geofence-crossings-utils'

export function useLocationPermission() {
  const [permission, setPermission] = useState<PermissionState | 'unsupported'>('prompt')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const readLocation = useCallback(async (maximumAge = 0): Promise<LocationData | null> => {
    if (!navigator.geolocation) return null
    setIsLoading(true)
    setError(null)
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const position = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }
          setPermission('granted')
          setLocation(position)
          setIsLoading(false)
          resolve(position)
        },
        failure => {
          if (failure.code === 1) setPermission('denied')
          setLocation(null)
          setError(failure.code === 1 ? 'Location access denied. Check your browser permissions.' : 'Could not get your location. Please try again.')
          setIsLoading(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge },
      )
    })
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      // Browser capabilities are only available after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission('unsupported')
      return
    }

    let active = true
    let observed: PermissionStatus | undefined
    function updatePermission() {
      if (!observed) return
      setPermission(observed.state)
      if (observed.state !== 'granted') setLocation(null)
    }

    navigator.permissions?.query({ name: 'geolocation' }).then(result => {
      if (!active) return
      observed = result
      updatePermission()
      observed.addEventListener('change', updatePermission)
    }).catch(() => {})

    return () => {
      active = false
      observed?.removeEventListener('change', updatePermission)
    }
  }, [])

  useEffect(() => {
    if (permission !== 'granted') return
    const initialRead = setTimeout(() => void readLocation(15_000), 0)
    return () => clearTimeout(initialRead)
  }, [permission, readLocation])

  return { permission, location, isLoading, error, readLocation }
}
