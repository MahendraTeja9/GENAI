# Database Not Creating - Troubleshooting Guide

## The Problem
If your friend is saying "the database is not creating," here are the most likely issues and solutions:

## Quick Fixes (Try These First)

### 1. **Make sure Docker is running**
```bash
# Check if Docker is running
docker info

# If not running, start Docker Desktop
```

### 2. **Wait longer for database startup**
The PostgreSQL database takes time to fully initialize. Your friend should:
```bash
# Wait 60-90 seconds after running start.bat
# Then check if it's working:
docker-compose logs postgres
```

### 3. **Check if services are actually running**
```bash
# See all running containers
docker-compose ps

# Check specific logs
docker-compose logs postgres
docker-compose logs backend
```

## Step-by-Step Debugging

### Step 1: Clean Start
```bash
# Stop everything
docker-compose down

# Remove old volumes (this deletes the database data)
docker-compose down -v

# Start fresh
start.bat
```

### Step 2: Check Database Connection
The database should be accessible at:
- **Host**: localhost
- **Port**: 5432
- **Database**: genai_hiring
- **Username**: postgres
- **Password**: password

### Step 3: Manual Database Check
```bash
# Connect to database container
docker-compose exec postgres psql -U postgres -d genai_hiring

# Inside PostgreSQL, check tables:
\dt

# Should see tables like: users, companies, jobs, applications
# Type \q to exit
```

### Step 4: Check Backend Logs
```bash
# Look for database connection errors
docker-compose logs backend

# Look for these error patterns:
# - "connection refused"
# - "database does not exist"
# - "authentication failed"
```

## Common Issues & Solutions

### Issue 1: "Database connection refused"
**Cause**: PostgreSQL container isn't ready yet
**Solution**: 
```bash
# Wait 60-90 seconds, then restart backend
docker-compose restart backend
```

### Issue 2: "Authentication failed"
**Cause**: Wrong password in .env file
**Solution**: 
```bash
# Edit .env file, make sure it has:
POSTGRES_PASSWORD=password
DATABASE_URL=postgresql://postgres:password@localhost:5432/genai_hiring
```

### Issue 3: "Database does not exist"
**Cause**: PostgreSQL started but database wasn't created
**Solution**:
```bash
# Create database manually
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE genai_hiring;"
```

### Issue 4: Tables not created
**Cause**: Backend couldn't connect to create tables
**Solution**:
```bash
# Restart backend after database is ready
docker-compose restart backend

# Or run table creation manually
docker-compose exec backend python init_db.py
```

### Issue 5: Port conflicts
**Cause**: Port 5432 already in use
**Solution**: 
```bash
# Check what's using port 5432
netstat -an | findstr 5432

# Kill other PostgreSQL instances or change port in docker-compose.yml
```

## Manual Database Setup (If Docker fails)

If Docker isn't working, your friend can install PostgreSQL manually:

1. **Install PostgreSQL 15+**
2. **Create database**:
   ```sql
   CREATE DATABASE genai_hiring;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE genai_hiring TO postgres;
   ```
3. **Update .env file**:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/genai_hiring
   ```
4. **Run backend manually**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python init_db.py
   uvicorn app.main:app --reload
   ```

## Verification Steps

After fixing, verify everything works:

### 1. Check Database
```bash
# All containers running
docker-compose ps

# Database accessible
docker-compose exec postgres psql -U postgres -d genai_hiring -c "\dt"
```

### 2. Check Backend
```bash
# Backend health check
curl http://localhost:8000/health

# API documentation accessible
open http://localhost:8000/docs
```

### 3. Check Test Data
```bash
# Look for test users
docker-compose exec postgres psql -U postgres -d genai_hiring -c "SELECT email, user_type FROM users;"

# Should show:
# admin@example.com | admin
# hr@example.com | hr  
# manager@example.com | account_manager
```

## Get Detailed Logs

For debugging, collect these logs:
```bash
# All services
docker-compose logs > debug_logs.txt

# Specific service logs
docker-compose logs postgres > postgres_logs.txt
docker-compose logs backend > backend_logs.txt

# System info
docker info > docker_info.txt
```

## Still Not Working?

If none of this works, your friend should:

1. **Send you the logs**:
   ```bash
   docker-compose logs
   ```

2. **Check system requirements**:
   - Windows 10/11 with WSL2 enabled
   - At least 4GB RAM available for Docker
   - At least 2GB free disk space

3. **Try the manual setup** (without Docker):
   - Install PostgreSQL and Redis manually
   - Run backend and frontend manually
   - See SETUP_GUIDE.md for manual setup instructions

## Success Indicators

Your friend will know it's working when:
- ✅ `docker-compose ps` shows all services "Up" and "healthy"
- ✅ `http://localhost:8000/health` returns a success response
- ✅ `http://localhost:3000` loads the React frontend
- ✅ They can login with `admin@example.com` / `password123`
