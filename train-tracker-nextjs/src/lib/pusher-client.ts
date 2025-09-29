"use client"

import PusherClient from 'pusher-js'

// Lazy initialization of Pusher client
let pusherClientInstance: PusherClient | null = null

function initializePusherClient(): PusherClient | null {
  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!key || !cluster) {
      console.warn('Pusher environment variables are not configured - real-time updates disabled')
      return null
    }

    try {
      pusherClientInstance = new PusherClient(key, {
        cluster: cluster,
      })
    } catch (error) {
      console.error('Failed to initialize Pusher client:', error)
      return null
    }
  }

  return pusherClientInstance
}

// Mock channel object for when Pusher is not available
const mockChannel = {
  bind: () => {},
  unbind: () => {},
  unbind_all: () => {},
}

// Client-side Pusher instance (for React components)
export const pusherClient = {
  subscribe: (channel: string) => {
    const client = initializePusherClient()
    return client ? client.subscribe(channel) : mockChannel
  },
  unsubscribe: (channel: string) => {
    const client = initializePusherClient()
    if (client) {
      client.unsubscribe(channel)
    }
  },
  disconnect: () => pusherClientInstance?.disconnect(),
}

// Channel and event names
export const PUSHER_CONFIG = {
  channel: 'train-reports',
  events: {
    newReport: 'new-report',
  },
} as const