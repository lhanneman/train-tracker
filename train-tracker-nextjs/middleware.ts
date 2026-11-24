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

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''

  // Block known bots
  const isBot = botUserAgents.some(bot => userAgent.includes(bot))
  if (isBot) {
    return new NextResponse('Access Denied', { status: 403 })
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