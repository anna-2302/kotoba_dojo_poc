# Comprehensive Fix for Vite Module Resolution Errors

## Error Symptoms
- `Uncaught SyntaxError: The requested module '/src/api/client.ts' does not provide an export named 'Card'`
- `Uncaught SyntaxError: The requested module '/src/api/client.ts' does not provide an export named 'QueueStats'`

## Root Cause
Vite's internal caching system (including TypeScript build cache and HMR metadata) becomes stale when:
1. Module exports change
2. Dependencies are updated  
3. TypeScript configuration changes
4. Node modules are modified

## Complete Fix Steps

### Step 1: Hard Stop Development Server
If `npm run dev` is running, press `Ctrl+C` multiple times to kill the process completely.

### Step 2: Clean All Caches (Windows PowerShell)
```powershell
cd web

# Remove Vite cache
Remove-Item -Force -Recurse .vite -ErrorAction SilentlyContinue

# Remove build output
Remove-Item -Force -Recurse dist -ErrorAction SilentlyContinue

# Remove TypeScript build cache
Remove-Item -Force tsconfig.app.tsbuildinfo -ErrorAction SilentlyContinue

# Remove Node package manager caches
Remove-Item -Force -Recurse node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Force -Recurse node_modules\.tmp -ErrorAction SilentlyContinue

# Browser cache clearing
npm run clean-browser-cache

Write-Host "All caches cleaned!"
```

### Step 3: Reinstall Dependencies
```powershell
npm install
```

### Step 4: Clear Browser Cache
1. Open Developer Tools (F12)
2. Go to Network tab
3. Check "Disable cache (while DevTools is open)"
4. OR: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Step 5: Start Fresh Development Server
```powershell
npm run dev
```

### Step 6: Verify Imports
Open browser console and check that there are NO errors about missing exports.

## If Problem Persists

Try the nuclear option:

```powershell
# Complete reset
Remove-Item -Force -Recurse node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

## Prevention

1. **Always hard-refresh browser** when restarting dev server: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Clear browser DevTools cache**: Settings > Network > Check "Disable cache"
3. **Restart dev server** after:
   - Adding/removing exports
   - Updating dependencies
   - Modifying tsconfig
   - Any mysterious module resolution errors

## Why This Happens

Vite uses multiple cache layers:
- `.vite/` directory: TypeScript metadata and compiled modules
- `node_modules/.vite`: Pre-bundled dependencies
- `tsconfig.app.tsbuildinfo`: TypeScript incremental compilation cache
- Browser cache: HMR updates and module snapshots

When module exports change, these caches can diverge from the actual source code, causing the "module does not provide export" error.
