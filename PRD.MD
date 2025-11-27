Kotoba Dojo POC PRD
Summary
Kotoba Dojo is a cozy, lightweight spaced-repetition flashcard app inspired by Anki, focused on Japanese language learning. The POC will deliver core deck/card management, a simple SM-2-style scheduler, a review session UI with keyboard shortcuts, basic stats, browsing/search, tags, suspend/unsuspend, daily limits/queues, optional chill background music, and dark mode. It will ship with prebuilt JLPT N4 vocabulary decks seeded from Jisho.org (JMdict-derived data), tagged for easy filtering.
Goals
Enable learners to add, organize, and study cards with an efficient spaced-repetition flow.
Deliver a focused, calm study experience with a cozy aesthetic and optional chill background music.
Provide a practical starter dataset: JLPT N4 vocabulary and kanji, with useful tags.
Keep the POC simple, performant, and easily extensible.
Non-Goals
Full Anki parity (e.g., complex note types, cloze deletions, add-ons, syncing across devices).
Advanced scheduling tweaks (buried cards, custom steps per deck).
Multi-user accounts, cloud sync, or collaboration.
Mobile apps; POC targets web desktop.
Target Users
JLPT N4 learners and self-learners who prefer a minimal, distraction-free SRS tool.
Language students wanting curated starter decks and a simple daily routine.
Assumptions
POC is a web app (desktop-first), modern browsers, no login.
Data stored locally (IndexedDB/LocalStorage).
Prebuilt decks derived from Jisho.org lookups (JMdict), comply with licensing/attribution.
Music is optional, muted by default, royalty-free track(s).
Scope (MVP)
Deck CRUD and card CRUD with tags
SM-2-lite scheduler and daily queues/limits
Review session UI (front/flip/answer) with keyboard shortcuts
Browse/search with filters
Suspend/unsuspend
Basic stats
Dark mode and cozy UI
Optional chill background music controls
Prebuilt N4 decks
Functional Requirements
1) Decks
Create, rename, delete decks.
Assign cards to decks; move cards between decks.
Optional: per-deck daily limits override (if set).
Acceptance:
User can create a deck with a name.
Deck shows card count and due count.
Delete deck requires confirmation and can optionally delete or orphan cards (MVP: delete deck and all cards within).
2) Cards
Add/edit/delete cards with front/back text.
Move card to another deck.
Optional fields: notes, tags (multi-tag).
Card state: new, learning, review; suspended flag.
Acceptance:
User can create a card with front/back; assign to deck.
User can tag and edit card text later.
Deleting a card removes it from scheduling and lists.
3) Tags
Add/remove tags on cards.
Filter list and search by tag.
Show tag chips in browse.
Acceptance:
Tagging UI supports multiple tags per card.
Filter list shows only cards with selected tags.
4) Spaced-Repetition Scheduler (SM-2 Lite)
States:
New: cards not yet studied.
Learning: short-interval steps before graduating to Review.
Review: standard SM-2 progression.
Defaults:
Ease factor (EF) initial: 2.5 (min 1.3, max 3.0).
Learning steps: 10 minutes, 1 day.
First review intervals: I1 = 1 day, I2 = 6 days; then I(n) = round(I(n-1) * EF).
Again (rating): for Learning → reset current step; for Review → lapse (interval = max(1, round(prevInterval * 0.5)), EF = max(1.3, EF - 0.2)).
Good (rating): Learning → advance step or graduate; Review → nextInterval = round(prevInterval * EF), EF unchanged.
Easy (rating): Learning → graduate immediately to Review with I1 = 1 day; Review → nextInterval = round(prevInterval * EF * 1.3), EF = min(3.0, EF + 0.15).
Queue priorities:
Due Learning steps first, then due Reviews, then New (respecting daily limits).
Acceptance:
Ratings update due date, interval, EF, and state per rules.
Due list rebuilds correctly after each rating.
5) Review Session UI
Show card front.
Flip to show back.
Answer buttons: Again / Good / Easy.
Progress indicator: x/y cards today.
Keyboard shortcuts:
Space: flip
1: Again
2: Good
3: Easy
Esc: end session
Optional: Per-card tags display and deck name.
Acceptance:
User can complete reviews using buttons or shortcuts.
Session advances through today’s queue.
Visual feedback confirms rating.
6) Daily Queue and Limits
Build today’s due list on app open and on demand.
Defaults: New per day = 15; Review per day = 200; Learning due = unlimited but prioritized.
Show Today panel: due counts by category; allow start session.
Acceptance:
Today panel shows counts for Learning/Review/New.
Starting session only pulls up to limits (except learning dues).
Introduced new cards capped at daily limit.
7) Browse and Search
List view of cards: columns for Front, Back, Deck, State, Tags, Due date.
Filters: by deck, state (new/learning/review/suspended), tags.
Text search: matches front/back/notes.
Keyboard:
J/K: move selection
Enter: open edit
S: toggle suspend
Acceptance:
Filters combine (AND) correctly with search text.
Edit modal accessible from list.
8) Suspend/Unsuspend
Suspend toggles exclude card from scheduling and sessions.
Visual badge for suspended state.
Browsing filter by suspended.
Acceptance:
Suspended cards never appear in due queue.
Unsuspend returns card to prior state without altering EF/interval (due remains; if past due, it enters queue next build).
9) Basic Stats
Today’s reviews done, Again/Good/Easy counts.
Retention/accuracy: (Good+Easy)/total today.
Due counts by category.
Optional: average EF for reviewed cards today.
Acceptance:
Stats update live as user reviews.
Stats persist for the day.
10) Dark Mode and Cozy Aesthetic
Toggle dark/light; remember preference.
Cozy vibe:
Palette: warm neutrals; muted accents (e.g., matcha green, sakura pink).
Rounded corners, soft shadows, gentle micro-interactions.
Typeface: legible sans with good Japanese glyph coverage (e.g., Noto Sans).
Reduce eye strain: ample spacing, focus states, accessible contrast.
Acceptance:
Dark mode toggle switches instantly and persists.
UI elements reflect cozy theme consistently.
11) Chill Background Music
Single royalty-free lo-fi track loaded locally.
Controls: play/pause, volume slider, mute; default OFF.
Respect system audio; no autoplay.
Acceptance:
Music can be started/stopped; persists across session.
No playback if user declines interaction (no autoplay).
12) Prebuilt N4 Decks
Ship with JLPT N4 vocab and kanji decks, curated from Jisho.org lookups (JMdict/Kanjidic derived).
Decks:
N4 Vocab: nouns, verbs, adjectives, adverbs (tags).
N4 Kanji: characters with meanings; optional readings as notes.
Tagging: “noun”, “verb”, “adjective”, “adverb”, “kanji”.
Attribution: note data source in Settings/About.
Acceptance:
On first run, user can import prebuilt decks.
Tags present and filterable.
Cards use Japanese front; English gloss on back; optional reading field shown on back.
Note on licensing: Jisho.org data derives from JMdict/KANJIDIC under permissive licenses; include proper attribution and avoid scraping at runtime. POC ships a small curated subset; later expansions should confirm licenses.
Example starter cards (placeholders for POC):
覚える ・ おぼえる → to remember; to memorize (verb)
忘れる ・ わすれる → to forget (verb)
簡単 ・ かんたん → simple; easy (adjective)
必要 ・ ひつよう → necessary (adjective/na)
駅 ・ えき → station (noun)
UX Flows
Create Deck:
Decks > New Deck > Name > Create → appears in list.
Add Card:
Deck view > Add Card > Front/Back/Tags > Save → queued as New.
Review Session:
Today > Start → front shown → Space flip → 1/2/3 rate → next card until limits reached.
Browse/Search:
Browse > filter by Deck/State/Tags > search text → select > edit modal.
Suspend:
Browse > select card > Suspend toggle OR press S → badge appears; excluded from queue.
Dark Mode:
Header > Moon icon toggle → persist preference.
Music:
Footer or header music control > Play/Pause; Volume slider → default OFF; persists this session.
Data Model (Local)
Deck
id, name, description?, createdAt, updatedAt, newLimit?, reviewLimit?
Card
id, deckId, front, back, notes?, tags[], suspended:boolean, createdAt, updatedAt
SchedulingState
cardId, state: 'new'|'learning'|'review', due: timestamp, intervalDays:number, easeFactor:number, repetition:number, lapses:number, learningStepIndex:number|null
ReviewLog
id, cardId, timestamp, rating: 'again'|'good'|'easy', elapsedSeconds?, sessionId?
Settings
darkMode:boolean, musicOn:boolean, musicVolume:number, dailyLimits:{new:number, review:number}
AppMeta
prebuiltDecksImported:boolean, lastQueueBuildAt:timestamp
Algorithm Spec (SM-2 Lite)
Initialize new card: state=new, EF=2.5, intervalDays=0, repetition=0, lapses=0, due=now.
Learning steps: [10m, 1d]
Again: stay in learning; reset step to 0; due = now + 10m.
Good: advance step; if last step completed → state=review; intervalDays=1; due=now+1d.
Easy: graduate immediately to review; intervalDays=1; due=now+1d; EF=EF+0.15 capped 3.0.
Review:
Again: lapses++; EF=max(1.3, EF-0.2); intervalDays=max(1, round(prevInterval*0.5)); due=now+intervalDays.
Good: EF unchanged; intervalDays=round(prevInterval*EF); due=now+intervalDays.
Easy: EF=min(3.0, EF+0.15); intervalDays=round(prevIntervalEF1.3); due=now+intervalDays.
Graduation boost: first two intervals special-case if repetition < 2:
I1 = 1 day; I2 = 6 days (on next Good/Easy).
Queue build order:
Learning due (by due timestamp)
Review due (by due timestamp, limit applied)
New (randomized or ordered by createdAt, limit applied)
Technical Notes
Platform: Web app with React or Vue; local persistence via IndexedDB.
State management: simple global store.
Audio: HTML5 Audio, user-triggered playback only.
Accessibility: keyboard-first interactions; ARIA roles for buttons and lists.
Success Metrics (POC)
Time-to-first-review under 30 seconds from first load.
Retention/accuracy visible and understandable.
90% actions accessible via keyboard.
No noticeable lag for 2k cards in browse (IndexedDB-backed).
Dark mode adoption >50% in user testing.
Release Plan
Week 1: Architecture scaffolding; data model; Deck/Card CRUD; tags.
Week 2: Scheduler implementation; queue builder; review UI; keyboard shortcuts.
Week 3: Browse/search; suspend; basic stats; dark mode; music controls.
Week 4: Prebuilt N4 decks curation/import; attribution; polish; QA; usability test; bug fixes.
Risks & Mitigations
Data licensing: Ensure JMdict/KANJIDIC attribution and limit to curated subset; avoid scraping in-app.
Audio autoplay restrictions: Keep music off by default; play only after user interaction.
Over-complex scheduler: Keep SM-2 lite; defer advanced tuning.
Performance in browse: Use IndexedDB and virtualized list for large datasets.
Open Questions
Should we allow per-deck learning steps customization in POC? No
Do we include furigana/reading fields explicitly on card back UI? No
Default limits: maintain Anki-like defaults (e.g., new=20, review=200) or use our proposed new=15?  use our proposed new=15
Do we want a “leech” auto-suspend rule (e.g., >8 lapses) in MVP? No
Attribution
Vocabulary and kanji data derived via Jisho.org lookups, sourced from JMdict and KANJIDIC projects. Include licensing and attribution details in About page.

