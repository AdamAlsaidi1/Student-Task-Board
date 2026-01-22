@echo off
REM Student Task Board - Start Script for Windows
REM This script starts both the backend and frontend servers

echo Starting Student Task Board...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Virtual environment not found. Please run: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Start backend server
echo Starting backend server on http://localhost:5001...
start "Backend Server" cmd /k "python app.py"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting frontend server on http://localhost:8000...
start "Frontend Server" cmd /k "python -m http.server 8000"

REM Wait for frontend to start
timeout /t 2 /nobreak >nul

echo.
echo All servers are running!
echo.
echo Frontend: http://localhost:8000
echo Backend API: http://localhost:5001
echo.
echo Close the server windows to stop them.
echo.

REM Open browser
start http://localhost:8000

pause
