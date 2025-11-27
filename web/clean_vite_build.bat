@echo off
REM Clean Vite cache and rebuild - fixes module resolution issues
REM This script clears all build artifacts and reinstalls dependencies

cd /d "%~dp0web" || exit /b 1

echo.
echo ========================================
echo Cleaning Vite build artifacts...
echo ========================================
echo.

REM Remove Vite cache directories
if exist .vite (
    echo Removing .vite directory...
    rmdir /s /q .vite 2>nul
)

if exist dist (
    echo Removing dist directory...
    rmdir /s /q dist 2>nul
)

REM Clean node_modules subdirectories
if exist node_modules\.vite (
    echo Removing node_modules\.vite directory...
    rmdir /s /q node_modules\.vite 2>nul
)

if exist node_modules\.tmp (
    echo Removing node_modules\.tmp directory...
    rmdir /s /q node_modules\.tmp 2>nul
)

if exist node_modules\.cache (
    echo Removing node_modules\.cache directory...
    rmdir /s /q node_modules\.cache 2>nul
)

REM Remove TypeScript build info
if exist tsconfig.app.tsbuildinfo (
    echo Removing tsconfig.app.tsbuildinfo...
    del tsconfig.app.tsbuildinfo 2>nul
)

echo.
echo ========================================
echo Reinstalling dependencies...
echo ========================================
echo.

call npm install
if errorlevel 1 (
    echo Error during npm install!
    exit /b 1
)

echo.
echo ========================================
echo Clean and rebuild complete!
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
