# Kotoba Dojo POC - AI Agent Instructions

## Project Overview
Spaced-repetition flashcard app (SRS) for Japanese learning. FastAPI backend + React frontend, PostgreSQL database, SM-2 scheduling algorithm.

**Single-user POC assumption**: All APIs use `get_default_user()` helper (username: "default_user") instead of authentication. Never add auth/JWT logic.

## Architecture

### Backend Structure (FastAPI)
- **Models** (`server/app/models/database.py`): All SQLAlchemy models in ONE file
  - Core: `User`, `Deck`, `Card`, `Tag` (many-to-many via `card_tags` table)
  - Scheduling: `SchedState` (SM-2 state per card), `ReviewLog` (review history)
  - Settings: `UserSettings`, `DailyCounter` (tracks new/review counts per day)
- **API Routes** (`server/app/api/*.py`): One file per resource (decks, cards, tags, settings)
  - MUST use `get_default_user(db)` helper at start of every endpoint
  - Use `build_card_response()` helper in `cards.py` for full card data with relationships
- **Services** (root-level `scheduler.py`, `queue_builder.py`):
  - `scheduler.py`: SM-2 algorithm implementation (`calculate_next_state()`, `process_rating()`)
  - `queue_builder.py`: Daily queue logic (`get_next_card()`, `get_queue_stats()`)
  - Review API (`api_review.py` at root) uses these services - NOT yet in `server/app/api/`
- **Database**: `app/db/session.py` provides `get_db()` dependency, `Base` for models
- **Config**: `app/core/config.py` uses Pydantic Settings (loads `.env`), provides `settings` singleton

### Frontend Structure (React + TypeScript)
- **API Client** (`web/src/api/`): Axios-based, typed with `types.ts`, organized by resource
  - `client.ts`: Base axios instance + exports (reviewApi, decksApi, cardsApi, tagsApi)
  - Each API function is strongly typed with request/response types
- **Pages** (`web/src/pages/`): One component per route (DashboardPage, ReviewPage, BrowsePage, CardsPage, StatsPage)
- **State**: TanStack Query (React Query) for server state, Zustand for UI state (theme)
- **Routing**: React Router v7 in `App.tsx`, routes: `/`, `/review`, `/browse`, `/cards`, `/stats`
- **Styling**: Tailwind CSS v4 with dark mode support

## Critical Patterns

### SM-2 Scheduler Logic (PRD REQ-4)
**Card States**: `new` → `learning` → `review`
- **Learning**: steps are `[10, 1440]` minutes (10 min, 1 day)
  - "Again": reset to step 0 | "Good": advance step | "Easy": skip to review
- **Review**: intervals calculated as `round(prev_interval * ease_factor)`
  - "Again": lapse (interval * 0.5, EF - 0.2) | "Good": unchanged EF | "Easy": EF + 0.15, interval * 1.3
- **Ease Factor**: starts 2.5, range [1.3, 3.0]

See `scheduler.py` for implementation details. **Do NOT modify SM-2 logic without checking PRD lines 58-73.**

### Queue Building (PRD REQ-6)
Priority: Learning dues → Review dues → New cards
- Respects daily limits (default: 15 new/day, 200 reviews/day) from `UserSettings`
- `DailyCounter` tracks introduced new/review counts per calendar day (resets at midnight)
- Use `queue_builder.get_next_card()` for "what's next", `get_queue_stats()` for dashboard counts

### Database Migrations (Alembic)
- Single migration: `alembic/versions/001_initial.py` creates all tables
- **Do NOT autogenerate** new migrations casually - manually edit `001_initial.py` or create targeted migrations
- Seed data: `alembic/env.py` may run seed logic on upgrade (check before migrations)

## Development Workflows

### Running Locally
```powershell
# Backend (from root)
docker-compose up -d db  # Start PostgreSQL
cd server; uvicorn app.main:app --reload  # API on :8000

# Frontend (from root)
cd web; npm run dev  # Vite dev server on :5173

# Database setup (first time)
alembic upgrade head  # Creates default_user + tables
```

### Testing
```powershell
cd server; pytest              # All tests
pytest -v --cov=app           # With coverage
pytest tests/test_api_*.py    # Specific API tests
```

