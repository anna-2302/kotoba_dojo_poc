# Vite Module Import Issues - Quick Fix Guide

## Problem
When running the app, you see errors like:
```
Uncaught SyntaxError: The requested module '/src/api/client.ts' does not provide an export named 'Card'
```

## Root Cause
This typically happens due to:
1. Vite's HMR (Hot Module Replacement) cache being corrupted
2. TypeScript compilation cache being stale
3. Node modules cache corruption

## Solution (Choose One)

### Option 1: Run the Automated Fix (Recommended - Windows)
```bash
cd web
fix_vite_imports.bat
```
Then restart your dev server:
```bash
npm run dev
```

### Option 2: Manual Fix (All Platforms)
```bash
cd web

# Delete cache directories
rm -rf .vite dist
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf node_modules/.cache

# Clear TypeScript build info
rm -f tsconfig.app.tsbuildinfo

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

### Option 3: Hard Browser Refresh (If dev server is running)
1. Keep the dev server running with `npm run dev`
2. In your browser:
   - **Windows/Linux**: `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`
   - **Chrome DevTools**: Go to Network tab, right-click reload button, select "Empty cache and hard refresh"

### Option 4: Complete Reset (Nuclear Option)
```bash
cd web

# Delete everything Vite-related
rm -rf .vite dist node_modules
rm -f tsconfig.app.tsbuildinfo

# Reinstall from scratch
npm install

# Start fresh
npm run dev
```

## If Problem Persists

1. **Check that `/src/api/client.ts` exists** and contains the exports:
   ```bash
   grep "export interface Card" src/api/client.ts
   grep "export const cardsApi" src/api/client.ts
   ```

2. **Check for TypeScript compilation errors**:
   ```bash
   npm run build
   ```

3. **Clear browser storage**:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Site Data / Local Storage
   - Clear Cache Storage

4. **Check VS Code**:
   - If using VS Code, restart the TypeScript language server:
     - Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
     - Type "Restart TypeScript Server"
     - Press Enter

## Prevention

To avoid this issue in the future:
- Keep `.vite` and `dist` folders in `.gitignore` (they are)
- Run `npm install` when pulling new changes
- Use `npm run dev` instead of restarting partially

## Technical Details

The error "does not provide an export named 'X'" at runtime usually means:
- TypeScript compiled the `.ts` file to `.js`
- But the JavaScript output doesn't have the expected exports
- This happens when Vite's cache is out of sync with the actual file

The exports in `/src/api/client.ts` include:
- `interface Card` - TypeScript interface (compiles to nothing, but re-exported)
- `interface QueueStats` - TypeScript interface  
- `const apiClient` - Runtime export
- `const cardsApi` - Runtime export
- `const reviewApi` - Runtime export
- `const decksApi` - Runtime export
- `const tagsApi` - Runtime export

Clearing caches forces Vite to recompile everything fresh.
