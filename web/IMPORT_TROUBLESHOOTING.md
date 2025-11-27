# TypeScript Import Troubleshooting Guide

## The Issue: "does not provide an export named 'X'"

This error occurs when `verbatimModuleSyntax: true` is enabled in TypeScript (as in this project's `tsconfig.app.json`).

## Root Cause

With `verbatimModuleSyntax`, TypeScript enforces **strict separation** between:
- **Type imports**: Types, interfaces, enums (compile-time only)
- **Value imports**: Functions, objects, classes (runtime values)

Vite sees type re-exports differently than value re-exports, causing module resolution conflicts.

## The Rule

**ALWAYS** use `import type` for type-only imports when `verbatimModuleSyntax: true`.

### ❌ Wrong
```typescript
import { Card } from '../api';                    // ERROR: Card is a type
import { api, Card, Deck } from '../api';         // ERROR: mixing values & types
```

### ✅ Correct
```typescript
import type { Card } from '../api';               // Type-only import
import { api } from '../api';                     // Value-only import
import type { Card, Deck } from '../api';         // Multiple types

// Separate statements for mixed imports
import { cardsApi, decksApi } from '../api';
import type { Card, Deck } from '../api';
```

### ✅ Inline Type Modifier (also works)
```typescript
import { reviewApi, type ReviewCard } from '../api';  // Mixed with inline 'type'
```

## How to Fix

### 1. Identify Type vs Value Exports

**Common Types in this project:**
- `Card`, `Deck`, `Tag`, `QueueStats`, `ReviewCard`, `RatingResponse`
- `CardListResponse`, `CardFilters`, `CardCreateRequest`, `CardUpdateRequest`
- `UserSettings`, `UserSettingsUpdate`, `ImportResponse`, `ImportStatus`

**Common Values (functions/objects):**
- `reviewApi`, `cardsApi`, `decksApi`, `tagsApi`, `settingsApi`, `importApi`
- `apiClient`

### 2. Update Import Statements

Run the checker script:
```powershell
cd web
.\check-imports.ps1
```

### 3. Manual Fix Pattern

**Before:**
```typescript
import { cardsApi, Card, CardCreateRequest } from '../api';
```

**After:**
```typescript
import { cardsApi } from '../api';
import type { Card, CardCreateRequest } from '../api';
```

## Verification

### Check Browser Console
1. Open http://localhost:5173
2. Open DevTools (F12)
3. Look for: `Uncaught SyntaxError: The requested module ... does not provide an export named ...`
4. If error persists, check the file mentioned in the error

### Check TypeScript Compilation
```powershell
cd web
npm run build
```

Should complete without errors.

## Prevention

### ESLint Rule (Future)
Add to `eslint.config.js`:
```javascript
{
  '@typescript-eslint/consistent-type-imports': ['error', {
    prefer: 'type-imports',
    fixStyle: 'separate-type-imports'
  }]
}
```

### Pre-commit Hook (Future)
Add to `package.json`:
```json
{
  "scripts": {
    "check:imports": "node check-imports.js",
    "precommit": "npm run check:imports && npm run lint"
  }
}
```

## Why This Matters

1. **Build Optimization**: Vite can tree-shake types better with explicit `import type`
2. **Runtime Size**: Types are stripped at compile time, reducing bundle size
3. **Module Resolution**: Prevents circular dependency issues
4. **Compatibility**: Required when `verbatimModuleSyntax: true`

## Related Settings

### `tsconfig.app.json`
```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,  // The enforcer
    "moduleResolution": "bundler",  // Vite-specific
    "isolatedModules": true         // Per-file transpilation
  }
}
```

## Common Patterns

### Component Props
```typescript
// ✅ Good
import type { Card } from '../api';

interface CardListProps {
  cards: Card[];
}
```

### API Calls
```typescript
// ✅ Good
import { cardsApi } from '../api';
import type { Card, CardCreateRequest } from '../api';

function MyComponent() {
  const { data } = useQuery<Card[]>({
    queryFn: () => cardsApi.getAll()
  });
}
```

### Type Annotations
```typescript
// ✅ Good
import type { Card } from '../api';

const [card, setCard] = useState<Card | null>(null);
```

## Debugging Tips

1. **Hard refresh**: Ctrl+Shift+R to clear Vite cache
2. **Check HMR**: Look for Vite HMR errors in console
3. **Restart dev server**: Sometimes needed after fixing imports
4. **Check export chain**: Verify `types.ts` → `client.ts` → `index.ts` all use `export type`

## Reference

- [TypeScript: verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [Vite: Dependency Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
- [TypeScript: Type-Only Imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)
