"use client"

import PusherClient from 'pusher-js'

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