Technical Architecture Proposal – Kotoba Dojo POC

Overview
- Client: Web app (React + TypeScript). Desktop-first, keyboard-driven UI, dark mode, cozy theme, optional background music.
- API: Python backend (FastAPI) exposing REST endpoints for deck/card CRUD, scheduler actions, queues, search, tags, stats, settings, prebuilt deck import.
- DB: SQLite for local/dev; PostgreSQL for staging/prod. Full-text search via SQLite FTS5 or PostgreSQL tsvector/trigrams.
- Scheduler: Implement SM-2-lite on the backend. Queue built on demand per user/day; no background workers required for POC.
- Assets: Prebuilt N4 decks stored as JSON/CSV; one locally hosted royalty-free lo-fi track.

Monorepo Structure
- kotoba-dojo/
  - web/ (frontend)
    - src/
      - app/ (routing, providers)
      - components/ (UI atoms/molecules, accessible primitives)
      - features/
        - decks/
        - cards/
        - review/
        - browse/
        - stats/
        - settings/
        - tags/
        - music/
      - api/ (typed client, React Query hooks)
      - store/ (Zustand or Context for ephemeral UI state)
      - styles/ (CSS variables, theme files)
      - assets/ (icons, logo, placeholder images)
      - utils/
    - public/ (favicon, manifest, static)
    - vite.config.ts, tsconfig.json, package.json
  - server/ (backend)
    - app/
      - api/
        - v1/
          - routers/
            - decks.py
            - cards.py
            - review.py
            - browse.py
            - tags.py
            - stats.py
            - settings.py
            - import.py
      - core/ (config, security, logging, error handlers)
      - db/
        - base.py (SQLAlchemy engine/session)
        - migrations/ (Alembic)
        - seed/ (prebuilt decks, import scripts)
      - models/ (SQLAlchemy ORM models)
      - schemas/ (Pydantic models)
      - services/
        - scheduler.py (SM-2-lite)
        - queue.py (build today’s queue)
        - search.py (FTS integration)
        - stats.py
        - tags.py
        - import_prebuilt.py
      - static/ (audio track)
      - tests/ (pytest)
      - main.py (FastAPI app)
    - Dockerfile
    - alembic.ini
    - requirements.txt or pyproject.toml
  - ops/
    - docker-compose.yml (db, api, web)
    - nginx.conf (optional reverse proxy)
    - k8s/ (optional manifests)
  - README.md
  - LICENSE

