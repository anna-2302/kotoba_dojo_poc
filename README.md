# Kotoba Dojo POC

🎌 A cozy, lightweight spaced-repetition flashcard app for Japanese language learning.

**Status**: ✅ **Phase 4 Enhanced Review Complete** - Structured session-based review system with SM-2 scheduling!

## 🎯 Features

### Core Functionality
- ✅ **Enhanced Review Sessions**: Structured New → Learning → Review progression
- ✅ **SM-2 Scheduler**: Advanced spaced repetition with configurable learning steps
- ✅ **Session Management**: Smart queue building with daily limits and deck filtering
- ✅ **Deck Management**: Full CRUD with per-deck settings and organization
- ✅ **Card Management**: Complete lifecycle with front/back, notes, tags, suspend
- ✅ **Browse & Search**: Advanced filtering by deck, tag, state, or search text
- ✅ **Statistics & Analytics**: Session stats, retention rates, progress tracking
- ✅ **Daily Limits**: Configurable new/review limits with intelligent queue building
- ✅ **Multi-tag Support**: Flexible categorization and filtering system
- ✅ **Card State Management**: Suspend/resume with full scheduling state preservation

### User Experience
- ✅ **Smart Dashboard**: Session-based queue with progress visualization
- ✅ **Advanced Theming**: Dark/light/system modes with visual theme customization
- ✅ **Ambient Audio**: Background music with volume control and track selection
- ✅ **Session Configuration**: Configurable learning steps, daily limits, deck-specific settings
- ✅ **Prebuilt Content**: JLPT N4 vocabulary (30 cards) and kanji (20 cards)
- ✅ **Guided Onboarding**: Welcome flow with automatic deck import
- ✅ **Keyboard Shortcuts**: Full keyboard navigation (Space, 1/2/3, Esc, R)
- ✅ **Responsive Design**: Mobile-friendly interface with accessibility support

## 🛠 Tech Stack

### Backend
- **Python 3.11+** - Modern Python with type hints
- **FastAPI** - High-performance async API framework
- **SQLAlchemy** - ORM with PostgreSQL support
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **pytest** - Testing framework

### Frontend
- **React 18+** - Modern React with hooks and context
- **TypeScript** - Full type safety with verbatimModuleSyntax
- **Vite 7+** - Ultra-fast build tool and dev server
- **TanStack Query v5** - Server state management with 5min stale time
- **React Router v7** - Advanced client-side routing
- **Tailwind CSS v4** - Utility-first styling with dark mode support
- **Context API** - Theme management and settings sync

### Database
- **PostgreSQL** - Production database
- **SQLite** - Development/testing fallback

## 📁 Project Structure

