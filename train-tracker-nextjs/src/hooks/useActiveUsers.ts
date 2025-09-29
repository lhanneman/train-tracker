import { useState, useEffect } from 'react'
import { pusherClient, PUSHER_CONFIG } from '@/lib/pusher-client'

export function useActiveUsers() {
  const [activeUsers, setActiveUsers] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simple approach: count active connections on the main channel
    // Since we can't use presence channels without authentication,
    // we'll track connections via custom events

    pusherClient.subscribe(PUSHER_CONFIG.channel)

    // Send a heartbeat every 30 seconds to indicate activity
    const heartbeatInterval = setInterval(() => {
      // We can't send from client without authentication, so we'll track locally
      setIsConnected(true)
    }, 30000)

    // Simulate user count based on activity (placeholder implementation)
    // In a real app, you'd track this server-side
    const updateUserCount = () => {
      const baseUsers = 1 // At least this user
      const randomVariation = Math.floor(Math.random() * 3) // 0-2 additional users
      setActiveUsers(baseUsers + randomVariation)
    }

    // Initial count
    updateUserCount()

    // Update count every minute
    const countInterval = setInterval(updateUserCount, 60000)

    setIsConnected(true)

    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(countInterval)
      pusherClient.unsubscribe(PUSHER_CONFIG.channel)
      setIsConnected(false)
    }
  }, [])

  return { activeUsers, isConnected }
}