# Train Tracker App - Setup Checklist

## Prerequisites Installation

### 1. Core Development Tools
- [x] Install Homebrew (if not installed): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` ✅ *Installed: v4.5.10*
- [x] Install .NET 8 SDK: `brew install --cask dotnet-sdk` ✅ *Installed: v9.0.200*
- [x] Verify .NET installation: `dotnet --version` (should show 8.0.x) ✅ *Version: 9.0.200*
- [x] Install Node.js (LTS): `brew install node` ✅ *Installed: v18.18.0*
- [x] Verify Node/npm: `node --version && npm --version` ✅ *Node: v18.18.0, npm: 9.8.1*

### 2. Database Setup
- [x] Install PostgreSQL: `brew install postgresql@16` ✅ *Installed: v16.10*
- [x] Start PostgreSQL: `brew services start postgresql@16` ✅ *Service started*
- [x] Create database user: `createuser -s postgres` ✅ *User created*
- [x] Install pgAdmin (optional GUI): `brew install --cask pgadmin4` ✅ *Installed: v9.8*

### 3. VS Code Extensions
- [x] Install C# Dev Kit extension ✅ *Already installed: ms-dotnettools.csdevkit*
- [x] Install C# extension ✅ *Already installed: ms-dotnettools.csharp*
- [x] Install ESLint extension ✅ *Installed: dbaeumer.vscode-eslint v3.0.16*
- [x] Install Prettier extension ✅ *Installed: esbenp.prettier-vscode v11.0.0*
- [x] Install Tailwind CSS IntelliSense ✅ *Installed: bradlc.vscode-tailwindcss v0.14.26*
- [x] Install PostgreSQL extension (by Chris Kolkman) ✅ *Installed: ckolkman.vscode-postgres v1.4.3*
- [x] Install Thunder Client (for API testing) ✅ *Installed: rangav.vscode-thunder-client v2.37.8*

## Project Setup

### 4. Create Project Structure
```bash
- [x] mkdir train-tracker && cd train-tracker ✅ *Already in train-tracker directory*
- [x] mkdir src ✅ *Created*
- [x] cd src ✅ *Ready for backend setup*
```

### 5. Backend Setup (ASP.NET Core 8)
```bash
- [ ] dotnet new webapi -n TrainTracker.Api --no-https
- [ ] cd TrainTracker.Api
```

#### Install NuGet Packages
```bash
- [ ] dotnet add package Microsoft.EntityFrameworkCore.Design
- [ ] dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
- [ ] dotnet add package Microsoft.AspNetCore.SignalR
- [ ] dotnet add package Microsoft.AspNetCore.OpenApi
- [ ] dotnet add package Swashbuckle.AspNetCore
```

#### Configure Database Connection
- [ ] Create `appsettings.Development.json` with PostgreSQL connection string
- [ ] Set up Entity Framework DbContext
- [ ] Create Train entity model
- [ ] Create TrainReport entity model

### 6. Frontend Setup (React + TypeScript + Vite)
```bash
- [ ] cd ../../ # Back to train-tracker root
- [ ] npm create vite@latest train-tracker-web -- --template react-ts
- [ ] cd train-tracker-web
- [ ] npm install
```

#### Install Frontend Dependencies
```bash
- [ ] npm install @microsoft/signalr
- [ ] npm install axios
- [ ] npm install -D tailwindcss postcss autoprefixer
- [ ] npx tailwindcss init -p
- [ ] npm install @types/react @types/react-dom
- [ ] npm install date-fns
```

#### Configure Tailwind CSS
- [ ] Update `tailwind.config.js` with content paths
- [ ] Add Tailwind directives to `src/index.css`

## Core Implementation Tasks

### 7. Backend Implementation
- [ ] Create `Models/Train.cs` entity
- [ ] Create `Models/TrainReport.cs` entity
- [ ] Create `Data/TrainTrackerContext.cs` DbContext
- [ ] Create `Hubs/TrainHub.cs` SignalR hub
- [ ] Create `Controllers/TrainReportsController.cs`
- [ ] Configure CORS for frontend URL
- [ ] Configure SignalR in `Program.cs`
- [ ] Add database migration: `dotnet ef migrations add InitialCreate`
- [ ] Update database: `dotnet ef database-update`

### 8. Frontend Implementation
- [ ] Create `src/services/api.ts` for API calls
- [ ] Create `src/services/signalr.ts` for SignalR connection
- [ ] Create `src/types/index.ts` for TypeScript interfaces
- [ ] Create `src/components/TrainStatus.tsx` component
- [ ] Create `src/components/ReportButton.tsx` component
- [ ] Create `src/components/RecentReports.tsx` component
- [ ] Update `App.tsx` with main layout
- [ ] Style components with Tailwind CSS

### 9. Integration & Features
- [ ] Test SignalR connection between frontend and backend
- [ ] Implement "Report Train" functionality
- [ ] Implement "All Clear" functionality
- [ ] Add real-time updates via SignalR
- [ ] Display recent reports with timestamps
- [ ] Add loading states and error handling
- [ ] Implement optimistic UI updates

## Testing & Deployment Preparation

### 10. Local Testing
- [ ] Run backend: `cd src/TrainTracker.Api && dotnet run`
- [ ] Run frontend: `cd train-tracker-web && npm run dev`
- [ ] Test real-time updates with multiple browser tabs
- [ ] Test database persistence
- [ ] Test error scenarios

### 11. Production Preparation
- [ ] Create `Dockerfile` for ASP.NET Core API
- [ ] Create production `appsettings.Production.json`
- [ ] Configure environment variables for connection strings
- [ ] Build frontend for production: `npm run build`
- [ ] Create `.dockerignore` file
- [ ] Create `docker-compose.yml` for local testing

### 12. Deployment Setup (Fly.io)
- [ ] Install Fly CLI: `brew install flyctl`
- [ ] Sign up/login: `fly auth login`
- [ ] Create Fly app: `fly launch`
- [ ] Configure `fly.toml`
- [ ] Set secrets: `fly secrets set ConnectionStrings__DefaultConnection="..."`
- [ ] Deploy: `fly deploy`

## Future Enhancements (Post-MVP)
- [ ] Add user authentication (optional)
- [ ] Implement train prediction AI
- [ ] Add push notifications
- [ ] Create mobile app version
- [ ] Add train direction tracking
- [ ] Implement data analytics dashboard
- [ ] Add multiple crossing support

## Useful Commands Reference

### Backend Commands
```bash
dotnet run                    # Run the API
dotnet ef migrations add <Name>  # Create new migration
dotnet ef database update     # Apply migrations
dotnet watch run              # Run with hot reload
```

### Frontend Commands
```bash
npm run dev                   # Run development server
npm run build                 # Build for production
npm run preview               # Preview production build
```

### PostgreSQL Commands
```bash
psql -U postgres              # Connect to PostgreSQL
\l                           # List databases
\c train_tracker             # Connect to database
\dt                          # List tables
```

### Docker Commands
```bash
docker build -t train-tracker-api .  # Build Docker image
docker run -p 5000:5000 train-tracker-api  # Run container
```

## Troubleshooting Tips
- If PostgreSQL connection fails, check if service is running: `brew services list`
- For CORS issues, ensure frontend URL is added to allowed origins in API
- If SignalR disconnects, check WebSocket support and proxy settings
- For EF Core issues, ensure migrations are applied: `dotnet ef database update`