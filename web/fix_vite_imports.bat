@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ========================================
echo Fixing Vite Module Resolution Issues
echo ========================================
echo.

REM Step 1: Remove Vite cache directories
echo [Step 1] Clearing Vite cache directories...
if exist ".vite" (
  rmdir /s /q ".vite" 2>nul
  echo  ✓ Cleared .vite
)

if exist "dist" (
  rmdir /s /q "dist" 2>nul
  echo  ✓ Cleared dist
)

REM Step 2: Clear Node modules caches
echo [Step 2] Clearing Node modules caches...
if exist "node_modules\.vite" (
  rmdir /s /q "node_modules\.vite" 2>nul
  echo  ✓ Cleared node_modules\.vite
)

if exist "node_modules\.tmp" (
  rmdir /s /q "node_modules\.tmp" 2>nul
  echo  ✓ Cleared node_modules\.tmp
)

if exist "node_modules\.cache" (
  rmdir /s /q "node_modules\.cache" 2>nul
  echo  ✓ Cleared node_modules\.cache
)

REM Step 3: Clear TypeScript build info
echo [Step 3] Clearing TypeScript compiler cache...
if exist "node_modules\.tsbuildinfo" (
  del /q "node_modules\.tsbuildinfo" 2>nul
  echo  ✓ Cleared .tsbuildinfo
)

if exist "tsconfig.app.tsbuildinfo" (
  del /q "tsconfig.app.tsbuildinfo" 2>nul
  echo  ✓ Cleared tsconfig.app.tsbuildinfo
)

echo.
echo ========================================
echo Reinstalling dependencies...
echo ========================================
call npm install
echo  ✓ Dependencies reinstalled

echo.
echo ========================================
echo ✓ Cache cleanup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the dev server: npm run dev
echo 2. In your browser, do a hard refresh:
echo    - Windows/Linux: Ctrl+Shift+R
echo    - Mac: Cmd+Shift+R
echo 3. If issues persist, restart the dev server
echo.

pause
