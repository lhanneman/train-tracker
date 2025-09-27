import { TrainIcon, CheckCircleIcon, HelpCircleIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatusIndicatorProps {
  status: boolean | null
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
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
        </div>
      </div>
    </Card>
  )
}