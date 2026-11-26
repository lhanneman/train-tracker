"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { TrainIcon } from 'lucide-react'
import { useLocationPermission } from '@/hooks/useLocationPermission'
import type { LocationData } from '@/lib/geofence-crossings-utils'
import { getPusherClient } from '@/lib/pusher-client'
import { PUSHER_CONFIG } from '@/lib/pusher-config'
import type { TrackerSnapshot } from '@/types'
import { RecentReports } from './recent-reports'
import { StatusIndicator } from './status-indicator'
import { TrainStatusButtons } from './train-status-buttons'

export function TrainTracker() {
  const [snapshot, setSnapshot] = useState<TrackerSnapshot | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [now, setNow] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const pending = useRef<AbortController | null>(null)
  const locationAccess = useLocationPermission()

  const refresh = useCallback(async () => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller

    try {
      const response = await fetch('/api/train-status', { signal: controller.signal, cache: 'no-store' })
      if (!response.ok) throw new Error('Could not refresh crossing status')
      const { data }: { data: TrackerSnapshot } = await response.json()
      if (controller.signal.aborted) return
      setSnapshot(data)
      setNow(Date.now())
      setLoadFailed(false)
    } catch {
      if (!controller.signal.aborted) setLoadFailed(true)
    }
  }, [])

  useEffect(() => {
    const initialRefresh = setTimeout(refresh, 0)
    const poll = setInterval(refresh, 60_000)
    function refreshVisible() {
      if (document.visibilityState === 'visible') {
        setNow(Date.now())
        void refresh()
      }
    }
    document.addEventListener('visibilitychange', refreshVisible)

    const pusher = getPusherClient()
    const channel = pusher?.subscribe(PUSHER_CONFIG.channel)
    channel?.bind(PUSHER_CONFIG.events.newReport, refresh)
    pusher?.connection.bind('connected', refresh)

    return () => {
      clearTimeout(initialRefresh)
      clearInterval(poll)
      document.removeEventListener('visibilitychange', refreshVisible)
      channel?.unbind(PUSHER_CONFIG.events.newReport, refresh)
      pusher?.unsubscribe(PUSHER_CONFIG.channel)
      pusher?.connection.unbind('connected', refresh)
      pending.current?.abort()
    }
  }, [refresh])

  useEffect(() => {
    if (!snapshot?.area.nextUpdateAt) return
    const deadline = Date.parse(snapshot.area.nextUpdateAt)
    const timeout = setTimeout(() => {
      setNow(Date.now())
      void refresh()
    }, Math.max(500, deadline - Date.now()))

    return () => clearTimeout(timeout)
  }, [snapshot, refresh])

  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000))
  const coolingDown = cooldownSeconds > 0
  useEffect(() => {
    if (!coolingDown) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [coolingDown])

  async function submitReport(isTrainCrossing: boolean, location: LocationData | null) {
    const response = await fetch('/api/train-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTrainCrossing, location }),
    })
    if (response.ok || response.status === 429) {
      const seconds = response.ok ? snapshot?.reportCooldownSeconds ?? 15 : Number(response.headers.get('Retry-After'))
      const submittedAt = Date.now()
      setNow(submittedAt)
      setCooldownUntil(submittedAt + seconds * 1000)
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || 'Could not save your report. Please try again.')
    }
    await refresh()
  }

  const expiresAt = snapshot?.area.nextUpdateAt
  const expired = expiresAt && Date.parse(expiresAt) <= now
  const status = loadFailed || expired ? null : snapshot?.area.status ?? null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <div className="rounded-lg bg-primary/10 p-2"><TrainIcon className="size-6 text-primary" /></div>
          <div>
            <h1 className="text-xl font-semibold">Train Tracker</h1>
            <p className="text-sm text-muted-foreground">Waverly crossing reports</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {loadFailed && (
            <p className="rounded-md border p-3 text-sm" role="status">
              Crossing status is unavailable. Any reports below are from the last successful refresh.
            </p>
          )}
          {!snapshot && !loadFailed && <p role="status">Loading crossing status…</p>}
          <StatusIndicator status={status} reportCount={snapshot?.area.crossingReports} />
          <TrainStatusButtons locationAccess={locationAccess} cooldownSeconds={cooldownSeconds} onStatusReport={submitReport} />
        </div>
        <RecentReports reports={snapshot?.recentReports ?? []} />
      </main>
    </div>
  )
}
