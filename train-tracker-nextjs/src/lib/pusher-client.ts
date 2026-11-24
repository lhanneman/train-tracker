"use client"

import Pusher from 'pusher-js'

let client: Pusher | undefined

export function getPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  if (!key || !cluster) return undefined
  return client ??= new Pusher(key, { cluster })
}
