#!/bin/bash

# SkyNinja Startup Script
echo "🥷 Starting SkyNinja - AI-Powered Flight Search Platform"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys and configuration before continuing."
    echo "   Required: SKYSCANNER_API_KEY, EXCHANGE_RATE_API_KEY, NORDVPN_TOKEN"
    read -p "Press Enter to continue after updating .env file..."
fi

# Build and start services
echo "🚀 Building and starting SkyNinja services..."
docker compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is running at http://localhost:8000"
else
    echo "❌ Backend API is not responding"
fi

# Check frontend
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:5173"
else
    echo "❌ Frontend is not responding"
fi

# Check database
if docker compose exec -T db pg_isready -U skyninja > /dev/null 2>&1; then
    echo "✅ Database is running"
else
    echo "❌ Database is not responding"
fi

echo ""
echo "🎉 SkyNinja is ready!"
echo "===================="
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Kibana: http://localhost:5601"
echo ""
echo "To stop SkyNinja, run: docker compose down"
echo "To view logs, run: docker compose logs -f"
