# Train Tracker App - Next.js Setup Checklist

## New Tech Stack (Vercel-Optimized)
- **Frontend & Backend**: Next.js 14 (full-stack React framework)
- **ORM**: Prisma
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Pusher or Ably
- **Deployment**: Vercel
- **Styling**: Tailwind CSS v4 + Shadcn/ui components

## Prerequisites Installation

### 1. Core Development Tools
- [x] Install Homebrew (if not installed): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` ✅ *Installed: v4.6.14*
- [x] Install Node.js 18+: `brew install node` ✅ *Installed: v18.18.0*
- [x] Verify Node/npm: `node --version && npm --version` (Node 18+ required) ✅ *Node: v18.18.0, npm: v9.8.1*
- [x] Install Git: `brew install git` ✅ *Installed: v2.43.0*
- [x] Install VS Code: `brew install --cask visual-studio-code` ✅ *Installed: v1.104.2*

### 2. VS Code Extensions
- [x] Install Prisma extension: `code --install-extension Prisma.prisma` ✅ *Installed: v6.16.2*
- [x] Install ESLint extension: `code --install-extension dbaeumer.vscode-eslint` ✅ *Already installed: v3.0.16*
- [x] Install Prettier extension: `code --install-extension esbenp.prettier-vscode` ✅ *Already installed: v11.0.0*
- [x] Install Tailwind CSS IntelliSense: `code --install-extension bradlc.vscode-tailwindcss` ✅ *Already installed: v0.14.26*
- [x] Install Next.js extension: `code --install-extension ms-vscode.vscode-typescript-next` ✅ *Installed: v6.0.20250926*

### 3. Database Setup (Supabase)
- [x] Create Supabase account: https://supabase.com ✅ *Account created*
- [x] Create new Supabase project ✅ *Project: dndmvymjppplhzqswxoy*
- [x] Copy database URL from project settings ✅ *Using pooler connection*
- [x] Save connection string for later ✅ *Saved with URL-encoded password*
- [x] Create TrainReports table via SQL Editor ✅ *Table created successfully*

### 4. Real-time Service Setup with Pusher

- [x] Create Pusher account: https://pusher.com ✅ *Account created*
- [x] Create new Pusher Channels app ✅ *App ID: 2056315*
- [x] Note down: App ID, Key, Secret, Cluster ✅ *Credentials saved to .env.local*
- [x] Free tier: 200k messages/day, 100 concurrent connections ✅ *Active*

## Project Setup

### 5. Create Next.js Project
```bash
- [x] npx create-next-app@latest train-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" ✅ *Project: train-tracker-nextjs*
- [x] cd train-tracker ✅ *Working directory set*
- [x] npm install ✅ *Dependencies installed*
```

### 6. Install Dependencies
```bash
- [x] npm install prisma @prisma/client ✅ *Installed: Prisma v6.16.2*
- [x] npm install @types/node ✅ *Installed*
- [x] npm install lucide-react ✅ *Installed: v0.469.0*
- [x] npm install date-fns ✅ *Installed*
- [x] npm install clsx tailwind-merge ✅ *Installed*
```

#### Real-time Dependencies (Choose matching option from step 4)
```bash
# For Pusher:
- [x] npm install pusher pusher-js ✅ *Installed and configured*
```

#### UI Components (Shadcn/ui)
```bash
- [x] npx shadcn@latest init ✅ *Configured with Tailwind v4*
- [x] npx shadcn@latest add button ✅ *Installed*
- [x] npx shadcn@latest add card ✅ *Installed*
- [x] npx shadcn@latest add badge ✅ *Installed*
- [ ] npx shadcn@latest add toast
```

### 7. Database Setup with Prisma
```bash
- [x] npx prisma init ✅ *Prisma initialized*
- [x] Update .env with Supabase DATABASE_URL ✅ *URL-encoded connection string added*
- [x] Create Prisma schema (see schema below) ✅ *TrainReport model created*
- [x] npx prisma generate ✅ *Client generated*
- [x] npx prisma db push ✅ *Schema pushed to Supabase*
```

#### Prisma Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model TrainReport {
  id             Int      @id @default(autoincrement())
  isTrainCrossing Boolean
  reportedAt     DateTime @default(now())
  userIpAddress  String
  userAgent      String
  sessionId      String

  @@map("TrainReports")
}
```