Key Libraries
- Backend (Python):
  - FastAPI (web framework)
  - SQLAlchemy 2.x (ORM, Core) + Alembic (migrations)
  - Pydantic v2 (request/response schemas)
  - Uvicorn (ASGI server)
  - orjson (fast JSON)
  - asyncpg or psycopg (Postgres driver); sqlite3 for dev
  - python-multipart (uploads, if needed)
  - APScheduler (optional; not required in POC) for periodic maintenance
  - loguru or structlog (logging)
  - pytest + httpx (testing)
- Frontend:
  - React + Vite + TypeScript
  - TanStack Query (server state)
  - Zustand (local/global UI state) or Redux Toolkit if preferred
  - React Router
  - Tailwind CSS + CSS variables for themes (or vanilla-extract)
  - Radix UI primitives (accessibility) or Headless UI
  - dayjs or date-fns (time)
  - react-hotkeys-hook (keyboard)
  - howler.js or HTML5 Audio API wrapper (music)
  - react-virtual for large list virtualization
- Search:
  - SQLite FTS5 (dev) or PostgreSQL tsvector with GIN index; optional pg_trgm for LIKE performance

API Surface (selected)
- Decks
  - GET /api/v1/decks
  - POST /api/v1/decks
  - PATCH /api/v1/decks/{id}
  - DELETE /api/v1/decks/{id}
- Cards
  - GET /api/v1/cards?deckId=&state=&tags=&q=&page=&pageSize=
  - POST /api/v1/cards
  - PATCH /api/v1/cards/{id}
  - DELETE /api/v1/cards/{id}
  - POST /api/v1/cards/{id}/move (deck change)
  - POST /api/v1/cards/{id}/suspend (toggle)
- Tags
  - GET /api/v1/tags
  - POST /api/v1/tags (create custom)
  - POST /api/v1/cards/{id}/tags (assign/remove)
- Review and Queue
  - GET /api/v1/today (counts: learning/review/new due; limits)
  - POST /api/v1/queue/build (returns first batch ordered by priority; respects limits)
  - POST /api/v1/review/{cardId}/answer {rating, elapsedMs} (updates scheduling; returns next card skeleton)
- Stats and Settings
  - GET /api/v1/stats/today
  - GET/PUT /api/v1/settings (darkMode, music, limits, timezone, per-deck overrides)
- Import
  - POST /api/v1/import/prebuilt (idempotent; only on first run)
- Static
  - GET /static/music/lofi.mp3

Authentication
- POC: single-user mode with a device_id cookie. Models include user_id for future multi-user support. If multi-user later: add session-based auth with fastapi-login or JWT, and CSRF for browser.

Database Schema (PostgreSQL; SQLite analogous)
- users
  - id: uuid (pk)
  - created_at: timestamptz default now()
- decks
  - id: uuid (pk)
  - user_id: uuid fk -> users.id
  - name: varchar(128) unique per user
  - description: text null
  - new_limit: int null
  - review_limit: int null
  - created_at, updated_at: timestamptz
  - indexes: (user_id, name)
- cards
  - id: uuid (pk)
  - user_id: uuid fk
  - deck_id: uuid fk -> decks.id on delete cascade
  - front: text not null
  - back: text not null
  - notes: text null
  - suspended: boolean default false
  - created_at, updated_at: timestamptz
  - state: smallint or enum (‘new’, ‘learning’, ‘review’) duplicated here for quick filtering (denormalized from sched_states)
  - indexes: (deck_id, state), (user_id, suspended)
- tags
  - id: uuid (pk)
  - user_id: uuid fk
  - name: varchar(64) unique per user (case-insensitive collation/index)
- card_tags
  - card_id: uuid fk -> cards.id on delete cascade
  - tag_id: uuid fk -> tags.id on delete cascade
  - primary key: (card_id, tag_id)
  - index: (tag_id)
- sched_states
  - card_id: uuid pk fk -> cards.id on delete cascade
  - due_at: timestamptz not null
  - interval_days: int not null default 0
  - ease_factor: numeric(3,2) not null default 2.50
  - repetition: int not null default 0
  - lapses: int not null default 0
  - learning_step_index: smallint null
  - last_reviewed_at: timestamptz null
  - indexes: (due_at), (card_id, due_at)
- review_logs
  - id: uuid (pk)
  - user_id: uuid fk
  - card_id: uuid fk -> cards.id on delete cascade
  - reviewed_at: timestamptz default now()
  - rating: smallint or enum (‘again’, ‘good’, ‘easy’)
  - elapsed_seconds: smallint null
  - prev_interval_days: int
  - next_interval_days: int
  - prev_ease_factor: numeric(3,2)
  - next_ease_factor: numeric(3,2)
  - prev_state: enum
  - next_state: enum
  - indexes: (user_id, reviewed_at desc), (card_id, reviewed_at desc)
