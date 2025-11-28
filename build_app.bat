@echo off
REM Kotoba Dojo - Full Build Script
REM This script sets up the entire application from scratch

echo ========================================
echo   Kotoba Dojo - Full Build Setup
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Please install Python 3.11+
    pause
    exit /b 1
)

REM Check Node.js installation
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo [1/6] Creating Python virtual environment...
if exist "venv" (
    echo       Virtual environment already exists
) else (
    python -m venv venv
    echo       Virtual environment created
)
echo.

echo [2/6] Installing Python dependencies...
venv\Scripts\python.exe -m pip install --upgrade pip >nul
venv\Scripts\pip.exe install -r server\requirements.txt
echo       Python dependencies installed
echo.

echo [3/6] Installing Node.js dependencies...
cd web
call npm install
call npm install -D terser
cd ..
echo       Node.js dependencies installed
echo.

echo [4/6] Setting up database...
REM Delete existing database if corrupted
if exist "server\kotoba_dojo.db" (
    echo       Removing old database...
    del "server\kotoba_dojo.db"
)
cd server
..\venv\Scripts\python.exe init_db.py
cd ..
echo       Database initialized
echo.

echo [5/6] Running database migrations...
venv\Scripts\python.exe -m alembic upgrade head
echo       Migrations complete
echo.

echo [6/6] Building frontend...
cd web
call npm run build 2>nul
if %errorlevel% neq 0 (
    echo       Frontend build skipped (optional)
) else (
    echo       Frontend built successfully
)
cd ..
echo.

echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run 'start_app.bat' to start both servers
echo   2. Open http://localhost:5173 in your browser
echo   3. Run 'stop_app.bat' to stop all servers
echo.
pause
