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

### 4. Real-time Service Setup (Choose One)

#### Option A: Pusher (Recommended)
- [ ] Create Pusher account: https://pusher.com
- [ ] Create new Pusher Channels app
- [ ] Note down: App ID, Key, Secret, Cluster
- [ ] Free tier: 200k messages/day, 100 concurrent connections

#### Option B: Ably
- [ ] Create Ably account: https://ably.com
- [ ] Create new Ably app
- [ ] Get API key from dashboard
- [ ] Free tier: 6M messages/month, unlimited connections

## Project Setup

### 5. Create Next.js Project
```bash
- [ ] npx create-next-app@latest train-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
- [ ] cd train-tracker
- [ ] npm install
```

### 6. Install Dependencies
```bash
- [ ] npm install prisma @prisma/client
- [ ] npm install @types/node
- [ ] npm install lucide-react
- [ ] npm install date-fns
- [ ] npm install clsx tailwind-merge
```

#### Real-time Dependencies (Choose matching option from step 4)
```bash
# For Pusher:
- [ ] npm install pusher pusher-js

# For Ably:
- [ ] npm install ably
```

#### UI Components (Shadcn/ui)
```bash
- [ ] npx shadcn@latest init
- [ ] npx shadcn@latest add button
- [ ] npx shadcn@latest add card
- [ ] npx shadcn@latest add badge
- [ ] npx shadcn@latest add toast
```

### 7. Database Setup with Prisma
```bash
- [ ] npx prisma init
- [ ] Update .env with Supabase DATABASE_URL
- [ ] Create Prisma schema (see schema below)
- [ ] npx prisma generate
- [ ] npx prisma db push
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
- [ ] Add DATABASE_URL="your-supabase-connection-string"
- [ ] Add NEXTAUTH_SECRET="your-secret-key" (generate with: openssl rand -base64 32)
- [ ] Add NEXTAUTH_URL="http://localhost:3000"

# For Pusher:
- [ ] Add PUSHER_APP_ID="your-app-id"
- [ ] Add PUSHER_KEY="your-key"
- [ ] Add PUSHER_SECRET="your-secret"
- [ ] Add PUSHER_CLUSTER="your-cluster"
- [ ] Add NEXT_PUBLIC_PUSHER_KEY="your-key"
- [ ] Add NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"

# For Ably:
- [ ] Add ABLY_API_KEY="your-ably-api-key"
- [ ] Add NEXT_PUBLIC_ABLY_KEY="your-ably-api-key"
```

### 9. API Routes Setup
Create these API routes in `src/app/api/`:

```bash
- [ ] Create `src/app/api/train-reports/route.ts` (GET all reports)
- [ ] Create `src/app/api/train-reports/latest/route.ts` (GET latest report)
- [ ] Create `src/app/api/train-reports/create/route.ts` (POST new report)
```

### 10. Real-time Service Setup (Choose One)

#### For Pusher:
```bash
- [ ] Create `src/lib/pusher.ts` (server-side Pusher config)
- [ ] Create `src/hooks/usePusher.ts` (client-side hook)
- [ ] Add Pusher trigger to API routes
```

#### For Ably:
```bash
- [ ] Create `src/lib/ably.ts` (server-side Ably config)
- [ ] Create `src/hooks/useAbly.ts` (client-side hook)
- [ ] Add Ably publish to API routes
```

### 11. UI Components Migration
Migrate existing v0 components to Next.js structure:
```bash
- [ ] Create `src/components/ui/` folder for base components
- [ ] Create `src/components/train-status-indicator.tsx`
- [ ] Create `src/components/train-status-buttons.tsx`
- [ ] Create `src/components/recent-reports.tsx`
- [ ] Update imports to use Next.js paths
- [ ] Update components to use Next.js Image component
```

### 12. Main Page Setup
```bash
- [ ] Update `src/app/page.tsx` with train tracker UI
- [ ] Create `src/app/layout.tsx` with proper metadata
- [ ] Add global styles to `src/app/globals.css`
- [ ] Configure Tailwind config for dark theme
```

## Development & Testing

### 13. Local Development
```bash
- [ ] Run development server: `npm run dev`
- [ ] Test database connection: Check Prisma Studio `npx prisma studio`
- [ ] Test API endpoints: Use browser or Postman
- [ ] Test real-time functionality: Open multiple browser tabs
```

### 14. Database Management
```bash
- [ ] View data: `npx prisma studio`
- [ ] Reset database: `npx prisma db push --force-reset`
- [ ] Generate types: `npx prisma generate`
```

## Deployment Preparation

### 15. Vercel Deployment Setup
```bash
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy: `vercel --prod`
```

### 16. Environment Variables for Production
Add these to Vercel dashboard:
```bash
- [ ] DATABASE_URL (Supabase production URL)
- [ ] NEXTAUTH_SECRET (same as local)
- [ ] NEXTAUTH_URL (your-domain.vercel.app)
- [ ] PUSHER_* or ABLY_* variables (same as local)
```

### 17. Database Migration to Production
```bash
- [ ] Update Supabase project for production
- [ ] Run: `npx prisma db push` (with production DATABASE_URL)
- [ ] Verify tables created in Supabase dashboard
```

## Migration from Current Stack

### 18. Data Migration (Optional)
If you want to keep existing data:
```bash
- [ ] Export current PostgreSQL data: `pg_dump train_tracker > backup.sql`
- [ ] Import to Supabase via dashboard or psql
- [ ] Verify data integrity with Prisma Studio
```

### 19. Clean Up Old Stack (After Migration)
```bash
- [ ] Archive or remove ASP.NET Core backend
- [ ] Archive or remove old React Vite frontend
- [ ] Keep documentation for reference
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