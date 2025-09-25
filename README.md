# GenAI-Powered Candidate Shortlisting System

A comprehensive AI-powered hiring system with separate dashboards for Account Managers, HR, and a public careers page for candidates.

## Features

### For Account Managers
- Create job postings with AI-generated fields and descriptions
- Submit jobs for HR approval
- Track job status and applications

### For HR Teams
- Review and approve job postings
- Manage candidate applications with AI-powered scoring
- Automated candidate shortlisting based on match and ATS scores
- Interview scheduling and status management

### For Candidates
- Browse available job positions
- Apply with resume upload and parsing
- Check application status
- Automated email notifications

### AI Features
- LLM integration for job description generation
- Resume parsing and skill extraction
- Automated candidate scoring (Match + ATS scores)
- Smart candidate shortlisting with configurable thresholds

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router, React Query
- **Backend**: Python FastAPI, SQLAlchemy, PostgreSQL
- **Cache**: Redis
- **AI/ML**: OpenAI GPT integration, Custom scoring algorithms
- **Email**: SMTP integration for notifications
- **File Handling**: Resume parsing (PDF/DOCX support)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- OpenAI API key (optional, for AI features)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd genai-hiring-system
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Run database migrations (create tables)
   python -c "from app.database import create_tables; create_tables()"
   
   # Start the backend server
   uvicorn app.main:app --reload --host localhost --port 8000
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Database & Redis**
   - Start PostgreSQL on port 5432
   - Start Redis on port 6379
   - Or use Docker: `docker-compose up postgres redis`

### Using Docker (Recommended)

1. **Start all services**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Backend API (port 8000)
   - Frontend React app (port 3000)

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/genai_hiring

# Redis
REDIS_URL=redis://localhost:6379

# API
API_BASE_URL=http://localhost:8000

# Frontend
REACT_APP_API_URL=http://localhost:8000

# JWT
JWT_SECRET_KEY=your-secret-key

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Scoring Configuration
SHORTLIST_THRESHOLD=80
REQUALIFY_THRESHOLD=60
```

## System Architecture

### User Roles

1. **Account Manager**
   - Creates job postings
   - Uses AI to generate job descriptions
   - Submits jobs for approval

2. **HR**
   - Reviews and approves job postings
   - Manages candidate applications
   - Views AI-generated candidate scores
   - Schedules interviews

3. **Admin**
   - Full system access
   - Manages users and companies
   - System analytics

### Workflow

1. **Job Creation** (Account Manager)
   → Fill basic details → AI generates additional fields → AI creates job description → Submit for approval

2. **Job Approval** (HR)
   → Review job → Approve → Publish to careers page

3. **Candidate Application**
   → Browse jobs → Apply with resume → Automated parsing → AI scoring → Email confirmation

4. **Candidate Processing**
   → Score ≥80%: Auto-shortlist → 60-80%: Request additional info → <60%: Reject

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/jobs/public` - Public job listings
- `POST /api/applications/apply` - Submit job application
- `POST /api/jobs/generate-fields` - AI job field generation
- `POST /api/jobs/generate-description` - AI job description generation

## Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest

# Add new dependencies
pip install package-name
pip freeze > requirements.txt
```

### Frontend Development

```bash
cd frontend
npm install

# Run development server
npm start

# Build for production
npm run build

# Add new dependencies
npm install package-name
```

### Database Migrations

When you modify database models:

```bash
cd backend
python -c "from app.database import create_tables; create_tables()"
```

## Production Deployment

### Using Docker

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Setup

1. Set production environment variables
2. Configure email SMTP settings
3. Set up OpenAI API key for AI features
4. Configure database with proper credentials
5. Set secure JWT secret keys

### Security Considerations

- Change default passwords and secret keys
- Use environment variables for sensitive data
- Enable HTTPS in production
- Configure CORS properly
- Set up database backups
- Use Redis password in production

## Features in Detail

### AI-Powered Job Creation
- Account managers enter basic job info
- AI suggests relevant skills, requirements, and certifications
- AI generates comprehensive job descriptions
- Editable and customizable output

### Intelligent Candidate Scoring
- **Match Score**: Compares candidate skills/experience with job requirements
- **ATS Score**: Evaluates resume format and keyword optimization
- **Final Score**: Weighted average of both scores
- **Smart Decisions**: Automatic shortlisting, requalification, or rejection

### Email Automation
- Application confirmation emails
- Shortlist notifications
- Requalification requests
- Interview scheduling notifications

### Resume Processing
- Automatic PDF/DOCX parsing
- Skill extraction and categorization
- Experience timeline analysis
- Education and certification detection

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the application logs
3. Ensure all environment variables are set correctly
4. Verify database and Redis connectivity

## License

This project is proprietary software. All rights reserved.