### 8. Environment Variables Setup
Create `.env.local` file:
```bash
- [x] Add DATABASE_URL="your-supabase-connection-string" ✅ *Configured with URL-encoded password*
- [x] Add NEXTAUTH_SECRET="your-secret-key" (generate with: openssl rand -base64 32) ✅ *Added*
- [x] Add NEXTAUTH_URL="http://localhost:3000" ✅ *Added*

# For Pusher:
- [x] Add PUSHER_APP_ID="your-app-id" ✅ *App ID: 2056315*
- [x] Add PUSHER_KEY="your-key" ✅ *Added*
- [x] Add PUSHER_SECRET="your-secret" ✅ *Added*
- [x] Add PUSHER_CLUSTER="your-cluster" ✅ *Cluster: us2*
- [x] Add NEXT_PUBLIC_PUSHER_KEY="your-key" ✅ *Added*
- [x] Add NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster" ✅ *Added*

# For Ably:
- [ ] Add ABLY_API_KEY="your-ably-api-key"
- [ ] Add NEXT_PUBLIC_ABLY_KEY="your-ably-api-key"

# Geofence Configuration (for testing):
- [x] Add NEXT_PUBLIC_ENFORCE_GEOFENCE="false" ✅ *Disabled for testing*
# Set to "false" to disable location requirements during testing
# Set to "true" or remove this line to enforce location requirements in production
```

### 9. API Routes Setup
Create these API routes in `src/app/api/`:

```bash
- [x] Create `src/app/api/train-reports/route.ts` (GET all reports) ✅ *GET/POST endpoints created*
- [x] Create `src/app/api/train-status/route.ts` (GET current status) ✅ *Status endpoint created*
- [x] Create `src/app/api/test/route.ts` (Database connection test) ✅ *Test endpoint working*
```

### 10. Real-time Service Setup with Pusher

```bash
- [x] Create `src/lib/pusher.ts` (server-side Pusher config) ✅ *Server/client config created*
- [x] Add Pusher trigger to API routes ✅ *Broadcasting on new reports*
- [x] Integrate Pusher client in React components ✅ *Real-time updates working*
```

### 11. UI Components Migration
Migrate existing v0 components to Next.js structure:
```bash
- [x] Create `src/components/ui/` folder for base components ✅ *Shadcn/ui components*
- [x] Create `src/components/status-indicator.tsx` ✅ *Status indicator with dark theme*
- [x] Create `src/components/train-status-buttons.tsx` ✅ *Report buttons with cooldown*
- [x] Create `src/components/recent-reports.tsx` ✅ *Reports list with animations*
- [x] Update imports to use Next.js paths ✅ *@/ aliases configured*
- [x] Create `src/types/index.ts` for TypeScript types ✅ *TrainReport interface*
```

### 12. Main Page Setup
```bash
- [x] Update `src/app/page.tsx` with train tracker UI ✅ *TrainTracker component integrated*
- [x] Create `src/components/train-tracker.tsx` main component ✅ *Client component with state management*
- [x] Add global styles to `src/app/globals.css` ✅ *Dark theme and animations*
- [x] Configure Tailwind config for dark theme ✅ *Tailwind v4 with custom CSS variables*
```

## Development & Testing

### 13. Local Development
```bash
- [x] Run development server: `npm run dev` ✅ *Running on http://localhost:3000*
- [x] Test database connection: Check Prisma Studio `npx prisma studio` ✅ *Connection working*
- [x] Test API endpoints: Use browser or Postman ✅ */api/test, /api/train-reports, /api/train-status*
- [x] Test real-time functionality: Open multiple browser tabs ✅ *Pusher real-time working*
```

### 14. Database Management
```bash
- [x] View data: `npx prisma studio` ✅ *Available at http://localhost:5555*
- [x] Reset database: `npx prisma db push --force-reset` ✅ *Schema synced*
- [x] Generate types: `npx prisma generate` ✅ *TypeScript types generated*
```

## Deployment Preparation

## Production Considerations

### 15. Data Integrity & Conflict Resolution
Important features to implement for production:

#### Conflicting Reports Handling
```bash
- [x] Implement weighted voting system based on recent reports
- [x] Add confidence scoring for status determination
- [x] Track user reliability over time (optional)
- [x] Flag suspicious patterns (same IP/session rapid conflicting reports)
```

**Strategies to Consider:**
- **Time-weighted consensus**: Recent reports (last 5-10 minutes) carry more weight
- **Majority rules with confidence**: If 3+ reports say "clear" vs 1 "crossing", trust majority
- **Suspicious behavior detection**: Flag users submitting conflicting reports rapidly
- **Manual override**: Admin dashboard for moderating disputed reports (future enhancement)

