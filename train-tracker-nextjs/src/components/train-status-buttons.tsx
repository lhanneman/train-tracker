"use client"

import { useState } from 'react'
import { CheckCircleIcon, TrainIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CROSSING_GEOFENCE_CONFIG } from '@/config/geofence-crossings'
import { isWithinReportingArea, type LocationData } from '@/lib/geofence-crossings-utils'
import type { useLocationPermission } from '@/hooks/useLocationPermission'

interface TrainStatusButtonsProps {
  locationAccess: ReturnType<typeof useLocationPermission>
  cooldownSeconds: number
  onStatusReport: (isTrainCrossing: boolean, location: LocationData | null) => Promise<void>
}

export function TrainStatusButtons({ locationAccess, cooldownSeconds, onStatusReport }: TrainStatusButtonsProps) {
  const [isReporting, setIsReporting] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const { permission, location, isLoading, error, readLocation } = locationAccess
  const needsLocation = CROSSING_GEOFENCE_CONFIG.enforceGeofence
  const outOfRange = Boolean(needsLocation && location && !isWithinReportingArea(location))

  async function handleReport(isTrainCrossing: boolean) {
    setIsReporting(true)
    setReportError(null)
    try {
      const currentLocation = needsLocation ? await readLocation() : null
      if (needsLocation && !isWithinReportingArea(currentLocation)) {
        if (currentLocation) setReportError('You need an accurate location near either crossing.')
        return
      }
      await onStatusReport(isTrainCrossing, currentLocation)
    } catch (failure) {
      setReportError(failure instanceof Error ? failure.message : 'Could not save your report. Please try again.')
    } finally {
      setIsReporting(false)
    }
  }

  const disabled = isReporting || isLoading || cooldownSeconds > 0 || outOfRange
    || (needsLocation && (!location || permission !== 'granted'))

  return (
    <Card className="space-y-4 p-6">
      <h3 className="font-semibold">Report Train Status</h3>
      <p className="text-sm text-muted-foreground">You can report from near either Waverly crossing.</p>
      {needsLocation && !location && permission !== 'unsupported' && (
        <Button variant="outline" disabled={isLoading || isReporting} onClick={() => void readLocation()}>
          {isLoading ? 'Getting location…' : 'Share location to report'}
        </Button>
      )}
      {needsLocation && permission === 'unsupported' && <p role="status">This browser does not support location access.</p>}
      {outOfRange && <p role="status">Your last location is outside reporting range or too imprecise.</p>}
      {outOfRange && (
        <Button variant="outline" disabled={isLoading || isReporting} onClick={() => void readLocation()}>Refresh location</Button>
      )}
      {(reportError || error) && <p className="text-sm text-destructive" role="alert">{reportError || error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button size="lg" variant="destructive" disabled={disabled} onClick={() => void handleReport(true)}>
          <TrainIcon /> Train Crossing
        </Button>
        <Button size="lg" variant="outline" disabled={disabled} onClick={() => void handleReport(false)}>
          <CheckCircleIcon /> Tracks Clear
        </Button>
      </div>
      {isReporting && <p role="status" className="text-sm text-muted-foreground">Submitting report…</p>}
      {cooldownSeconds > 0 && <p className="text-sm text-muted-foreground">You can report again in {cooldownSeconds}s.</p>}
    </Card>
  )
}
