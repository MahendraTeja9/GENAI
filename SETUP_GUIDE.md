# GenAI Hiring System - Complete Setup Guide

## Prerequisites

### Required Software
1. **Docker Desktop** - Download from [docker.com](https://www.docker.com/products/docker-desktop)
2. **Git** - Download from [git-scm.com](https://git-scm.com/downloads)
3. **Code Editor** (optional) - VS Code, PyCharm, etc.

### Required API Keys (Optional but Recommended)
1. **OpenAI API Key** - For AI-powered job description generation
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Generate API key in your account settings

2. **Email SMTP Settings** - For sending notifications
   - Gmail: Use App Passwords (2FA required)
   - Other providers: SMTP credentials

## Quick Start (5 Minutes)

### Option 1: Using Docker (Recommended)

1. **Clone or Download the Project**
   ```bash
   # If you have Git
   git clone <repository-url>
   cd genai-hiring-system
   
   # Or download and extract the ZIP file
   ```

2. **Configure Environment**
   ```bash
   # Copy the example environment file
   copy env.example .env
   
   # Edit .env file with your settings (see Configuration section below)
   ```

3. **Start the System**
   ```bash
   # Windows
   start.bat
   
   # Linux/Mac
   ./start.sh
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

1. **Start Database Services**
   ```bash
   docker-compose up postgres redis -d
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python init_db.py
   uvicorn app.main:app --reload
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Configuration

### Environment Variables (.env file)

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/genai_hiring
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=genai_hiring

# Redis Configuration  
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# API Configuration
API_HOST=localhost
API_PORT=8000
API_BASE_URL=http://localhost:8000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_HOST=localhost
REACT_APP_PORT=3000

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI Configuration (Optional - for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here
LLM_MODEL=gpt-3.5-turbo

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Application Settings
DEBUG=True
ENVIRONMENT=development
SECRET_KEY=your-super-secret-key-change-this-in-production

# Scoring Configuration
MATCH_SCORE_WEIGHT=0.5
ATS_SCORE_WEIGHT=0.5
SHORTLIST_THRESHOLD=80
REQUALIFY_THRESHOLD=60
```

### Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in SMTP_PASSWORD

## Test Users

After setup, you can login with these test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@example.com | password123 | Full system access |
| HR | hr@example.com | password123 | Job approval & candidate management |
| Account Manager | manager@example.com | password123 | Job creation & management |

## System Components

### Backend (FastAPI)
- **Port**: 8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Frontend (React)
- **Port**: 3000
- **URL**: http://localhost:3000

### Database (PostgreSQL)
- **Port**: 5432
- **Database**: genai_hiring
- **Username**: postgres
- **Password**: password

### Cache (Redis)
- **Port**: 6379

## System Workflow

### 1. Account Manager Workflow
1. Login → Dashboard
2. Create New Job → Enter basic details
3. Generate AI Fields → Review and edit
4. Generate Job Description → Review and edit  
5. Submit for HR approval

### 2. HR Workflow
1. Login → HR Dashboard
2. Review pending job approvals
3. Approve jobs → Auto-publish to careers page
4. Manage candidate applications
5. Review AI-generated candidate scores
6. Shortlist/reject candidates

### 3. Candidate Workflow
1. Visit careers page → Browse jobs
2. View job details → Apply with resume
3. Receive confirmation email
4. System processes application with AI
5. Receive status updates via email

## Troubleshooting

### Common Issues

1. **Docker not starting**
   - Ensure Docker Desktop is running
   - Check Docker resources (CPU/Memory)
   - Try: `docker-compose down` then `docker-compose up --build`

2. **Backend API errors**
   - Check logs: `docker-compose logs backend`
   - Verify database connection
   - Ensure .env file is configured

3. **Frontend not loading**
   - Check logs: `docker-compose logs frontend`
   - Verify API connection
   - Try clearing browser cache

4. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Wait for database to fully start (30 seconds)

5. **OpenAI API errors**
   - Verify OPENAI_API_KEY is correct
   - Check API quota and billing
   - AI features are optional - system works without them

### Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build

# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up --build
```

## Development Setup

For development with hot reloading:

```bash
# Start only database services
docker-compose up postgres redis -d

# Run backend manually
cd backend
pip install -r requirements.txt
python init_db.py
uvicorn app.main:app --reload

# Run frontend manually (new terminal)
cd frontend
npm install
npm start
```

## Production Deployment

For production deployment:

1. **Update Environment Variables**
   - Set DEBUG=False
   - Use strong SECRET_KEY and JWT_SECRET_KEY
   - Configure production database
   - Set up proper SMTP settings

2. **Security Considerations**
   - Use HTTPS
   - Configure CORS properly
   - Set up firewall rules
   - Use environment secrets management

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation with:
- Authentication endpoints
- Job management
- Application processing
- AI-powered features

## Support

For issues:
1. Check this guide and README.md
2. Review application logs
3. Verify configuration
4. Check GitHub issues (if available)

## License

This is proprietary software. All rights reserved.
