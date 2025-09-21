@echo off
echo 🥷 Starting SkyNinja - AI-Powered Flight Search Platform
echo ==================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your API keys and configuration before continuing.
    echo    Required: SKYSCANNER_API_KEY, EXCHANGE_RATE_API_KEY, NORDVPN_TOKEN
    pause
)

REM Build and start services
echo 🚀 Building and starting SkyNinja services...
docker compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...

REM Check backend
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is running at http://localhost:8000
) else (
    echo ❌ Backend API is not responding
)

REM Check frontend
curl -f http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:5173
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 🎉 SkyNinja is ready!
echo ====================
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Kibana: http://localhost:5601
echo.
echo To stop SkyNinja, run: docker compose down
echo To view logs, run: docker compose logs -f
pause