#### Auto-expiration of Train Crossing Status
```bash
- [x] Add auto-expiration for "train crossing" status after 10 minutes
- [x] Create scheduled job or API route to handle expiration
- [x] Update UI to show time remaining for crossing status
- [x] Broadcast expiration events via Pusher
```

**Implementation Options:**
1. **Client-side timer**: Show countdown, auto-refresh after 10 minutes
2. **Scheduled API route**: Vercel Cron Jobs to auto-expire old crossings
3. **Database triggers**: PostgreSQL functions to auto-update expired statuses
4. **Hybrid approach**: Client countdown + server-side validation

### 16. Location Permission & Geo-fencing

#### Location Permission Handling
```bash
- [x] Implement browser Geolocation API permission request
- [x] Show read-only UI if location permission denied
- [x] Enable "Train is Crossing" and "All Clear" buttons only with location access
- [x] Store permission status in local storage for persistence
- [x] Show clear messaging about why location is needed
```

**Implementation Requirements:**
- Request location permission only when user first attempts to report
- Gracefully handle permission denial - keep app functional in read-only mode
- Show status indicator for location permission state
- Provide option to re-request permission if initially denied

**Example Permission Flow:**
```typescript
async function requestLocationPermission(): Promise<boolean> {
  try {
    // Request permission when user clicks report button
    const result = await navigator.permissions.query({ name: 'geolocation' });

    if (result.state === 'granted') {
      return true;
    } else if (result.state === 'prompt') {
      // Will trigger browser permission dialog
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false)
        );
      });
    }
    return false;
  } catch {
    return false;
  }
}
```

#### Geo-fencing for Report Validation
```bash
- [x] Define train track coordinates/polygon boundaries
- [x] Calculate user distance from nearest track point
- [x] Set maximum reporting distance (e.g., 500 meters)
- [x] Validate location before accepting reports
- [x] Show distance feedback to user
```

**Geo-fence Configuration:**
```typescript
interface TrackLocation {
  lat: number;
  lng: number;
}

interface GeoFenceConfig {
  trackPoints: TrackLocation[]; // Line of track coordinates
  maxDistanceMeters: number;    // Max distance to submit report (e.g., 500m)
  minAccuracyMeters: number;    // Required GPS accuracy (e.g., 50m)
}

// Calculate if user is within geo-fence
function isWithinGeoFence(
  userLocation: GeolocationPosition,
  config: GeoFenceConfig
): boolean {
  const minDistance = calculateMinDistanceToTrack(
    userLocation.coords,
    config.trackPoints
  );

  return minDistance <= config.maxDistanceMeters &&
         userLocation.coords.accuracy <= config.minAccuracyMeters;
}
```

**User Experience Considerations:**
- Show visual indicator of distance from tracks
- Display "Too far from tracks" message when outside geo-fence
- Consider caching last valid location for brief GPS dropouts
- Allow viewing reports without location (read-only mode)

### 17. Enhanced Schema for Production
Consider extending the Prisma schema to include location data:

```prisma
model TrainReport {
  id             Int      @id @default(autoincrement())
  isTrainCrossing Boolean
  reportedAt     DateTime @default(now())
  expiresAt      DateTime? // Auto-calculated for crossing reports
  userIpAddress  String
  userAgent      String
  sessionId      String
  confidence     Float    @default(1.0) // User reliability score
  isExpired      Boolean  @default(false)
  flaggedAt      DateTime? // For suspicious reports

  // Location data for geo-fencing
  latitude       Float?   // User's latitude when reporting
  longitude      Float?   // User's longitude when reporting
  accuracy       Float?   // GPS accuracy in meters
  distanceToTrack Float?  // Calculated distance to nearest track point

  @@map("TrainReports")
  @@index([reportedAt])
  @@index([expiresAt])
  @@index([isExpired, reportedAt])
  @@index([latitude, longitude])
}

model UserSession {
  sessionId      String   @id
  firstSeenAt    DateTime @default(now())
  lastSeenAt     DateTime @default(now())
  reportCount    Int      @default(0)
  reliabilityScore Float  @default(1.0)
  isFlagged      Boolean  @default(false)

  @@map("UserSessions")
}

model TrackSegment {
  id        Int      @id @default(autoincrement())
  name      String   // e.g., "Main St Crossing"
  latitude  Float
  longitude Float
  order     Int      // For connecting track points in sequence
  isActive  Boolean  @default(true)

  @@map("TrackSegments")
  @@index([latitude, longitude])
}
```