```
kotoba_dojo_poc/
├── server/                          # FastAPI backend
│   ├── app/
│   │   ├── api/                     # API routes (6 modules)
│   │   │   ├── cards.py            # Card CRUD with suspend/resume
│   │   │   ├── decks.py            # Deck management with counters
│   │   │   ├── tags.py             # Tag system with filtering
│   │   │   ├── settings.py         # User preferences & theme
│   │   │   ├── import_api.py       # Prebuilt deck import
│   │   │   └── stats.py            # Analytics and progress
│   │   ├── models/                  # SQLAlchemy models
│   │   │   └── database.py         # Complete schema (9 tables)
│   │   ├── schemas/                 # Pydantic validation
│   │   │   └── schemas.py          # All request/response types
│   │   ├── services/                # Business logic
│   │   │   └── import_prebuilt.py  # N4 deck generation
│   │   ├── db/                      # Database layer
│   │   │   ├── seed_data.py        # JLPT N4 sample cards
│   │   │   └── session.py          # Database session management
│   │   ├── core/                    # Application core
│   │   │   └── config.py           # Environment configuration
│   │   └── main.py                  # FastAPI application
│   ├── tests/                       # Comprehensive test suite
│   └── requirements.txt             # Python dependencies
├── web/                             # React TypeScript frontend
│   ├── src/
│   │   ├── pages/                   # Route components (7 pages)
│   │   │   ├── DashboardPage.tsx   # Session-based dashboard
│   │   │   ├── EnhancedReviewPage.tsx  # Phase 4 structured review
│   │   │   ├── BrowsePage.tsx      # Advanced card browser
│   │   │   ├── CardsPage.tsx       # Card management interface
│   │   │   ├── StatsPage.tsx       # Progress analytics
│   │   │   ├── SettingsPage.tsx    # User preferences
│   │   │   └── WelcomePage.tsx     # Onboarding flow
│   │   ├── components/              # 25+ reusable components
│   │   │   ├── ThemeProvider.tsx   # Dark/light/system theme
│   │   │   ├── SessionControls.tsx # Enhanced review interface
│   │   │   ├── SessionProgressIndicator.tsx # Progress visualization
│   │   │   ├── AmbientAudioPlayer.tsx # Background music
│   │   │   └── AppHeader.tsx       # Navigation header
│   │   ├── api/                     # Typed API client
│   │   │   ├── client.ts           # Axios with interceptors
│   │   │   ├── types.ts            # Full TypeScript definitions
│   │   │   └── index.ts            # Barrel exports
│   │   ├── App.tsx                  # Router and providers
│   │   └── main.tsx                 # React 18 entry point
│   ├── package.json                 # Modern dependencies
│   └── vite.config.ts              # Vite 7 configuration
├── api_review.py                    # Enhanced review session API
├── queue_builder.py                 # Smart queue building logic
├── scheduler.py                     # SM-2 algorithm implementation
├── docker-compose.yml               # PostgreSQL service
├── alembic.ini                      # Database migration config
└── alembic/versions/                # Schema evolution history
    ├── 001_initial.py               # Base schema
    ├── 002_add_theme_mode.py        # Theme system
    └── 003_add_session_config.py    # Session configuration
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL** (via Docker recommended)

### 1. Clone and Setup Environment

```bash
# Navigate to project
cd kotoba_dojo_poc

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2. Backend Setup

```bash
# Install Python dependencies
cd server
pip install -r requirements.txt

# Start PostgreSQL database
cd ..
docker-compose up -d

# Initialize database
cd server
python init_db.py

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
```

**Backend running at:** http://localhost:8000

### 3. Frontend Setup

```bash
# In a new terminal, install frontend dependencies
cd web
npm install

# Start development server
npm run dev
```

**Frontend running at:** http://localhost:5173

### Option 2: Manual Setup

#### Step 1: Clone and Setup Virtual Environment

```bash
# Clone repository (if applicable)
cd kotoba_dojo_poc

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

#### Step 2: Backend Setup

```bash
# Install Python dependencies
cd server
pip install -r requirements.txt

# Option A: Use PostgreSQL (Recommended for production)
docker-compose up -d db
# Edit server/app/core/config.py if needed for connection

# Option B: Use SQLite (Quick start, development)
# Edit server/app/core/config.py:
# database_url: str = "sqlite:///./app.db"

# Initialize database
python init_db.py

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend should now be running at:** http://localhost:8000

#### Step 3: Frontend Setup

```bash
# In a new terminal
cd web

# Install Node dependencies
npm install

# Start development server
npm run dev
```

**Frontend should now be running at:** http://localhost:5173

#### Step 4: Import Starter Decks (Optional)

1. Navigate to: http://localhost:5173/welcome
2. Click "Import Starter Decks"
3. Get 50 ready-to-study JLPT N4 cards!

## 🧪 Testing

### Backend Tests

```bash
cd server

# Run all tests
pytest

# Run specific test file
pytest tests/test_api_settings.py -v
pytest tests/test_import_api.py -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run with verbose output
pytest -v -s
```

**Test Coverage:**
- Settings API: 9 tests ✅
- Import API: 10 tests ✅
- All tests passing

### Manual Testing

1. **Dashboard**: Check due counts, start review
2. **Review Session**: Flip cards, rate (Space, 1, 2, 3 keys)
3. **Browse**: Filter by deck/tag, search cards
4. **Deck Management**: Create, edit, delete decks
5. **Card Management**: Add, edit, suspend cards
6. **Settings**: Toggle dark mode, enable music
7. **Import**: Import prebuilt N4 decks

## 📚 API Documentation

Once the backend is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Key Endpoints

**Enhanced Review Sessions (Phase 4):**
```
POST /api/review/build-session    - Build structured session
POST /api/review/answer           - Submit answer with section management
GET  /api/review/stats/{mode}     - Session statistics (all/new/due/learning)
POST /api/review/end-session      - Complete session with analytics
```

