# Fix: Module Import Error "does not provide an export named 'Card'"

## The Error

```
SyntaxError: The requested module '/src/api/client.ts' does not provide an export named 'Card'
```

This occurs in components like:
- `CardList.tsx:2`
- `DueCountsCard.tsx:1`
- `EditCardModal.tsx:2`

## Root Causes

1. **Vite HMR Cache Corruption** - Vite's hot module replacement cache becomes stale
2. **TypeScript Compilation Cache** - Compiled JavaScript doesn't match source TypeScript
3. **Node Modules Cache** - Package manager cache is out of sync
4. **Browser Cache** - Old cached JavaScript in browser

## Solution

### Quick Fix (Recommended)

#### Windows:
```bash
cd web
fix_vite_imports.bat
```

#### macOS/Linux:
```bash
cd web
python3 fix_imports.py
```

Or manually:
```bash
cd web
rm -rf .vite dist node_modules/.vite node_modules/.tmp node_modules/.cache
rm -f tsconfig.app.tsbuildinfo
npm install
```

### Then:

1. **Restart the dev server:**
   ```bash
   npm run dev
   ```

2. **Hard refresh the browser:**
   - **Windows/Linux**: `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`
   - **Chrome DevTools**: Network tab → right-click reload → "Empty cache and hard refresh"

## Step-by-Step Manual Fix

### 1. Stop the dev server
Press `Ctrl+C` in the terminal running `npm run dev`

### 2. Navigate to web directory
```bash
cd web
```

### 3. Remove all caches
```bash
# Remove Vite build cache
rm -rf .vite dist

# Remove Node modules caches
rm -rf node_modules/.vite
rm -rf node_modules/.tmp
rm -rf node_modules/.cache

# Remove TypeScript build info
rm -f tsconfig.app.tsbuildinfo
```

**On Windows (without Git Bash):**
```cmd
REM Remove Vite build cache
rmdir /s /q .vite
rmdir /s /q dist

REM Remove Node modules caches
rmdir /s /q node_modules\.vite
rmdir /s /q node_modules\.tmp
rmdir /s /q node_modules\.cache

REM TypeScript build info is optional to remove
del tsconfig.app.tsbuildinfo
```

### 4. Reinstall dependencies
```bash
npm install
```

### 5. Start the dev server
```bash
npm run dev
```

### 6. Hard refresh browser
- **Chrome/Edge/Firefox**: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
- **Clear cache manually**: 
  1. Press `F12` to open DevTools
  2. Go to **Application** tab
  3. Click **Clear Site Data**
  4. Select all options and clear
  5. Close DevTools and refresh

## Verification

After applying the fix, verify that:

1. ✓ The page loads without errors
2. ✓ Browser console shows no SyntaxError
3. ✓ Components render (e.g., Dashboard page shows cards)
4. ✓ API calls work (check Network tab)

## If Issue Persists

### Check 1: Verify client.ts File
```bash
# Check that exports exist
grep "export interface Card" src/api/client.ts
grep "export const cardsApi" src/api/client.ts
grep "export const reviewApi" src/api/client.ts
```

Expected output:
```
export interface Card {
export const cardsApi = {
export const reviewApi = {
```

### Check 2: TypeScript Compilation
```bash
npm run build
```

Look for TypeScript errors in output.

### Check 3: Browser DevTools
1. Open DevTools (`F12`)
2. Go to **Console** tab
3. Look for detailed error messages
4. Check **Sources** tab → verify `client.ts` has exports

### Check 4: Vite Dev Server Logs
Look at the terminal running `npm run dev`. Should show:
```
✓ built in XXXms

➜  Local:   http://localhost:5173/
```

If you see errors like "ENOENT" or "EACCES", there's a file system issue.

### Check 5: API Server
Verify backend is running:
```bash
curl http://localhost:8000/api/health
```

Should return a 200 response.

## Advanced Debugging

### Enable Verbose Logging

#### Vite Debug:
```bash
DEBUG=vite:* npm run dev
```

#### Node Debug:
```bash
NODE_DEBUG=module npm run dev
```

### Check Module Resolution
In browser DevTools, go to Sources and look for:
- `/src/api/client.ts` - should have exports
- Check for red X marks indicating failed resolution

### Clear Everything (Nuclear Option)
```bash
# Remove everything
cd web
rm -rf node_modules .vite dist
rm -f tsconfig.app.tsbuildinfo

# Clean npm cache
npm cache clean --force

# Reinstall from scratch
npm install

# Start fresh
npm run dev
```

## File Structure Reference

Your imports should work like this:
```typescript
// ✓ Correct
import { Card, cardsApi } from '../api/client';

// ✓ Also correct with index
import { Card, cardsApi } from '../api';

// ✗ Wrong
import Card from '../api/client';

// ✗ Wrong
import { client } from '../api/client';
```

## Exports in /src/api/client.ts

The file should export:
```typescript
// Interfaces (compile to nothing but are re-exported)
export interface Card { ... }
export interface QueueStats { ... }
export interface ReviewCard { ... }
export interface RatingResponse { ... }
export interface Deck { ... }
export interface CardListResponse { ... }
export interface CardFilters { ... }
export interface CardCreateRequest { ... }
export interface CardUpdateRequest { ... }
export interface Tag { ... }

// Constants (runtime exports)
export const apiClient = axios.create({ ... })
export const reviewApi = { ... }
export const cardsApi = { ... }
export const decksApi = { ... }
export const tagsApi = { ... }
```

## Prevention Tips

1. **Use `.gitignore`** for build artifacts:
   ```
   .vite
   dist
   node_modules
   ```

2. **Run `npm install`** after pulling changes

3. **Use consistent import paths** (e.g., always use `../api/client`)

4. **Keep dev server running** during development with HMR

5. **Hard refresh after git pulls** that modify API signatures

## Still Having Issues?

1. Check the [Vite Troubleshooting Guide](https://vitejs.dev/guide/troubleshooting.html)
2. Check [React Issues on GitHub](https://github.com/facebook/react/issues)
3. Delete `node_modules` entirely and run `npm install` fresh
4. Try with a different Node version (check `.nvmrc` if using NVM)

## Technical Notes

- **Vite** uses ES modules natively in dev mode
- **TypeScript interfaces** are compile-time only (removed in JavaScript)
- **Hot Module Replacement (HMR)** can cache stale modules
- **Bundler cache** can get out of sync with source files
- **Browser cache** can serve old cached JavaScript

The error occurs when the browser tries to import `Card` from a cached module that doesn't have that export, usually because it's an old compiled version.
