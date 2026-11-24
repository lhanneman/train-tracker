import { notFound } from 'next/navigation'
import { localSimulatorEnabled } from '@/lib/local-simulator'
import Simulator from './simulator'

export default function TestPage() {
  if (!localSimulatorEnabled()) notFound()
  return <Simulator />
}