**Test Fixtures** (`server/tests/conftest.py`):
- `db`: Fresh SQLite DB per test, auto-creates `test_user` + default settings
- `client`: TestClient with `get_db` override
- `test_user`: Returns default test user

**ALWAYS** use fixtures, never create test data manually in test functions.

### Adding New API Endpoints
1. Define Pydantic schemas in `server/app/schemas/schemas.py` (all schemas in one file)
2. Add route handler in appropriate `server/app/api/*.py` file
3. Start with `user = get_default_user(db)` - REQUIRED for all endpoints
4. Use `Depends(get_db)` for session injection
5. Update `server/app/main.py` to include router if new file
6. Write tests in `server/tests/test_api_<resource>.py` using `client` fixture

### Frontend API Integration
1. Define types in `web/src/api/types.ts`
2. Add API function in `web/src/api/client.ts` or resource file
3. Use TanStack Query (`useQuery`/`useMutation`) in components - set staleTime: 5 min (already configured)
4. Import from `web/src/api` barrel export (`index.ts`)

## Common Pitfalls

1. **Don't add authentication** - this is POC with hardcoded default_user
2. **Don't split models into multiple files** - keep in `database.py`
3. **Review API location** - `api_review.py` is at root, not in `server/app/api/` yet (future refactor)
4. **Service imports** - scheduler/queue_builder are root-level, import as `from scheduler import ...` in endpoints
5. **Date handling** - Use `datetime.utcnow()` (backend) and ISO strings (frontend API)
6. **Dark mode** - All new UI components MUST include dark mode Tailwind classes (use existing pages as reference)
7. **Frontend routing** - Use absolute imports from `src/`, NOT relative paths (configured in `tsconfig.json`)
8. **Type imports (CRITICAL)** - `tsconfig.app.json` has `verbatimModuleSyntax: true` which requires:
   - **ALWAYS** use `import type { ... }` for type-only imports
   - **NEVER** mix types and values in same import: `import { api, Type }` ❌
   - **CORRECT**: `import { api } from './api'; import type { Type } from './api';` ✅
   - Violating this causes: "does not provide an export named 'X'" errors in Vite
   - **Troubleshooting**: Run `.\check-imports.ps1` in `web/` directory or see `web/IMPORT_TROUBLESHOOTING.md`

## Key Files Reference

### Backend
- `server/app/models/database.py` - All models (261 lines)
- `scheduler.py` (root) - SM-2 algorithm (328 lines)
- `queue_builder.py` (root) - Queue logic (297 lines)
- `api_review.py` (root) - Review session endpoints (250 lines)
- `server/app/api/decks.py` - Deck CRUD (299 lines)
- `server/app/api/cards.py` - Card CRUD + suspend logic

### Frontend
- `web/src/App.tsx` - Router setup
- `web/src/api/client.ts` - Axios base + typed API functions
- `web/src/pages/ReviewPage.tsx` - Review session UI with keyboard shortcuts (Space, 1/2/3, Esc)
- `web/src/pages/DashboardPage.tsx` - Home page, auto-refreshes every 60s

### Config & Setup
- `docker-compose.yml` - PostgreSQL service (user: kotoba_user, db: kotoba_dojo)
- `requirements.txt` - Backend dependencies
- `alembic.ini` + `alembic/versions/001_initial.py` - Database schema
- `web/package.json` - Frontend dependencies (React 19, TanStack Query 5, React Router 7)

## Documentation References
- **PRD.MD**: Requirements document (lines 58-73 for SM-2, lines 91-96 for daily limits)
- **QUICK_REFERENCE.md**: Commands cheatsheet
- **PHASE*_SUMMARY.md**: Implementation summaries for each completed phase
- **Swagger UI**: http://localhost:8000/docs (explore API interactively)

## When Stuck
1. Check existing similar code (e.g., copy pattern from `decks.py` for new CRUD endpoints)
2. Verify `get_default_user()` is called in all new endpoints
3. Run tests early: `pytest tests/test_<feature>.py -v`
4. Check browser console + network tab (frontend), `pytest --pdb` (backend)
5. Review PRD.MD lines for business logic requirements