### 18. Status Determination Logic
```bash
- [ ] Implement smart status calculation in /api/train-status
- [ ] Consider only non-expired reports from last 10 minutes
- [ ] Weight reports by user reliability and recency
- [ ] Handle edge cases (no recent reports, all expired, etc.)
```

**Example Algorithm:**
```typescript
function calculateTrainStatus(reports: TrainReport[]): boolean | null {
  // Only consider reports from last 10 minutes that aren't expired
  const recentReports = reports.filter(r =>
    !r.isExpired &&
    r.reportedAt > new Date(Date.now() - 10 * 60 * 1000)
  );

  if (recentReports.length === 0) return null;

  // Weight by recency and user reliability
  const weightedVotes = recentReports.map(r => ({
    vote: r.isTrainCrossing,
    weight: r.confidence * getRecencyWeight(r.reportedAt)
  }));

  const crossingWeight = weightedVotes
    .filter(v => v.vote)
    .reduce((sum, v) => sum + v.weight, 0);

  const clearWeight = weightedVotes
    .filter(v => !v.vote)
    .reduce((sum, v) => sum + v.weight, 0);

  return crossingWeight > clearWeight;
}
```

### 19. Auto-Expiration Implementation
```bash
- [ ] Create /api/expire-crossings API route
- [ ] Set up Vercel Cron Job to run every minute
- [ ] Update expired crossing reports to set isExpired = true
- [ ] Broadcast status changes via Pusher when expiration occurs
```

**Vercel Cron Job** (`vercel.json`):
```json
{
  "cron": [
    {
      "path": "/api/expire-crossings",
      "schedule": "* * * * *"
    }
  ]
}
```

## Security & Bot Protection

### 20. Bot Protection Setup
To prevent abuse and ensure only legitimate users can access the app:

**Search Engine Prevention:**
```bash
- [x] Create robots.txt in public/ directory ✅ *Blocks all search engines*
- [x] Disallow all crawlers and bots ✅ *Prevents indexing on Google, Bing, etc.*
```

**Human Verification Options (choose one):**

**Option A: Cloudflare Protection (Recommended for Vercel)**
```bash
- [ ] Add your domain to Cloudflare (free tier)
- [ ] Enable "Bot Fight Mode" in Cloudflare Security settings
- [ ] Enable "Challenge Passage" for suspicious traffic
- [ ] Configure Security Level to "Medium" or "High"
- [ ] Enable "Browser Integrity Check"
```

**Option B: Google reCAPTCHA v3**
```bash
- [ ] Sign up at https://www.google.com/recaptcha/admin
- [ ] Get site key and secret key
- [ ] Install: npm install react-google-recaptcha-v3
- [ ] Add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to .env.local
- [ ] Add RECAPTCHA_SECRET_KEY to .env.local
- [ ] Wrap app with GoogleReCaptchaProvider
- [ ] Verify token on API endpoints before accepting reports
```

**Option C: Vercel Edge Middleware Protection**
```bash
- [ ] Create middleware.ts in root directory
- [ ] Implement rate limiting per IP
- [ ] Add suspicious user-agent blocking
- [ ] Configure geo-blocking if needed
```

**Additional Security Measures:**
```bash
- [ ] Set Vercel deployment to "Private" or "Password Protected"
- [ ] Implement rate limiting on /api/train-reports endpoint
- [ ] Add CORS headers to restrict API access
- [ ] Monitor Vercel Analytics for suspicious traffic patterns
```

## Deployment

### 21. Vercel Deployment Setup
```bash
- [x] Install Vercel CLI: `npm i -g vercel` ✅ *Installed globally*
- [x] Login to Vercel: `vercel login` ✅ *Authenticated with Vercel account*
- [x] Link project: `vercel link` ✅ *Project linked from train-tracker-nextjs directory*
- [x] Set environment variables in Vercel dashboard ✅ *All environment variables configured*
- [x] Deploy: `vercel --prod` ✅ *Successfully deployed*
- [x] Fix framework preset: Set to "Next.js" in Vercel dashboard ✅ *Critical fix for routing*
- [x] Add Prisma postinstall script to package.json ✅ *"postinstall": "prisma generate"*
```

