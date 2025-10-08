import { TrainIcon, CheckCircleIcon, HelpCircleIcon, ClockIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatusIndicatorProps {
  status: boolean | null
  timeUntilExpiry?: number | null // seconds until expiry
  reportCount?: number // number of reports for current crossing instance
}

export function StatusIndicator({ status, timeUntilExpiry, reportCount = 0 }: StatusIndicatorProps) {
  // Format time into MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const getStatusConfig = () => {
    if (status === true) {
      return {
        icon: TrainIcon,
        label: "Train Crossing",
        description: "A train is currently crossing the tracks",
        bgColor: "bg-destructive/10",
        iconColor: "text-destructive",
        glowClass: "pulse-glow",
      }
    } else if (status === false) {
      return {
        icon: CheckCircleIcon,
        label: "Tracks Clear",
        description: "No train detected, tracks are clear",
        bgColor: "bg-success/10",
        iconColor: "text-success",
        glowClass: "",
      }
    } else {
      return {
        icon: HelpCircleIcon,
        label: "Status Unknown",
        description: "Waiting for status reports...",
        bgColor: "bg-muted/10",
        iconColor: "text-muted-foreground",
        glowClass: "",
      }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className={`p-8 text-center ${config.bgColor} border-2 ${config.glowClass}`}>
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${config.bgColor}`}>
          <Icon className={`h-12 w-12 ${config.iconColor}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{config.label}</h2>
          <p className="text-muted-foreground">{config.description}</p>

          {/* Report count for train crossing */}
          {status === true && reportCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Based on {reportCount} {reportCount === 1 ? 'report' : 'reports'}
            </p>
          )}

          {/* Countdown Timer for Train Crossing */}
          {status === true && timeUntilExpiry !== null && timeUntilExpiry !== undefined && timeUntilExpiry > 0 && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600 font-medium">
                Auto-clears in {formatTime(timeUntilExpiry)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}