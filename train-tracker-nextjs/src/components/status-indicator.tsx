import { CheckCircleIcon, HelpCircleIcon, TrainIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatusIndicatorProps {
  status: boolean | null
  reportCount?: number
}

export function StatusIndicator({ status, reportCount = 0 }: StatusIndicatorProps) {
  const Icon = status === true ? TrainIcon : status === false ? CheckCircleIcon : HelpCircleIcon
  const label = status === true ? 'Train Crossing' : status === false ? 'Area Reported Clear' : 'Status Unknown'
  const description = status === true ? `Based on ${reportCount} ${reportCount === 1 ? 'observation' : 'observations'}`
    : status === false ? 'Recent reports indicate no train in the area' : 'Waiting for recent reports'
  const color = status === true ? 'border-destructive/40 bg-destructive/10 text-destructive'
    : status === false ? 'border-green-600/40 bg-green-600/10 text-green-600' : 'text-muted-foreground'

  return (
    <Card className={`space-y-2 p-5 ${color}`}>
      <h2 className="text-base font-semibold text-foreground">Waverly crossings</h2>
      <p className="flex items-center gap-2 font-semibold" aria-live="polite"><Icon className="size-5" />{label}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  )
}
