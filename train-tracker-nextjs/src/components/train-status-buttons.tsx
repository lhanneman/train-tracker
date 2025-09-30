"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrainIcon, CheckCircleIcon, MapPinIcon, AlertCircleIcon } from "lucide-react"
import { useLocationPermission, LocationData } from "@/hooks/useLocationPermission"
import { CROSSING_GEOFENCE_CONFIG } from "@/config/geofence-crossings"

interface TrainStatusButtonsProps {
  onStatusReport: (isTrainCrossing: boolean, location?: LocationData) => void
}

export function TrainStatusButtons({ onStatusReport }: TrainStatusButtonsProps) {
  const [isReporting, setIsReporting] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [reportCooldownSetting, setReportCooldownSetting] = useState(15) // Default to 15 seconds

  const {
    permissionState,
    geofenceStatus,
    isLoading: isLocationLoading,
    error: locationError,
    requestPermission,
    getCurrentLocation
  } = useLocationPermission()

  // Fetch cooldown setting from config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        const data = await response.json()
        setReportCooldownSetting(data.data.reportCooldownSeconds)
      } catch (error) {
        console.error('Failed to fetch config:', error)
        // Keep default of 15 seconds if fetch fails
      }
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [cooldownSeconds])

  const handleReport = async (isTrainCrossing: boolean) => {
    // If permission is denied, don't proceed
    if (permissionState === 'denied') {
      return
    }

    setIsReporting(true)

    try {
      // Get current location before reporting
      const location = await getCurrentLocation()

      // Check if location is within geo-fence (only if enforcement is enabled)
      if (CROSSING_GEOFENCE_CONFIG.enforceGeofence && location && geofenceStatus && !geofenceStatus.isValid) {
        // Location is outside geo-fence, don't submit
        console.warn('Report blocked: Outside geo-fence', geofenceStatus.reason)
        return
      }

      await onStatusReport(isTrainCrossing, location || undefined)
      setCooldownSeconds(reportCooldownSetting) // Use configurable cooldown
    } catch (error) {
      console.error('Failed to submit report:', error)
    }

    setIsReporting(false)
  }

  // Only consider geofence status if enforcement is enabled
  const isOutsideGeofence = CROSSING_GEOFENCE_CONFIG.enforceGeofence && geofenceStatus ? !geofenceStatus.isValid : false
  const isDisabled = isReporting || cooldownSeconds > 0 || isLocationLoading ||
                     permissionState === 'unsupported' || isOutsideGeofence
  const isReadOnly = permissionState === 'denied' || permissionState === 'unsupported' || isOutsideGeofence

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Report Train Status</h3>
        <p className="text-muted-foreground">
          {isReadOnly
            ? "View-only mode - Location access required to submit reports"
            : "Help keep the community informed about train crossings"}
        </p>
      </div>

      {/* Location Permission Status Indicator */}
      {permissionState === 'denied' && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Location access denied
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Enable location access in your browser settings to submit reports
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={async () => {
                  await requestPermission()
                }}
                disabled={isLocationLoading}
              >
                {isLocationLoading ? "Requesting..." : "Try Again"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {permissionState === 'prompt' && isLocationLoading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Requesting location access...
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Please allow location access to submit train reports
              </p>
            </div>
          </div>
        </div>
      )}

      {permissionState === 'unsupported' && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircleIcon className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Location not supported
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Your browser doesn&apos;t support location services
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Geo-fence Status (only when out of range for helpful info) */}
      {permissionState === 'granted' && geofenceStatus && !geofenceStatus.isValid && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPinIcon className="h-5 w-5 mt-0.5 text-orange-600 dark:text-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                {geofenceStatus.reason}
              </p>
              {geofenceStatus.distanceDescription && (
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {geofenceStatus.distanceDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          size="lg"
          variant={isReadOnly ? "outline" : "destructive"}
          className="h-20 text-lg font-semibold"
          onClick={() => handleReport(true)}
          disabled={isDisabled || isReadOnly}
        >
          <TrainIcon className="h-6 w-6 mr-3" />
          Train Crossing
        </Button>

        <Button
          size="lg"
          variant={isReadOnly ? "outline" : "default"}
          className={`h-20 text-lg font-semibold ${
            !isReadOnly ? "bg-green-600 hover:bg-green-700 text-white" : ""
          }`}
          onClick={() => handleReport(false)}
          disabled={isDisabled || isReadOnly}
        >
          <CheckCircleIcon className="h-6 w-6 mr-3" />
          Tracks Clear
        </Button>
      </div>

      {isReporting && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {isLocationLoading ? "Getting your location..." : "Submitting report..."}
          </p>
        </div>
      )}

      {cooldownSeconds > 0 && !isReporting && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            You can send another report in {Math.floor(cooldownSeconds / 60)}:
            {(cooldownSeconds % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}

      {locationError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-100">{locationError}</p>
        </div>
      )}
    </Card>
  )
}