### 22. Environment Variables for Production
Add these to Vercel dashboard:
```bash
- [x] DATABASE_URL (Supabase production URL) ✅ *PostgreSQL connection string*
- [x] NEXTAUTH_SECRET (generate with: openssl rand -base64 32) ✅ *Secure random key generated*
- [x] NEXTAUTH_URL (your Vercel deployment URL) ✅ *https://train-tracker-[hash].vercel.app*
- [x] PUSHER_APP_ID="2056315" ✅ *Pusher app ID*
- [x] PUSHER_KEY ✅ *Pusher key*
- [x] PUSHER_SECRET ✅ *Pusher secret*
- [x] PUSHER_CLUSTER="us2" ✅ *Pusher cluster*
- [x] NEXT_PUBLIC_PUSHER_KEY ✅ *Public Pusher key*
- [x] NEXT_PUBLIC_PUSHER_CLUSTER="us2" ✅ *Public Pusher cluster*
```

### 22. Database Migration to Production
```bash
- [x] Update Supabase project for production ✅ *Using same Supabase database for dev/prod*
- [x] Run: `npx prisma db push` (with production DATABASE_URL) ✅ *Schema already synced*
- [x] Verify tables created in Supabase dashboard ✅ *TrainReports table exists and working*
```

### 23. Deployment Troubleshooting (Completed Issues)
```bash
- [x] Fixed Framework Preset: Changed from "Other" to "Next.js" in Vercel dashboard ✅ *Critical for Next.js routing*
- [x] Added Prisma postinstall script: "postinstall": "prisma generate" ✅ *Required for Vercel builds*
- [x] Fixed TypeScript errors: Removed 'any' types and unused imports ✅ *Build now passes*
- [x] Deployed from correct directory: train-tracker-nextjs/ ✅ *Proper project structure*
- [x] Environment variables configured correctly ✅ *All production variables set*
```

**Common Deployment Issues and Solutions:**
- **404 Not Found on all routes**: Check Framework Preset is set to "Next.js" not "Other"
- **Build fails with Prisma errors**: Add `"postinstall": "prisma generate"` to package.json scripts
- **TypeScript build errors**: Fix any `any` types and missing dependencies in useEffect
- **API routes not working**: Ensure deploying from correct directory with proper Next.js structure

## Migration from Current Stack

### 24. Data Migration (Optional)
If you want to keep existing data:
```bash
- [x] Export current PostgreSQL data: `pg_dump train_tracker > backup.sql` ✅ *Not needed - fresh start*
- [x] Import to Supabase via dashboard or psql ✅ *Using fresh database*
- [x] Verify data integrity with Prisma Studio ✅ *Schema verified*
```

### 25. Clean Up Old Stack (After Migration)
```bash
- [x] Archive or remove ASP.NET Core backend ✅ *Removed src/ directory*
- [x] Archive or remove old React Vite frontend ✅ *Removed train-tracker-web/ directory*
- [x] Keep documentation for reference ✅ *Setup docs preserved*
```

## Key Benefits of New Stack

### ✅ Deployment Advantages
- **Single deployment target**: Everything deploys to Vercel
- **Automatic HTTPS**: No SSL certificate management
- **CDN included**: Automatic edge caching globally
- **Zero config**: No server setup or maintenance

### ✅ Development Experience
- **Full-stack TypeScript**: Shared types between frontend/backend
- **Prisma type safety**: Fully typed database queries
- **Hot reload**: Instant updates in development
- **Built-in optimizations**: Image optimization, code splitting

### ✅ Real-time Simplicity
- **No WebSocket management**: Pusher/Ably handle connections
- **Generous free tiers**: More than enough for most use cases
- **Global infrastructure**: Low latency worldwide
- **Automatic reconnection**: Built into client libraries

### ✅ Database Benefits
- **Managed PostgreSQL**: No local setup required
- **Built-in dashboard**: View/edit data easily
- **Automatic backups**: Point-in-time recovery
- **Real-time subscriptions**: Database-level real-time (bonus!)

## Useful Commands Reference

### Development
```bash
npm run dev              # Start Next.js dev server
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx prisma generate      # Regenerate Prisma client
```

### Deployment
```bash
vercel                   # Deploy to preview
vercel --prod           # Deploy to production
vercel logs             # View deployment logs
```

### Database
```bash
npx prisma migrate dev   # Create and apply migration
npx prisma db seed      # Run seed script (if created)
npx prisma db pull      # Pull schema from database
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Check Supabase URL and network access
2. **Real-time Not Working**: Verify API keys and CORS settings
3. **Build Errors**: Check TypeScript errors and dependencies
4. **Vercel Deployment**: Verify environment variables match local

### Migration Issues
- **Schema differences**: Use `npx prisma db pull` to sync with existing DB
- **Data format**: May need to transform data during migration
- **Foreign keys**: Ensure referential integrity during import

This new stack will significantly simplify your deployment process while maintaining all the functionality of your current train tracker app!