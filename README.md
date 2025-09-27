# Train Tracker Application

A real-time train tracking application built with ASP.NET Core, React, and PostgreSQL.

## Tech Stack

- **Backend**: ASP.NET Core 8 Web API
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL 16
- **Real-time**: SignalR
- **Styling**: Tailwind CSS

## Prerequisites

- .NET 8+ SDK
- Node.js 18+
- PostgreSQL 16
- npm or yarn

## Project Structure

```
train-tracker/
├── src/
│   └── TrainTracker.Api/       # ASP.NET Core Web API
├── train-tracker-web/          # React frontend
└── train-tracker-setup.md      # Detailed setup checklist
```

## Quick Start

### 1. Database Setup

Make sure PostgreSQL is installed and running:

```bash
# Start PostgreSQL service (if not already running)
brew services start postgresql@16

# Connect to PostgreSQL
psql -U postgres

# Create the database (if it doesn't exist)
CREATE DATABASE train_tracker;

# Exit psql
\q
```

### 2. Backend API

Navigate to the API directory and run:

```bash
cd src/TrainTracker.Api
dotnet run
```

The API will start at: http://localhost:5073
- Swagger documentation: http://localhost:5073/swagger

### 3. Frontend Application

In a new terminal, navigate to the frontend directory and run:

```bash
cd train-tracker-web
npm run dev
```

The frontend will start at: http://localhost:5173

## Development Commands

### Backend Commands

```bash
# Navigate to API directory
cd src/TrainTracker.Api

# Restore packages
dotnet restore

# Build the project
dotnet build

# Run the API
dotnet run

# Run with hot reload
dotnet watch run

# Add Entity Framework migration
dotnet ef migrations add <MigrationName>

# Update database
dotnet ef database update
```

### Frontend Commands

```bash
# Navigate to frontend directory
cd train-tracker-web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Management

### PostgreSQL Commands

```bash
# Connect to PostgreSQL
psql -U postgres

# Connect to train_tracker database
\c train_tracker

# List all tables
\dt

# View table structure
\d table_name

# Exit psql
\q
```

### Connection String

The database connection string is configured in `src/TrainTracker.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=train_tracker;Username=postgres;Password="
  }
}
```

Update the password if you have one set for your PostgreSQL user.

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend default port: 5073
   - Frontend default port: 5173
   - Check if ports are free: `lsof -i :5073` or `lsof -i :5173`

2. **PostgreSQL Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   brew services list

   # Restart PostgreSQL
   brew services restart postgresql@16
   ```

3. **Node Version Issues**
   - The frontend requires Node.js 18+
   - Check version: `node --version`
   - Consider using nvm to manage Node versions

4. **Database Doesn't Exist**
   ```sql
   -- Create database if it doesn't exist
   CREATE DATABASE train_tracker;
   ```

## API Endpoints

Once the API is running, you can explore all available endpoints at:
http://localhost:5073/swagger

## Features (In Development)

- Real-time train status updates via SignalR
- Report train sightings
- Mark crossing as clear
- View recent train reports
- Timestamp tracking for all reports

## Environment Variables

For production deployment, set these environment variables:

- `ConnectionStrings__DefaultConnection`: PostgreSQL connection string
- `ASPNETCORE_ENVIRONMENT`: Set to `Production` for production deployment
- `CORS__AllowedOrigins`: Frontend URL(s) for CORS configuration

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]