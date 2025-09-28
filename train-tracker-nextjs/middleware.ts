import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of bot user agents to block
const botUserAgents = [
  'bot', 'crawl', 'spider', 'scraper', 'facebook', 'whatsapp',
  'telegram', 'twitter', 'linkedin', 'slack', 'discord',
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'ahrefsbot', 'semrushbot', 'dotbot', 'mj12bot',
  'python', 'curl', 'wget', 'axios', 'httpie'
]

// Rate limiting map (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  // Block known bots
  const isBot = botUserAgents.some(bot => userAgent.includes(bot))
  if (isBot) {
    return new NextResponse('Access Denied', { status: 403 })
  }

  // Simple rate limiting (10 requests per minute per IP)
  const now = Date.now()
  const ipData = requestCounts.get(ip) || { count: 0, resetTime: now + 60000 }

  if (now > ipData.resetTime) {
    ipData.count = 0
    ipData.resetTime = now + 60000
  }

  ipData.count++
  requestCounts.set(ip, ipData)

  if (ipData.count > 10) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')

  return response
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}