- settings
  - user_id: uuid pk fk -> users.id
  - dark_mode: boolean default false
  - music_on: boolean default false
  - music_volume: numeric(3,2) default 0.5
  - daily_new_limit: int default 15
  - daily_review_limit: int default 200
  - timezone: text default ‘UTC’
  - deck_overrides: jsonb null
- daily_counters
  - user_id: uuid fk
  - date: date (in user timezone)
  - introduced_new: int default 0
  - reviews_done: int default 0
  - again_count: int default 0
  - good_count: int default 0
  - easy_count: int default 0
  - primary key: (user_id, date)

Full-text search
- PostgreSQL:
  - cards_fts: generated column to_tsvector('simple', coalesce(front,'') || ' ' || coalesce(back,'') || ' ' || coalesce(notes,''))
  - GIN index on cards_fts; search via plainto_tsquery
  - For partial matches across scripts, consider pg_trgm on front/back
- SQLite:
  - FTS5 virtual table card_fts(front, back, notes, content='cards', content_rowid='id')
  - Triggers on insert/update/delete to keep FTS in sync

Scheduler Service (SM-2-lite)
- Implement in server/services/scheduler.py
- Core operations:
  - rate(card_id, rating, now, user_tz) -> updated sched_state and card.state
  - compute_next(card_state, prev_interval, EF, rating)
  - learning_steps: [10m, 1d]; I1=1d, I2=6d for early reviews
  - Bounds: EF in [1.3, 3.0]; intervals rounded to whole days
- Queue builder (server/services/queue.py):
  - Inputs: user_id, deck filters (optional), today’s limits (global overridden by per-deck)
  - Steps:
    - Resolve “today” boundaries in user timezone [00:00, 23:59:59]
    - Learning due: sched_states where state=learning and due_at <= now
    - Reviews due: state=review and due_at <= now (limit by remaining review slots)
    - New: state=new and not suspended; select up to remaining new slots; order by created_at or randomized
  - Return ordered list: learning due -> reviews due -> new
- Daily counters:
  - On first new introduction today, increment daily_counters.introduced_new
  - On each rating, increment reviews_done and again/good/easy counts
- Concurrency:
  - Single-user POC: tolerate minimal conflict
  - Guard review endpoint with a simple optimistic lock: pass last known sched_state.updated_at or version; if mismatch, rebuild next card

Representative Queries
- Due reviews:
  - SELECT … FROM cards
    JOIN sched_states USING (card_id)
    WHERE user_id = :u AND suspended = false AND state = 'review' AND due_at <= :now
    ORDER BY due_at ASC
    LIMIT :review_limit
- New cards:
  - SELECT … FROM cards
    WHERE user_id = :u AND deck_id IN (…) AND suspended = false AND state = 'new'
    ORDER BY created_at ASC
    LIMIT :new_limit

Frontend Architecture Notes
- Data fetching: TanStack Query for all server state (decks, cards, queue, stats)
- Local UI: Zustand for review session ephemeral state (current card, flipped, hotkeys enabled)
- Theming: CSS variables with prefers-color-scheme fallback; toggle persisted to backend settings and mirrored in localStorage for faster paint
- Accessibility:
  - Ensure Button roles for Again/Good/Easy
  - Hotkeys: Space (flip), 1/2/3 (ratings), Esc (end)
- Lists: react-virtual to handle 2k+ cards in Browse
- Music:
  - HTML5 audio element; default paused; persist volume/mute
  - Control bar component; handle visibility and focus states

Prebuilt Deck Import
- server/app/services/import_prebuilt.py:
  - Read curated JSON/CSV derived from JMdict/KANJIDIC (stored under server/app/db/seed/)
  - Create decks: “N4 Vocab”, “N4 Kanji”
  - Insert cards; attach tags (“noun”, “verb”, “adjective”, “adverb”, “kanji”)
  - Initialize sched_states for new cards (due_at = now, state=new)
  - Idempotent via a migration-like stamp in settings or an app_meta table
- Attribution text stored in About/Settings from a template file

Potential Implementation Challenges and Mitigations
- Timezones and “today” boundaries:
  - Challenge: Accurate daily limits and due calculations across TZ and DST
  - Mitigation: Store all timestamps in UTC; store user timezone; compute “local today” boundaries on server per request
- Scheduler correctness:
  - Challenge: Edge cases (learning step transitions, lapses, special I1/I2)
  - Mitigation: Centralize logic with unit tests and golden test vectors; log before/after state in review_logs
- Multiple tabs and race conditions:
  - Challenge: Two tabs answering same card
  - Mitigation: Optimistic concurrency with version field; server rejects stale updates; client refetches queue
- Search performance:
  - Challenge: Fast text search across Japanese and English
  - Mitigation: Use FTS5 or tsvector; supplement with trigram for LIKE; index tags/deck/state; debounce queries
- Large browse lists:
  - Challenge: Rendering and scroll performance
  - Mitigation: Pagination on API; react-virtual; server-side filtering/sorting
- Daily limits and partial sessions:
  - Challenge: Introduced new cards must cap across sessions
  - Mitigation: daily_counters and a “introduced” flag for new cards once shown today; ensure queue builder respects counters
- Data migrations:
  - Challenge: Evolving schemas
  - Mitigation: Alembic migrations; seed scripts versioned; test migrations on snapshots
- Asset and audio handling:
  - Challenge: Browser autoplay restrictions
  - Mitigation: Do not autoplay; require user gesture; persist preference; small local file for instant start
- Prebuilt data licensing:
  - Challenge: Ensuring compliant use of JMdict/KANJIDIC-derived data
  - Mitigation: Include explicit attribution; store curated subset; no runtime scraping
- Offline use:
  - Challenge: POC not offline-first
  - Mitigation: Optional later PWA; for now, graceful error messages and caching where safe
- Internationalization:
  - Challenge: Fonts and glyph coverage for Japanese
  - Mitigation: Use Noto Sans JP; include font-display: swap; subset fonts if necessary

