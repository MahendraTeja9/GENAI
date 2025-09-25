#!/bin/bash

echo "🚀 Starting GenAI Hiring System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding!"
    echo "🔧 Required: Database credentials, OpenAI API key, Email settings"
    read -p "Press Enter after configuring .env file..."
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults if not provided
API_HOST=${API_HOST:-localhost}
API_PORT=${API_PORT:-8000}
REACT_APP_HOST=${REACT_APP_HOST:-localhost}
REACT_APP_PORT=${REACT_APP_PORT:-3000}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🐳 Starting services with Docker Compose..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🏥 Checking service health..."
if curl -f http://${API_HOST}:${API_PORT}/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
fi

if curl -f http://${REACT_APP_HOST}:${REACT_APP_PORT} > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 GenAI Hiring System is ready!"
echo "📱 Frontend: http://${REACT_APP_HOST}:${REACT_APP_PORT}"
echo "🔧 Backend API: http://${API_HOST}:${API_PORT}"
echo "📚 API Docs: http://${API_HOST}:${API_PORT}/docs"
echo ""
echo "👥 Test Users (after database setup):"
echo "   Account Manager: manager@example.com"
echo "   HR: hr@example.com"
echo "   Admin: admin@example.com"
echo "   Password: password123"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
