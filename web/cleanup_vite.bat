@echo off
cd /d "%~dp0"
echo Cleaning Vite cache and artifacts...

if exist ".vite" (
  rmdir /s /q ".vite"
  echo Deleted .vite
)

if exist "dist" (
  rmdir /s /q "dist"
  echo Deleted dist
)

if exist "tsconfig.app.tsbuildinfo" (
  del "tsconfig.app.tsbuildinfo"
  echo Deleted tsconfig.app.tsbuildinfo
)

echo.
echo Removing node_modules/.vite and related caches...
if exist "node_modules\.vite" (
  rmdir /s /q "node_modules\.vite"
  echo Deleted node_modules\.vite
)

if exist "node_modules\.tmp" (
  rmdir /s /q "node_modules\.tmp"
  echo Deleted node_modules\.tmp
)

echo.
echo Running npm install...
call npm install

echo.
echo Cleaning complete! You can now run: npm run dev