Testing Strategy
- Unit tests: scheduler, queue builder, search integration, tag filters
- API tests (pytest + httpx): CRUD, review flow, limits
- Frontend e2e (Playwright): review session hotkeys, browse filters, suspend toggle, dark mode toggle, music controls
- Seed data tests: idempotent import

Deployment
- Dockerized services: web (static build), server (Uvicorn), db (Postgres)
- Reverse proxy (Nginx) for TLS and static
- Env vars:
  - DATABASE_URL, SECRET_KEY, CORS_ORIGINS
  - FEATURE_FLAGS (if any), DEFAULT_LIMITS
  - TZ_DEFAULT
- Observability: access logs, basic metrics (request durations), error tracking (Sentry optional)

Scalability Notes (post-POC)
- Move to async DB driver and connection pooling
- Redis cache for counts and queue fragments
- Background worker (RQ/Celery) for heavy imports or periodic maintenance
- Multi-user auth and per-user storage isolation

# Create decks presets
Use Jisho.org API
Example:
https://jisho.org/api/v1/search/words?keyword=jlpt-n5
https://jisho.org/api/v1/search/words?keyword=%23jlpt-n3%20%23adjective
Add decks and create cards for:
Adverbs N5, N4
Adjectives N4
Kanji N4
Kanji 3
All vocab N5
All vocab N4




Phase 2 PRD: Ambient Audio Player, Theme Switcher, Cozy Japan Design Enhancements

Summary

Phase 2 focuses on elevating the study experience with a persistent audio player, a polished dark/light theme switcher, and cohesive visual design that feels cozy, studious, and distinctly Japanese.
Goals

Provide a calming ambient audio option that is accessible across all pages, off by default.
Implement a reliable, accessible dark/light mode switcher that persists and avoids visual flash.
Enhance the UI to feel cozy, warm, and culturally aligned with Japanese study, with visually appealing and interactive elements that remain performant and accessible.
Non-Goals

Complex audio features (streaming services, playlists, equalizers, crossfade, multi-track library).
Full brand overhaul or custom illustration set beyond lightweight accents.
Mobile app redesign; Phase 2 targets the web POC only.
Scope

Persistent audio player visible in main navigation across all pages, user-initiated playback only.
Global dark/light mode switcher with persistence and system preference support.
Theming and component polish to convey a calm study atmosphere with Japanese-inspired accents.
Functional Requirements

## Persistent Audio Player
Placement: visible on all pages within the main menu/header.
Default state: OFF (no autoplay). Playback starts only after explicit user action.
Controls: Play/Pause, Mute, Volume slider, minimal progress indicator.
Behavior:
Continues playback while navigating between pages.
Does not auto-play on page reload; remembers volume/mute preference.
Optional: a single local lo-fi track; future-proof to support multiple tracks later.
Accessibility:
Keyboard shortcuts: Shift+P (play/pause), Shift+M (mute/unmute).
Focus states and ARIA labels for controls.
Persistence:
Save volume and mute in settings and localStorage for instant UI feedback.
Music_on remains false by default; only changes when user presses play.
Acceptance Criteria (Audio)

Player is visible in main navigation across all pages.
No audio plays until the user clicks play; subsequent navigations do not interrupt playback.
Volume and mute changes persist across navigations; page reload shows previous settings but does not auto-play.
Keyboard shortcuts operate the player and announce state changes for screen readers.
Audio complies with browser autoplay policies (no playback without user gesture).
Dark/Light Mode Switcher
Placement: toggle in header and Settings screen.
Behavior:
Instant visual switch across the app; minimal layout shift.
Persists user preference (backend settings and localStorage).
Honors system preference on first visit if no explicit user choice saved.
Avoid flash of wrong theme on initial paint by reading localStorage before render.
Accessibility:
Toggle must be operable via keyboard and screen readers, with clear labels and states.
Design Tokens:
Define color tokens for light and dark themes with accessible contrast.
Tokenized shadows, radii, spacings, and transitions.
Acceptance Criteria (Theme)

Toggling the switch updates the entire app immediately and consistently.
Preference persists across sessions and navigations; no theme flash on reload.
Contrast ratios meet accessibility guidelines (minimum WCAG AA for text).
System preference is used only if the user has not explicitly set a theme.
Cozy Japan Study Design Enhancements
Visual Direction:
Palette: warm neutrals with matcha green, sakura pink accents; soft shadow and rounded corners.
Typography: Noto Sans JP (or equivalent), comfortable line-height and spacing.
Accents: subtle textures (paper/washi), minimalist iconography, gentle hover/press states.
Component Polish:
Cards: elevated surfaces with readable hierarchy (front/back, tags, deck).
Buttons: clear primary/secondary distinctions, interactive states (hover/active/focus).
Tags: pill-shaped chips with soft colors; clear selected/filtered states.
Lists: row hover highlights, focus rings, and compact density options.
Micro-Interactions:
Subtle transitions (200–250ms), easing (ease-in-out), respect reduced motion settings.
Feedback: toasts/snackbars for key actions (rated Good, card suspended) with calm animations.
Imagery and Icons:
Lightweight, license-compliant assets; no heavy backgrounds that impact readability.
Optional small sakura icon accents in headers or dividers; avoid clutter.
Consistency:
Apply tokens across all feature screens (Today, Review, Browse, Decks, Stats, Settings).
Light/dark adaptations tested to maintain the cozy feel in both modes.
Acceptance Criteria (Design)

Updated theme tokens applied consistently across components and pages.
Hover/focus/active states are visually distinct and accessible in both themes.
Typography and spacing enhance readability; Japanese glyphs render correctly.
Micro-interactions are subtle, responsive, and respect reduced-motion preferences.
Visual polish does not degrade performance or core review flow responsiveness.
User Stories

As a learner, I want a play/pause audio control available on every page so I can study with ambient music without hunting for controls.
As a learner, I want to quickly toggle between dark and light mode and have my preference remembered.
As a learner, I want the interface to feel cozy and supportive of focused study, with Japanese-inspired details that don’t distract.
Dependencies

Licensed audio track(s); ensure local hosting and attribution as needed.
Font with full Japanese glyph coverage (e.g., Noto Sans JP).
Existing settings endpoints (music_on, music_volume, dark_mode) and local storage usage.
CSS variable-based theming; confirm base tokens are in place for light/dark.
Technical Notes

