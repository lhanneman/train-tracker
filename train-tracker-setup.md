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
- [x] dotnet new webapi -n TrainTracker.Api --no-https ✅ *Created*
- [x] cd TrainTracker.Api ✅ *Ready*
```

#### Install NuGet Packages
```bash
- [x] dotnet add package Microsoft.EntityFrameworkCore.Design ✅ *v9.0.9*
- [x] dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL ✅ *v9.0.2*
- [x] dotnet add package Microsoft.AspNetCore.SignalR ✅ *Included*
- [x] dotnet add package Microsoft.AspNetCore.OpenApi ✅ *v9.0.9*
- [x] dotnet add package Swashbuckle.AspNetCore ✅ *v7.4.0*
```

#### Configure Database Connection
- [x] Create `appsettings.Development.json` with PostgreSQL connection string ✅ *Created*
- [x] Set up Entity Framework DbContext ✅ *TrainTrackerContext.cs*
- [x] Create Train entity model ✅ *Models/Train.cs*
- [x] Create TrainReport entity model ✅ *Models/TrainReport.cs*

### 6. Frontend Setup (React + TypeScript + Vite)
```bash
- [x] cd ../../ # Back to train-tracker root ✅ *Navigated*
- [x] npm create vite@latest train-tracker-web -- --template react-ts ✅ *Created*
- [x] cd train-tracker-web ✅ *Changed directory*
- [x] npm install ✅ *Dependencies installed*
```

#### Install Frontend Dependencies
```bash
- [x] npm install @microsoft/signalr ✅ *v8.0.9*
- [x] npm install axios ✅ *v1.7.9*
- [x] npm install -D tailwindcss postcss autoprefixer ✅ *Installed*
- [x] npx tailwindcss init -p ✅ *Config files created manually*
- [x] npm install @types/react @types/react-dom ✅ *Type definitions installed*
- [x] npm install date-fns ✅ *v4.1.0*
```

#### Configure Tailwind CSS
- [x] Update `tailwind.config.js` with content paths ✅ *Configured*
- [x] Add Tailwind directives to `src/index.css` ✅ *Added*

## Core Implementation Tasks

### 7. Backend Implementation
- [x] Update `Models/TrainReport.cs` entity for simplified user reports ✅ *Updated*
  - IsTrainCrossing (boolean) - true if train is crossing, false if tracks are clear
  - ReportedAt (DateTime UTC) - when the report was made
  - UserIpAddress (string) - user's IP address
  - UserAgent (string) - browser/device info
  - SessionId (string) - unique session identifier
- [x] Remove `Models/Train.cs` entity (not needed for simplified approach) ✅ *Removed*
- [x] Update `Data/TrainTrackerContext.cs` DbContext for new model structure ✅ *Updated*
- [x] Create `Hubs/TrainHub.cs` SignalR hub for real-time updates ✅ *Created*
- [x] Create `Controllers/TrainReportsController.cs` with endpoints: ✅ *Created*
  - POST /api/trainreports - submit new report
  - GET /api/trainreports/recent - get recent reports (last 24 hours)
  - GET /api/trainreports/latest - get most recent report status
- [x] Add IP address and User-Agent extraction middleware/service ✅ *UserInfoService created*
- [x] Configure SignalR in `Program.cs` ✅ *Configured*
- [x] Add database migration: `dotnet ef migrations add InitialCreate` ✅ *Migration created*
- [x] Update database: `dotnet ef database update` ✅ *Database updated*

### 8. Frontend Implementation
- [x] Create `src/types/index.ts` for TypeScript interfaces (TrainReport type) ✅ *Created*
- [x] Create `src/services/api.ts` for API calls to backend endpoints ✅ *Created*
- [x] Create `src/services/signalr.ts` for SignalR connection and real-time updates ✅ *Created*
- [x] Create `src/components/TrainCrossingStatus.tsx` - displays current status ✅ *Created*
- [x] Create `src/components/ReportButtons.tsx` - "Train Crossing" and "All Clear" buttons ✅ *Created*
- [x] Create `src/components/RecentReports.tsx` - list of recent reports with timestamps ✅ *Created*
- [x] Create `src/components/ConnectionStatus.tsx` - SignalR connection indicator ✅ *Created*
- [x] Update `App.tsx` with main layout and component integration ✅ *Updated*
- [x] Style components with Tailwind CSS for mobile-first responsive design ✅ *Styled*

### 9. Integration & Features
- [x] Test SignalR connection between frontend and backend ✅ *SignalR hub accessible*
- [x] Implement "Train Crossing" report functionality (IsTrainCrossing = true) ✅ *Working*
- [x] Implement "All Clear" report functionality (IsTrainCrossing = false) ✅ *Working*
- [x] Add real-time updates via SignalR when new reports are submitted ✅ *Implemented*
- [x] Display recent reports (last 24 hours) with timestamps in local time ✅ *Working*
- [x] Add loading states and error handling for API calls ✅ *Implemented*
- [x] Implement optimistic UI updates for better user experience ✅ *Implemented*
- [x] Add visual indicators for current crossing status ✅ *Working*
- [x] Include user session tracking for report attribution ✅ *Working with cookies*

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

### 12. Deployment Setup (TBD - Azure App Service)


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