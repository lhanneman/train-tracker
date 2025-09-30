'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrainIcon, CheckCircleIcon, UsersIcon, ClockIcon } from 'lucide-react'

interface ConsensusStatus {
  status: boolean | null
  confidence: 'high' | 'medium' | 'low'
  explanation: string
  recentReports: {
    crossing: number
    clear: number
    total: number
  }
}

const SIMULATED_USERS = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank']

interface Config {
  consensusTimeWindowMinutes: number
  trainCrossingExpirationMinutes: number
}

export default function TestPage() {
  const [consensusStatus, setConsensusStatus] = useState<ConsensusStatus | null>(null)
  const [config, setConfig] = useState<Config | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Fetch current consensus status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/train-status')
      const data = await response.json()
      setConsensusStatus({
        status: data.data.status,
        confidence: data.data.confidence,
        explanation: data.data.explanation,
        recentReports: data.data.recentReports
      })
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  // Submit a simulated report
  const submitSimulatedReport = async (user: string, isTrainCrossing: boolean) => {
    setIsLoading(true)
    try {
      await fetch('/api/simulate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTrainCrossing,
          simulatedUser: user
        })
      })

      // Refresh status after a brief delay
      setTimeout(fetchStatus, 500)
    } catch (error) {
      console.error('Failed to submit simulated report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch configuration
  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      setConfig(data.data)
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  // Auto-refresh status every 10 seconds and fetch config on mount
  useEffect(() => {
    fetchStatus()
    fetchConfig()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusDisplay = () => {
    if (!consensusStatus) return { icon: ClockIcon, label: 'Loading...', color: 'bg-gray-500' }

    if (consensusStatus.status === true) {
      return {
        icon: TrainIcon,
        label: 'Train Crossing',
        color: consensusStatus.confidence === 'high' ? 'bg-red-600' :
               consensusStatus.confidence === 'medium' ? 'bg-red-500' : 'bg-red-400'
      }
    } else if (consensusStatus.status === false) {
      return {
        icon: CheckCircleIcon,
        label: 'Tracks Clear',
        color: consensusStatus.confidence === 'high' ? 'bg-green-600' :
               consensusStatus.confidence === 'medium' ? 'bg-green-500' : 'bg-green-400'
      }
    } else {
      return { icon: UsersIcon, label: 'No Reports', color: 'bg-gray-500' }
    }
  }

  const statusDisplay = getStatusDisplay()
  const StatusIcon = statusDisplay.icon

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Consensus Testing Interface</h1>
          <p className="text-gray-400">Simulate multiple users to test the safety-first consensus algorithm</p>
        </div>

        {/* Current Status */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${statusDisplay.color}`}>
              <StatusIcon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{statusDisplay.label}</h2>
                <Badge variant={consensusStatus?.confidence === 'high' ? 'default' : 'secondary'}>
                  {consensusStatus?.confidence || 'unknown'} confidence
                </Badge>
              </div>
              <p className="text-gray-400">{consensusStatus?.explanation}</p>
              {consensusStatus?.recentReports && (
                <p className="text-sm text-gray-500 mt-1">
                  Recent reports: {consensusStatus.recentReports.crossing} crossing, {consensusStatus.recentReports.clear} clear
                </p>
              )}
              {lastUpdate && (
                <p className="text-xs text-gray-600 mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Algorithm Explanation */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3">Safety-First Consensus Algorithm</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong>Time window:</strong> Only considers reports from the last {config?.consensusTimeWindowMinutes || 5} minutes</p>
            <p><strong>Safety-first:</strong> ANY recent &quot;crossing&quot; reports → status = &quot;crossing&quot;</p>
            <p><strong>Clear only:</strong> ALL recent reports say &quot;clear&quot; → status = &quot;clear&quot;</p>
            <p><strong>Confidence levels:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <strong>High:</strong> 2+ crossing reports OR 3+ clear reports</li>
              <li>• <strong>Medium:</strong> 1 crossing (no clear) OR 2 clear reports</li>
              <li>• <strong>Low:</strong> Mixed signals or single report</li>
            </ul>
          </div>
        </Card>

        {/* Simulation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Train Crossing Reports */}
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrainIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">Report Train Crossing</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIMULATED_USERS.map(user => (
                <Button
                  key={`crossing-${user}`}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => submitSimulatedReport(user, true)}
                  className="text-xs"
                >
                  {user}
                </Button>
              ))}
            </div>
          </Card>

          {/* Clear Reports */}
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold">Report Tracks Clear</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIMULATED_USERS.map(user => (
                <Button
                  key={`clear-${user}`}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => submitSimulatedReport(user, false)}
                  className="text-xs border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                >
                  {user}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Test Scenarios */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Test Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={async () => {
                // Scenario: Single crossing report
                await submitSimulatedReport('Alice', true)
              }}
              className="text-left p-4 h-auto flex-col items-start"
            >
              <div className="font-medium">Single Crossing</div>
              <div className="text-sm text-gray-400">1 crossing report (medium confidence)</div>
            </Button>

            <Button
              variant="outline"
              disabled={isLoading}
              onClick={async () => {
                // Scenario: Multiple crossing reports
                await submitSimulatedReport('Alice', true)
                setTimeout(() => submitSimulatedReport('Bob', true), 200)
              }}
              className="text-left p-4 h-auto flex-col items-start"
            >
              <div className="font-medium">Multiple Crossing</div>
              <div className="text-sm text-gray-400">2 crossing reports (high confidence)</div>
            </Button>

            <Button
              variant="outline"
              disabled={isLoading}
              onClick={async () => {
                // Scenario: Conflicting reports
                await submitSimulatedReport('Alice', true)
                setTimeout(() => submitSimulatedReport('Bob', false), 200)
                setTimeout(() => submitSimulatedReport('Carol', false), 400)
              }}
              className="text-left p-4 h-auto flex-col items-start"
            >
              <div className="font-medium">Conflicting Reports</div>
              <div className="text-sm text-gray-400">1 crossing vs 2 clear (crossing wins)</div>
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={fetchStatus} disabled={isLoading}>
            Refresh Status
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Main App</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}