Audio: HTML5 Audio element or a lightweight wrapper (e.g., Howler) with user-initiated playback only; preloading minimal to avoid bandwidth spikes.
Theme: Read localStorage on initial page load before rendering; set data-theme attribute on document root to avoid repaint flash.
Performance: Limit heavy textures; prefer CSS-only accents; virtualized list remains in use for Browse.
Accessibility: ARIA roles and labels for audio controls and theme toggle; visible focus rings; test keyboard navigation.
Metrics

Theme adoption: percentage of users switching to dark mode and retention of that choice.
Audio usage: sessions with audio on, average playback duration per session.
Engagement signals: time to first review remains <30s, no significant increase in input-to-action latency.
Qualitative: quick user study or feedback on perceived coziness and focus support.
Risks and Mitigations

Autoplay restrictions: ensure audio starts only after user gesture; show clear visual state.
Contrast issues in cozy palettes: validate against WCAG; provide accessible variants.
Performance regressions: keep animations and textures lightweight; test under load.
Over-theming: maintain clarity and simplicity; avoid decorative elements that reduce readability.
Release Plan (Phase 2)

Week 1:
Implement global audio player component; wire to settings; keyboard shortcuts; persistence.
Implement theme toggle with early hydration; adjust tokens for contrast; Settings integration.
Week 2:
Apply enhanced design tokens across pages; refine components (buttons, cards, tags, lists); micro-interactions; accessibility pass.
QA: accessibility checks, cross-browser audio behavior, theme flash prevention; fix polish issues.
QA Checklist

Audio player visible and operable on all pages; default OFF; persists volume/mute; continues across navigation; no autoplay.
Theme toggle works instantly; persists; no flash on reload; meets contrast requirements.
Components reflect cozy aesthetic consistently; hover/focus/active states are clear in both themes.
Reduced-motion preference disables non-essential animations.
Review session performance unchanged; hotkeys and rating flows still snappy.
Attribution

Audio track(s) licensed and included locally; attribution in About page if required.
Typography and icon assets comply with licensing.
Continue to display JMdict/KANJIDIC attribution for prebuilt decks in About.


Technical Proposal for Phase 2 (Audio Player, Theme Switcher, Cozy Japan Design)

Overview

Extend the existing SPA (React + Vite) and FastAPI backend to add a persistent, accessible audio player, robust dark/light theme switching, and cohesive cozy visual design aligned with Japanese study.
Keep changes minimal and POC-friendly, favoring simple, testable implementations with graceful fallbacks.
Frontend Architecture

Persistent Audio Player
Component: AudioBar (always visible in AppShell header)
Provider: AudioProvider with a single HTMLAudioElement instance stored in a ref so it does not remount across route changes.
State:
audio: HTMLAudioElement (or Howler instance)
playing:boolean (derived from audio.paused)
volume:number (0.0–1.0)
muted:boolean
Storage and sync:
Local: localStorage keys: kd.music.volume, kd.music.muted
Backend: settings.music_on (boolean), settings.music_volume (number)
Behavior: music_on toggles only after first user play; volume/mute persist to both localStorage (instant UI) and backend (debounced PUT /settings)
Keyboard shortcuts:
Shift+P: play/pause
Shift+M: mute/unmute
Guard against conflicts with review hotkeys by scoping shortcuts to not fire when focus is in input fields and by using modifier keys.
Asset:
Source: /static/music/lofi.mp3 served by FastAPI
Preload: none; load on first play for compliance with autoplay restrictions
Implementation Sketch

AppShell wraps Router; includes <AudioBar /> and ThemeToggle
AudioProvider exposes hooks: useAudioControls(), useAudioState()
AudioBar renders play/pause, mute, volume slider, minimal progress (optional currentTime/duration)
Do not auto-play; call audio.play() on explicit click. Handle Promise rejections (Safari/Chrome policies).
Dark/Light Theme Switcher
Theme model:
Tokens via CSS variables on :root
Attribute: document.documentElement.dataset.theme = 'light'|'dark'
Early hydration (FOUC prevention):
Inline script in index.html reads localStorage kd.theme and sets data-theme before React boot; else uses prefers-color-scheme
React state mirrors this and persists changes to localStorage and backend settings.dark_mode
Toggle component:
Accessible switch with aria-pressed, clear labels (e.g., “Dark mode”)
Available in Header and Settings page
Tokens:
Colors: warm neutrals, matcha green, sakura pink accents with AA contrast
Radii, shadows, spacing, transitions tokenized for consistency
Implementation Sketch

theme.ts: functions getInitialTheme(), setThemeAttribute(), persistTheme()
styles/tokens.css: define variables for both themes under [data-theme="light"] and [data-theme="dark"]
ThemeToggle uses a small store (Zustand or React context) to update state and call persistTheme + PUT /settings
Cozy Japan Design Enhancements
Design tokens:
Palette: base-bg, surface, text, subtle-accent, primary-accent (matcha), highlight (sakura)
Shadows: soft layered shadows (respect dark mode)
Radii: medium rounding; pill for chips
Motion: 200–250ms transitions; reduced-motion media query respected
Components to polish:
Buttons: primary/secondary/ghost with hover/active/focus states
Cards (flashcards): elevated surfaces, breathing space, readable hierarchy
Tags: pill chips with selected/filtered states
Lists: row hover and focus rings; compact density option
Assets:
Font: Noto Sans JP via CSS; font-display: swap; preload woff2 if feasible
Icons: lightweight set (e.g., Lucide or Heroicons) with custom sakura/matcha accents
Feedback:
Toasts/snackbars for key actions (rate, suspend) with subtle animations; ARIA live region
Backend Additions

Static audio:
Serve lofi.mp3 from FastAPI /static/music/lofi.mp3
Enable caching headers (immutable, long max-age) for the track
Settings API:
Reuse existing settings fields: dark_mode (boolean), music_on (boolean), music_volume (number)
Debounced updates from frontend to reduce write frequency
No schema change required for Phase 2 (existing settings suffice)
Folder Structure Additions (web/)

src/providers/AudioProvider.tsx (context + hook)
src/components/AudioBar/
AudioBar.tsx, styles
src/components/ThemeToggle/
ThemeToggle.tsx
src/styles/tokens.css (light/dark variables)
src/app/AppShell.tsx (header with AudioBar + ThemeToggle)
public/index.html (inline theme hydration script; link font)
Key Libraries