**Deck Management:**
```
GET    /api/decks                - List all decks with card counts
POST   /api/decks                - Create deck with validation
GET    /api/decks/{id}           - Get deck with full details
PUT    /api/decks/{id}           - Update deck settings
DELETE /api/decks/{id}           - Delete deck (cascades to cards)
```

**Card Management:**
```
GET    /api/cards                - Browse/search with advanced filters
POST   /api/cards                - Create card with tags
GET    /api/cards/{id}           - Get card with scheduling state
PUT    /api/cards/{id}           - Update card content
POST   /api/cards/{id}/suspend   - Suspend/resume card
DELETE /api/cards/{id}           - Delete card
```

**Settings & Preferences:**
```
GET    /api/settings             - Get user settings (theme, music, limits)
PUT    /api/settings             - Update preferences with validation
```

**Content & Analytics:**
```
POST   /api/import/prebuilt      - Import JLPT N4 decks
GET    /api/import/status        - Check import status
GET    /api/stats/overview       - Learning analytics and progress
GET    /api/tags                 - List tags with usage counts
```

## 🎓 Usage Guide

### Getting Started

1. **Import Starter Decks** (optional but recommended)
   - Visit welcome page or click banner on dashboard
   - Import 50 curated JLPT N4 flashcards

2. **Review Your Cards**
   - Dashboard shows today's queue
   - Click "Start Review" or press R
   - Use Space to flip, 1/2/3 to rate

3. **Add Your Own Cards**
   - Go to Cards page
   - Click "Add Card"
   - Fill in front, back, notes, tags
   - Assign to deck

4. **Organize with Decks**
   - Create decks by topic (Grammar, Kanji, etc.)
   - Move cards between decks
   - Set per-deck daily limits

5. **Track Progress**
   - Statistics page shows learning progress
   - Retention rate, streak, cards reviewed
   - Charts and graphs

### Keyboard Shortcuts

**Review Session:**
- `Space` - Flip card
- `1` - Again (forgot)
- `2` - Good (remembered)
- `3` - Easy (too easy)
- `Esc` - End session

**Dashboard:**
- `R` - Start review (when cards due)

## ⚙️ Configuration

### Backend Settings

Edit `server/app/core/config.py`:

```python
# Database
database_url: str = "postgresql://user:pass@localhost:5432/kotoba_dojo"
# Or SQLite: "sqlite:///./app.db"

# CORS (adjust for production)
cors_origins: List[str] = ["http://localhost:5173"]

# Daily Limits (REQ-6)
default_new_per_day: int = 15
default_review_per_day: int = 200

# Timezone
tz_default: str = "UTC"
```

### Frontend Settings

