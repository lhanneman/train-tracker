import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrainIcon, CheckCircleIcon, ClockIcon, UserIcon } from "lucide-react"
import type { TrainReport } from "@/types"

interface RecentReportsProps {
  reports: TrainReport[]
}

export function RecentReports({ reports }: RecentReportsProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const reportTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - reportTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ClockIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Recent Reports</h3>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reports yet</p>
          </div>
        ) : (
          reports.map((report, index) => (
            <div key={report.id} className={`p-4 rounded-lg border bg-card/50 ${index === 0 ? "slide-in" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {report.isTrainCrossing ? (
                    <TrainIcon className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4 text-success" />
                  )}
                  <Badge
                    variant={report.isTrainCrossing ? "destructive" : "default"}
                    className={!report.isTrainCrossing ? "bg-success/10 text-success hover:bg-success/20" : ""}
                  >
                    {report.isTrainCrossing ? "Train Crossing" : "Tracks Clear"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{formatTimeAgo(report.reportedAt)}</span>
              </div>

              <div className="text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="h-3 w-3" />
                  <span>Session {report.sessionId.substring(0, 8)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {reports.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">Showing {reports.length} most recent reports</p>
        </div>
      )}
    </Card>
  )
}