Keep dependencies light for POC:
Native HTMLAudioElement (preferred) or howler.js for simplified cross-browser audio
classnames for conditional classes
dayjs or date-fns already in project
Optional: Radix UI primitives for accessible switch/slider, or implement accessible controls manually
Accessibility

Audio controls: role="button", aria-labels (“Play ambient music”, “Pause”, “Mute ambient audio”), focus outline, keyboard shortcuts documented
Theme toggle: proper role and state; visible focus ring
Reduced motion: media query to disable non-essential animations
Color contrast validated to WCAG AA
Performance Notes

Avoid autoplay; defer audio creation until first use if necessary
Use CSS-only textures/accents (no heavy images)
Keep transitions lightweight; avoid large box-shadow blur on massive lists
Font loading: preload primary woff2, avoid layout shifts; test CLS

Browser autoplay restrictions

Challenge: Audio.play() rejected without user gesture
Mitigation: Default OFF; instantiate/play only on explicit click; handle promise rejections; show clear UI state
Audio persistence across navigation

Challenge: Audio element remounts when navigating pages
Mitigation: Place AudioProvider above Router; keep a single audio element in a ref; do not recreate on re-renders
Shortcut conflicts and focus management

Challenge: Shift+P/Shift+M could interfere with inputs or review hotkeys
Mitigation: Require Shift modifier; ignore when input/textarea focused; document shortcuts; allow turning shortcuts off in Settings (optional)
Theme flash (FOUC) on initial load

Challenge: Wrong theme flashes before React initializes
Mitigation: Inline script sets data-theme from localStorage immediately; match prefers-color-scheme if no saved preference
Contrast and readability with cozy palette

Challenge: Warm tones can reduce contrast
Mitigation: Validate AA contrast; provide accessible variants in tokens; test light and dark separately
Performance regressions from design polish

Challenge: Heavy shadows/animations can slow scrolling
Mitigation: Use modest shadows; CSS transitions only; keep list virtualization; respect reduced motion
Font loading and glyph coverage

Challenge: Japanese glyphs must render reliably; font loads can cause CLS
Mitigation: Use Noto Sans JP woff2; font-display: swap; test on Windows/macOS; preload primary weights
Settings persistence conflicts

Challenge: LocalStorage vs backend settings can drift
Mitigation: Source of truth: localStorage for instant paint; after boot, fetch backend, reconcile and update localStorage; debounce settings writes
Static asset hosting and CORS

Challenge: Audio track must be accessible from SPA’s origin
Mitigation: Serve /static/music from the same host+port as API or configure CORS/Content-Type correctly; cache with long max-age
Accessibility gaps

Challenge: New interactive controls must be accessible
Mitigation: ARIA labeling, focus outlines, keyboard operability tests; run axe/lighthouse audits
Testing and QA

Unit: theme utils (getInitialTheme, persistTheme), AudioProvider behaviors (volume/mute transitions)
Integration: Play/pause across route navigation; theme toggle persistence; reduced-motion handling
E2E: No autoplay; shortcuts work; theme FOUC-free; contrast checks; audio continues during navigation; settings persisted
Success Criteria

No audio plays until user initiates; playback continues across navigation
Theme toggling instantaneous and persists; no visible flash on reload
Visual polish increases perceived coziness without impacting review responsiveness
Accessibility and contrast meet AA; keyboard users can operate audio and theme controls easily
This proposal keeps Phase 2 implementation small, robust, and aligned with POC constraints while delivering tangible improvements to the study experience.


Updated PRD: Basic Spaced-Repetition Scheduler (POC)

Summary This PRD specifies the updated scheduler behavior for Kotoba Dojo. Users can study new and due cards in a single fixed-queue session, either across all decks or limited to a specific deck. Deck-level daily limits act as caps both in All Decks sessions and in single-deck sessions. The queue is built once at session start and remains fixed until the user manually starts a new session or rebuilds the queue.

Goals

Allow learners to complete Learning, Review, and New cards in one session.
Support starting a session across all decks or a specific deck.
Apply deck-level daily limits as caps during All Decks sessions; for a specific deck session, deck limits overwrite global limits.
Keep the session queue fixed (no dynamic insertions) for simplicity and predictability.
Non-Goals

Dynamic queue insertion (e.g., newly due learning steps reappearing mid-session).
Advanced scheduling options (bury, sibling handling, custom steps per deck).
Tag- or note-type–filtered sessions (Phase 1 keeps it simple).
Key Decisions (easiest-to-implement defaults)

Daily limits (defaults): New=15, Review=200. Learning due is unlimited at queue build and prioritized.
Ordering: Learning due first, then Review due, then New. Within each category, order by due_at ascending; New ordered by createdAt ascending.
Allocation in All Decks session: Greedy, deterministic by deck name (ascending). Apply per-deck caps during allocation; fill remaining global capacity from subsequent decks.
Lapse handling: “Again” on Review keeps card in Review with a shorter interval (no return to Learning).
Introduced new: counts when a New card is shown the first time that day.
Time boundaries: Use UTC day for “today” in POC.
Scope

Session types: All Decks and Specific Deck sessions.
Queue building: fixed at session start, respecting limits and caps.
SM-2-lite rating and interval logic.
Daily limit enforcement: global limits and per-deck overrides/caps.
Suspension respected everywhere (suspended cards excluded).
Functional Requirements

