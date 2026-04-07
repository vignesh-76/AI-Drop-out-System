@echo off
REM EduPulse Startup Script

echo ======================================
echo EduPulse - Student Risk Prediction
echo ======================================
echo.
echo Starting services...
echo.

REM Start backend
echo [1/2] Starting Backend Server (port 8000)...
start "EduPulse Backend" cmd /k "cd d:\pbl && .venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo [2/2] Starting Frontend Server (port 3000)...
start "EduPulse Frontend" cmd /k "cd d:\pbl\frontend && npm run dev"

echo.
echo ======================================
echo Services started successfully!
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://127.0.0.1:8000
echo API Docs:  http://127.0.0.1:8000/docs
echo.
echo Default Login:
echo   Email: test@example.com
echo   Password: password123
echo ======================================
echo.
