# Train Tracker Application

A modern real-time train tracking application built with Next.js, Prisma, and Pusher.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (full-stack React framework with Turbopack)
- **Database**: PostgreSQL via Supabase (managed cloud database)
- **ORM**: Prisma (type-safe database access)
- **Real-time**: Pusher Channels (managed WebSocket service)
- **Styling**: Tailwind CSS v4 + Shadcn/ui components
- **Icons**: Lucide React
- **Deployment**: Vercel (optimized for Next.js)
- **Design**: Modern dark theme with v0-inspired components

## ✨ Features

- ✅ **Real-time train status updates** via Pusher
- ✅ **Report train crossings and clear tracks**
- ✅ **View recent reports** with timestamps and session tracking
- ✅ **Beautiful dark theme UI** with smooth animations
- ✅ **Responsive design** for mobile and desktop
- ✅ **Connection status indicator** shows real-time connectivity
- ✅ **60-second cooldown system** prevents spam reporting
- ✅ **Auto-expiring status** (crossing reports expire after 10 minutes)
- ✅ **Conflict resolution** with weighted voting system
- ✅ **Type-safe API** with full TypeScript integration

## 🏗️ Project Structure

```
train-tracker/
├── train-tracker-nextjs/           # Next.js 14 application
│   ├── src/
│   │   ├── app/                    # App Router (pages and API routes)
│   │   │   ├── api/                # API endpoints
│   │   │   │   ├── train-reports/  # GET/POST train reports
│   │   │   │   ├── train-status/   # GET current status
│   │   │   │   └── test/           # Database connection test
│   │   │   ├── globals.css         # Global styles with dark theme
│   │   │   └── page.tsx            # Main train tracker page
│   │   ├── components/             # React components
│   │   │   ├── ui/                 # Shadcn/ui base components
│   │   │   ├── train-tracker.tsx   # Main app component
│   │   │   ├── status-indicator.tsx
│   │   │   ├── train-status-buttons.tsx
│   │   │   └── recent-reports.tsx
│   │   ├── lib/                    # Utilities
│   │   │   └── pusher.ts           # Pusher client/server config
│   │   └── types/                  # TypeScript type definitions
│   ├── prisma/                     # Database schema and migrations
│   └── .env.local                  # Environment variables
├── train-tracker-setup-nextjs.md   # Detailed setup checklist
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for managed PostgreSQL)
- Pusher account (for real-time updates)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd train-tracker/train-tracker-nextjs
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Real-time (Pusher)
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="us2"
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open database GUI
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio        # Open database GUI
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes
npx prisma db pull       # Pull schema from database

# Linting and formatting
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
```

## 🗄️ Database Schema

```prisma
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

## 🌐 API Endpoints

- `GET /api/train-reports` - Fetch recent train reports
- `POST /api/train-reports` - Submit new train report
- `GET /api/train-status` - Get current train crossing status
- `GET /api/test` - Test database connection

## 🎨 UI Components

### Core Components

- **TrainTracker**: Main application component with state management
- **StatusIndicator**: Real-time status display with visual indicators
- **TrainStatusButtons**: Large buttons for reporting with cooldown
- **RecentReports**: Timeline of recent reports with animations

### Design Features

- **Dark Theme**: Modern dark mode with blue accents
- **Animations**: Pulse effects, slide-in animations, smooth transitions
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: High contrast, semantic HTML, keyboard navigation
- **Real-time**: Instant updates across all connected clients

## ⚡ Real-time Architecture

```
User Reports → Next.js API → Database → Pusher → All Connected Clients
```

1. User submits report via UI
2. API saves to database and broadcasts via Pusher
3. All connected clients receive update instantly
4. UI updates automatically without page refresh

## 🚀 Deployment

### Vercel (Recommended) ✅ DEPLOYED

**Live Production URL**: [Train Tracker on Vercel](https://train-tracker-deuo2l27f-lloyds-projects-3f72275e.vercel.app)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy (run from train-tracker-nextjs/ directory)
vercel login
vercel link
vercel --prod
```

**Important Setup Steps:**
1. Set Framework Preset to "Next.js" in Vercel dashboard (not "Other")
2. Add `"postinstall": "prisma generate"` to package.json scripts
3. Add all environment variables in Vercel dashboard
4. Deploy from the `train-tracker-nextjs/` directory

### Environment Variables for Production ✅ CONFIGURED

- `DATABASE_URL`: Supabase production connection string
- `NEXTAUTH_SECRET`: Authentication secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your Vercel deployment URL
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`: Pusher credentials
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`: Public Pusher variables

## 🔧 Troubleshooting

### Common Issues

1. **Vercel Deployment 404 Errors**
   - ✅ **SOLVED**: Set Framework Preset to "Next.js" (not "Other") in Vercel dashboard
   - Add `"postinstall": "prisma generate"` to package.json scripts
   - Deploy from `train-tracker-nextjs/` directory, not root
   - Use `vercel --prod --force` to override cached settings

2. **Database Connection Errors**
   - Check Supabase connection string
   - Ensure URL encoding for special characters in password
   - Verify network access to Supabase

3. **Real-time Not Working**
   - Check Pusher credentials in `.env.local`
   - Verify Pusher app is active
   - Check browser console for connection errors

4. **Build Errors**
   - Fix TypeScript errors (no `any` types, proper imports)
   - Verify all environment variables are set
   - Check for missing dependencies

5. **Prisma Issues**
   - Regenerate client: `npx prisma generate`
   - Check schema syntax in `prisma/schema.prisma`
   - Verify database schema matches Prisma schema

## 📚 Additional Resources

- **Setup Guide**: See `train-tracker-setup-nextjs.md` for detailed setup instructions
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **Pusher Docs**: [pusher.com/docs](https://pusher.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

## 🔄 Migration Notes

This application was migrated from ASP.NET Core + React + SignalR to Next.js + Prisma + Pusher for:
- **Simplified deployment** (single Vercel deployment vs multiple services)
- **Better performance** (Next.js optimizations and edge functions)
- **Improved developer experience** (full-stack TypeScript, hot reload)
- **Lower complexity** (managed services vs self-hosted infrastructure)

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]