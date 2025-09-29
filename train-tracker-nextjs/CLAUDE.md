# Claude Code Instructions for Train Tracker App

## Pre-Deployment Checklist

**IMPORTANT**: After making any code changes, you MUST run the following checks before considering the task complete:

### 1. Linting Check
Run ESLint to catch any code quality issues:
```bash
npm run lint
```
Fix any errors or warnings that appear. Common issues:
- Unescaped apostrophes (use `&apos;` or backticks)
- Missing dependencies in useEffect hooks
- Unused variables

### 2. Type Checking
Ensure TypeScript compilation passes:
```bash
npm run build
```
This will also run the type checker and catch any TypeScript errors.

### 3. Development Server Test
Test the app locally before deployment:
```bash
npm run dev
```
Then verify:
- No console errors
- Location permission flow works correctly
- Real-time updates via Pusher work
- Responsive layout works on mobile

## Project Structure

- `/src/app` - Next.js 14+ app router pages and API routes
- `/src/components` - React components
- `/src/hooks` - Custom React hooks (e.g., useLocationPermission)
- `/src/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations

## Key Features

1. **Location Permission Management**: Automatic request on first load, retry mechanism for denied permissions
2. **Geofencing**: Validates user location against configured zones
3. **Real-time Updates**: Uses Pusher for live train status updates
4. **Responsive Design**: Mobile-first with Tailwind CSS

## Environment Variables

Required for deployment:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_PUSHER_*` - Pusher configuration
- `PUSHER_*` - Server-side Pusher credentials

## Common Fixes

### ESLint Errors
- Apostrophes: Replace `'` with `&apos;` in JSX text
- React hooks: Ensure all dependencies are included

### Prisma Errors
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync database

### Vercel Deployment
- Always run `npm run build` locally first
- Check build logs for any errors
- Ensure all environment variables are set in Vercel dashboard

## Testing Commands

Run these before pushing changes:
```bash
npm run lint && npm run build
```

If both pass, the deployment to Vercel should succeed.

## Deployment

To deploy to production (automatically updates train-tracker-xi.vercel.app):
```bash
vercel --prod
```

The `vercel.json` configuration automatically aliases deployments to the production domain.