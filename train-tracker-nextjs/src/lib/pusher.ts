import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance (for API routes)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance (for React components)
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
)

// Channel and event names
export const PUSHER_CONFIG = {
  channel: 'train-reports',
  events: {
    newReport: 'new-report',
  },
} as const