Edit `web/.env` (create if doesn't exist):

```bash
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend Won't Start

**Issue**: "Default user not found" or "Database connection failed"

**Solution**:
```bash
# Ensure PostgreSQL is running
docker-compose up -d

# Initialize database
cd server
python init_db.py

# Run migrations
alembic upgrade head
```

### Frontend Build Errors

**Issue**: TypeScript import errors or "does not provide an export"

**Solution**: Run import checker
```bash
cd web
.\check-imports.ps1
# Or manually fix type imports with 'import type { ... }'
```

### CORS Errors

**Issue**: "Access blocked by CORS policy"

**Solution**:
```bash
# Verify backend is running
Invoke-RestMethod http://localhost:8000/health

# Restart backend with correct CORS settings
cd server
uvicorn app.main:app --reload --host 0.0.0.0
```

### Database Errors

**Issue**: "Could not connect to database"

**Solution 1** (PostgreSQL):
```bash
# Start PostgreSQL
docker-compose up -d db

# Check it's running
docker ps
```

**Solution 2** (Switch to SQLite):
```python
# Edit server/app/core/config.py
database_url: str = "sqlite:///./app.db"
```

### Port Already in Use

**Issue**: "Port 8000 is already in use"

**Solution**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### Frontend Build Errors

**Issue**: npm install fails

**Solution**:
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

See `FIX_CORS_ERROR.md` for detailed troubleshooting.

## 📏 Development Status

### Completed Implementation ✅

- ✅ **Foundation**: Complete database schema with 9 tables
- ✅ **Backend API**: 6 API modules with full CRUD operations
- ✅ **SM-2 Scheduling**: Advanced spaced repetition algorithm
- ✅ **Enhanced Review Sessions**: Structured New → Learning → Review progression
- ✅ **Session Management**: Smart queue building with daily limits
- ✅ **Frontend Application**: React TypeScript with 7 pages, 25+ components
- ✅ **Advanced Theming**: Dark/light/system modes with visual customization
- ✅ **Session Configuration**: Configurable learning steps and review settings
- ✅ **Analytics & Statistics**: Progress tracking with retention analysis
- ✅ **Content Management**: Full CRUD for decks, cards, and tags
- ✅ **Prebuilt Content**: JLPT N4 vocabulary and kanji decks
- ✅ **User Experience**: Keyboard shortcuts, mobile-responsive, accessibility

### Latest Updates (November 2025)

- ✅ **Unified Review Experience**: Removed classic/enhanced toggle, Phase 4 sessions only
- ✅ **Session-Based Dashboard**: Smart queue visualization with section progress
- ✅ **Enhanced Navigation**: Streamlined routing with single review experience
- ✅ **Code Consolidation**: Removed legacy components, cleaner codebase

### Requirements Fulfilled

**From PRD.MD:**
- ✅ REQ-1: Deck CRUD and card CRUD with tags
- ✅ REQ-2: SM-2-lite scheduler
- ✅ REQ-3: Daily queues and limits
- ✅ REQ-4: Browse/search with filters
- ✅ REQ-5: Review session UI with keyboard shortcuts
- ✅ REQ-6: Suspend/unsuspend cards
- ✅ REQ-7: Basic stats (retention, streak, counts)
- ✅ REQ-8: Tags support (multi-tag, filtering)
- ✅ REQ-9: Daily limits (new/review per day)
- ✅ REQ-10: Dark mode toggle
- ✅ REQ-11: Background music controls
- ✅ REQ-12: Prebuilt N4 decks (50 sample cards)

**Current Status**: 🎉 **PHASE 4+ COMPLETE** - Advanced session-based spaced repetition system ready for use!

## 🎯 Usage Guide

### Getting Started

1. **Visit the Dashboard** at http://localhost:5173
   - View session-ready cards organized by New/Learning/Review
   - See daily progress and queue statistics

2. **Start a Review Session**
   - Click "Start Review Session" or press `R`
   - Experience structured progression: New → Learning → Review
   - Use keyboard shortcuts: `Space` (flip), `1/2/3` (rate), `Esc` (exit)

3. **Manage Your Content**
   - **Cards Page**: Add, edit, suspend cards with full search/filter
   - **Decks Page**: Organize cards into themed collections
   - **Browse Page**: Advanced filtering by deck, tag, state, or search

4. **Track Your Progress**
   - **Stats Page**: View retention rates, streaks, and learning analytics
   - **Dashboard**: Monitor daily progress and session completion

5. **Customize Your Experience**
   - **Settings**: Configure learning steps, daily limits, theme, music
   - Import JLPT N4 starter decks for immediate practice

## 📦 Deployment

### Production Checklist

- [ ] Update `SECRET_KEY` in config
- [ ] Configure production database URL
- [ ] Set `DEBUG=False`
- [ ] Configure CORS for production domain
- [ ] Set up reverse proxy (Nginx)
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure logging/monitoring

### Docker Deployment (Future)

```bash
# Build containers
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 🤝 Contributing

This is a POC project. For production use:

1. Replace sample N4 data with full JMdict/KANJIDIC parsing
2. Add user authentication
3. Implement multi-user support
4. Add cloud sync
5. Create mobile apps

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **JMdict/KANJIDIC**: Japanese dictionary data (EDRDG)
- **Anki**: Inspiration for spaced repetition features
- **JLPT Resources**: Sample vocabulary and kanji

## 📞 Support

For issues, questions, or feedback:

- Check `FIX_CORS_ERROR.md` for common problems
- See `PHASE5_7_QUICKSTART.md` for detailed setup
- Review API docs at `/docs` endpoint

---

**Made with ❤️ for Japanese language learners**

**Version**: 0.2.0 (Phase 4+ Enhanced)

**Last Updated**: 2025-11-28

**Status**: ✅ Advanced Session-Based Review System Complete!
