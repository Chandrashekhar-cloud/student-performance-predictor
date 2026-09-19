@echo off
echo ===================================================
echo Starting Student Performance Prediction System
echo ===================================================

echo [1/2] Starting Flask Backend API on http://127.0.0.1:5000...
start "Student Predictor - Backend (Flask)" cmd /k "python backend/app.py"

echo [2/2] Starting Vite Frontend on http://localhost:8080...
start "Student Predictor - Frontend (Vite)" cmd /k "npm run dev"

echo.
echo Both servers are starting up:
echo - Frontend: http://localhost:8080
echo - Backend:  http://127.0.0.1:5000
echo.
