"use client"

import PusherClient from 'pusher-js'

// Lazy initialization of Pusher client
let pusherClientInstance: PusherClient | null = null

function initializePusherClient(): PusherClient {
  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!key || !cluster) {
      throw new Error('Pusher environment variables are not configured')
    }

    pusherClientInstance = new PusherClient(key, {
      cluster: cluster,
    })
  }

  return pusherClientInstance
}

// Client-side Pusher instance (for React components)
export const pusherClient = {
  subscribe: (channel: string) => initializePusherClient().subscribe(channel),
  unsubscribe: (channel: string) => initializePusherClient().unsubscribe(channel),
  disconnect: () => pusherClientInstance?.disconnect(),
}

// Channel and event names
export const PUSHER_CONFIG = {
  channel: 'train-reports',
  events: {
    newReport: 'new-report',
  },
} as const