Session Types
All Decks session:
Includes eligible cards from all non-suspended decks.
Applies global daily limits and per-deck limits as caps for New and Review.
Specific Deck session:
Includes eligible cards from the chosen deck only.
Uses that deck’s limits instead of global limits (deck overwrites global for that session).
Daily Limits and Caps
Global defaults: daily_new_limit=15, daily_review_limit=200.
Deck overrides: deck.new_limit, deck.review_limit.
All Decks session:
New per deck capped by its deck.new_limit (if set); overall capped by global daily_new_limit.
Review per deck capped by deck.review_limit (if set); overall capped by global daily_review_limit.
Learning due: not capped; all learning due at build time are included.
Specific Deck session:
Use only deck.new_limit and deck.review_limit; ignore global daily limits for this session.
Learning due: not capped.
Queue Build Rules (fixed queue)
Build occurs when user clicks Start Session (All Decks or from a Deck page).
Priority order:
Learning due (all decks or chosen deck), sorted by due_at ascending.
Review due, subject to caps, sorted by due_at ascending.
New, subject to caps, sorted by createdAt ascending.
All Decks allocation:
Determine per-deck remaining capacities for Review and New for “today”:
Per-deck remaining = deck limit minus what’s already completed/introduced earlier today.
Global remaining = global limit minus what’s already completed/introduced earlier today.
Iterate decks by name ascending:
For Review: add up to min(deck_remaining_review, global_remaining_review, deck_due_review_count).
For New: add up to min(deck_remaining_new, global_remaining_new, deck_available_new_count).
Learning: include all learning due cards across decks; no caps applied.
Fixed queue:
The queue does not change after build. Cards that become due later (e.g., Learning step due in 10 minutes) will not appear until the next session build.
Rating and Scheduling (SM-2-lite)
States: new, learning, review; suspended flag excludes cards from sessions.
Defaults:
Initial ease factor EF=2.5; clamp EF ∈ [1.3, 3.0].
Learning steps: [10 minutes, 1 day].
First two review intervals: I1=1 day, I2=6 days; then I(n)=round(I(n-1) * EF).
Ratings:
Again:
Learning: reset to step 0; due=now + 10m.
Review: lapse; EF=max(1.3, EF-0.2); interval=max(1, round(prevInterval*0.5)); due=now + interval; remain in review.
Good:
Learning: advance to next step; if completed, graduate to Review with due=now + 1d.
Review: nextInterval=round(prevInterval * EF); due=now + nextInterval.
Easy:
Learning: graduate immediately to Review with due=now + 1d; EF=min(3.0, EF+0.15).
Review: EF=min(3.0, EF+0.15); nextInterval=round(prevInterval * EF * 1.3); due=now + nextInterval.
Introduced New Tracking
A New card counts toward daily_new_limit when it is first shown to the user on that day.
In All Decks sessions, both per-deck and global “introduced today” counters are considered when building the queue to avoid exceeding caps across multiple sessions in the same day.
Session Flow
Start points:
Today page: Start All Decks session button.
Deck page: Start Deck session button.
During session:
Show Learning due cards first, then Review, then New.
Keyboard shortcuts and UI interactions are unchanged from Phase 1.
Progress indicator shows x/y for the session’s fixed queue.
Ending session:
User can finish the queue or end early. Ending early does not change limits except for any New cards already introduced.
Rebuilding:
To see newly-due Learning steps or updated due counts, the user must start a new session (manual rebuild).
Filtering and Exclusions
Suspended cards are excluded from all queues.
No tag or custom filters in POC; session scope is only All Decks or a single deck.
Time Boundaries and Persistence
“Today” boundaries use UTC in POC.
Daily counters persist within the day:
Reviews_done, Again/Good/Easy counts.
Introduced_new (global and per-deck considered during allocation).
Edge Cases

If a deck’s per-deck cap is reached for today, it contributes only Learning due (uncapped) to an All Decks session; Review/New from that deck are not added beyond cap.
If global limit is reached but some decks still have per-deck capacity, the queue does not exceed the global cap.
If there are no eligible cards, show an empty-state message with the next due time (earliest due_at) if available.
Mid-session lapses or Learning answers that set due within the next minutes will not re-enter the current queue; they will appear in the next session.
Examples

Example A: All Decks with caps

Globals: New=15, Review=200.
Deck A: review_limit=50, new_limit=10; has 40 reviews due, 25 new, 3 learning due.
Deck B: review_limit=100, new_limit=10; has 55 reviews due, 8 new, 6 learning due.
Build queue:
Learning: add 3 (A) + 6 (B) = 9.
Review: add min(40, 50 cap, 200 global) = 40 from A; then add min(55, 100 cap, 160 global remaining) = 55 from B; total 95.
New: add min(25, 10 cap, 15 global) = 10 from A; then add min(8, 10 cap, 5 global remaining) = 5 from B; total 15.
Total session size: 9 + 95 + 15 = 119 cards.
Example B: Specific Deck (overwrites globals)

Globals: New=15, Review=200.
Deck C: review_limit=30, new_limit=5; has 28 reviews due, 20 new, 2 learning due.
Build queue (Deck C only):
Learning: 2 (uncapped).
Review: min(28, 30) = 28.
New: min(20, 5) = 5.
Total session size: 2 + 28 + 5 = 35 cards.
Acceptance Criteria

All Decks session includes Learning from all decks, Review and New allocated with per-deck caps and global limits.
Specific Deck session ignores global limits and uses only that deck’s limits for Review and New; Learning included uncapped.
Queue is fixed after build; newly due Learning steps do not appear until a new session is started.
Suspended cards never appear in any queue.
Introduced New cards are counted at first exposure that day; per-deck caps and global limits are not exceeded across multiple sessions.
Ordering: within each category, items are shown in deterministic order (due_at ascending or createdAt for New).
Metrics

Number of sessions started per day (All Decks vs Deck).
New introduced today (global and per deck), Reviews completed, Again/Good/Easy counts.
Session completion rate (finished vs ended early).
Time-to-first-card after pressing Start.
Assumptions

UTC used for “today” boundaries in POC.
Deck-level limits apply to New and Review only, not Learning due.
Deterministic deck iteration by name ascending for All Decks allocation.
No multi-user complexity in POC; single default user context.
Risks and Mitigations

User expects learning steps to reappear immediately after 10 minutes:
Mitigation: Clear messaging that the current session is fixed; provide a Rebuild/Start New Session button.
Per-deck cap enforcement across multiple sessions in one day:
Mitigation: Maintain per-deck “introduced today” and “reviews today” counters; consult them during queue build.
Unbalanced deck representation in All Decks session due to greedy ordering:
Mitigation: Accept for POC; document behavior. Consider round-robin in future if needed.
Out of Scope (for POC)

Interleaving New and Review beyond the simple L → R → N ordering.
Tag-based sessions, custom steps per deck, bury/siblings, or complex lapse learning re-entries.
Timezone-aware “today” beyond UTC.