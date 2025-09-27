"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrainIcon, CheckCircleIcon } from "lucide-react"

interface TrainStatusButtonsProps {
  onStatusReport: (isTrainCrossing: boolean) => void
}

export function TrainStatusButtons({ onStatusReport }: TrainStatusButtonsProps) {
  const [isReporting, setIsReporting] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

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
    setIsReporting(true)

    try {
      await onStatusReport(isTrainCrossing)
      setCooldownSeconds(60) // 1 minute cooldown
    } catch (error) {
      console.error('Failed to submit report:', error)
    }

    setIsReporting(false)
  }

  const isDisabled = isReporting || cooldownSeconds > 0

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Report Train Status</h3>
        <p className="text-muted-foreground">Help keep the community informed about train crossings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          size="lg"
          variant="destructive"
          className="h-20 text-lg font-semibold"
          onClick={() => handleReport(true)}
          disabled={isDisabled}
        >
          <TrainIcon className="h-6 w-6 mr-3" />
          Train Crossing
        </Button>

        <Button
          size="lg"
          className="h-20 text-lg font-semibold bg-success hover:bg-success/90 text-success-foreground"
          onClick={() => handleReport(false)}
          disabled={isDisabled}
        >
          <CheckCircleIcon className="h-6 w-6 mr-3" />
          Tracks Clear
        </Button>
      </div>

      {isReporting && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">Submitting report...</p>
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
    </Card>
  )
}
