@echo off
title Agritech Platform Launcher
echo ==================================================
echo       Starting Agritech Platform Services
echo ==================================================
echo.

echo [1/3] Starting ML Service (Python / Port 8001)...
start "ML Service (Port 8001)" cmd /k "cd /d %~dp0ml-service && echo Starting Python ML Backend... && venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend (Port 5001)...
start "Node Backend (Port 5001)" cmd /k "cd /d %~dp0backend && echo Starting Express Backend... && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting React Frontend (Port 5173)...
start "React Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && echo Starting Vite Frontend... && npm run dev"

echo.
echo ==================================================
echo ✅ All services are launching in separate windows!
echo ==================================================
echo Frontend  - http://localhost:5173
echo Backend   - http://localhost:5001
echo ML Service - http://localhost:8001
echo ==================================================
echo You can safely close this launcher window.
pause
