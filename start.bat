@echo off
echo 🚀 Starting GenAI Hiring System...

REM Check if .env exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration before proceeding!
    echo 🔧 Required: Database credentials, OpenAI API key, Email settings
    pause
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo 🐳 Starting services with Docker Compose...
docker-compose up --build -d

echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

echo 🏥 Checking service health...
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend is not responding yet, may need more time
) else (
    echo ✅ Backend is healthy
)

curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend is not responding yet, may need more time
) else (
    echo ✅ Frontend is healthy
)

echo.
echo 🎉 GenAI Hiring System is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo 👥 Default Test Users (create these after setup):
echo    Account Manager: manager@example.com
echo    HR: hr@example.com
echo    Admin: admin@example.com
echo    Password: password123
echo.
echo 📋 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo.
pause
