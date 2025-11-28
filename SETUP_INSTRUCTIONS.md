# Kotoba Dojo POC - Setup Instructions

## Complete Application Setup

This is a fully implemented Phase 4+ spaced repetition application. Follow these steps to run locally.

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for PostgreSQL)

### 1. Environment Setup

```bash
# Create virtual environment
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

# Initialize database and run migrations
cd server
python init_db.py
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
```

**Backend will be running at:**
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 3. Frontend Setup

```bash
# In a new terminal, install Node dependencies
cd web
npm install

# Start development server
npm run dev
```

**Frontend will be running at:** http://localhost:5173

### 4. Import Starter Content (Optional)

1. Navigate to http://localhost:5173/welcome
2. Click "Import Starter Decks"
3. This adds 50 JLPT N4 vocabulary and kanji flashcards

### 5. Verification

**Test the application:**
- Dashboard shows session statistics
- Review session works with keyboard shortcuts (Space, 1/2/3, Esc)
- Cards and decks can be created/edited
- Theme switching works (dark/light/system)
- Background music controls function
- Statistics page displays progress

## Project Structure

```
kotoba_dojo_poc/
├── README.md                     # Complete project documentation
├── START_HERE.md                 # Quick start guide
├── docker-compose.yml            # PostgreSQL service
├── api_review.py                 # Enhanced review session API
├── scheduler.py                  # SM-2 algorithm implementation
├── queue_builder.py              # Smart queue building
├── alembic.ini                   # Database migration config
│
├── server/                       # FastAPI Backend
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── api/                 # 6 API modules
│   │   │   ├── cards.py         # Card management
│   │   │   ├── decks.py         # Deck management
│   │   │   ├── tags.py          # Tag system
│   │   │   ├── settings.py      # User preferences
│   │   │   ├── stats.py         # Analytics
│   │   │   └── import_api.py    # JLPT N4 import
│   │   ├── models/database.py   # Complete database schema
│   │   ├── schemas/schemas.py   # Pydantic validation
│   │   ├── db/session.py        # Database session
│   │   └── core/config.py       # Application configuration
│   ├── tests/                   # Comprehensive test suite
│   ├── requirements.txt         # Python dependencies
│   └── init_db.py              # Database initialization
│
├── web/                          # React TypeScript Frontend
│   ├── src/
│   │   ├── pages/               # 7 main pages
│   │   │   ├── DashboardPage.tsx    # Session dashboard
│   │   │   ├── EnhancedReviewPage.tsx  # Review sessions
│   │   │   ├── BrowsePage.tsx       # Card browser
│   │   │   ├── CardsPage.tsx        # Card management
│   │   │   ├── StatsPage.tsx        # Analytics
│   │   │   ├── SettingsPage.tsx     # Preferences
│   │   │   └── WelcomePage.tsx      # Onboarding
│   │   ├── components/          # 25+ reusable components
│   │   ├── api/                 # Type-safe API client
│   │   └── App.tsx              # Root component
│   ├── package.json             # Node.js dependencies
│   └── vite.config.ts          # Build configuration
│
└── alembic/versions/            # Database migrations
    ├── 001_initial.py           # Base schema
    ├── 002_add_theme_mode.py    # Theme system
    └── 003_add_session_config.py # Session configuration
```

## Troubleshooting

### Database Issues

**Issue**: "Could not connect to database" or "Default user not found"

```bash
# Check PostgreSQL status
docker-compose ps

# Restart database
docker-compose down
docker-compose up -d

# Reinitialize database
cd server
python init_db.py
alembic upgrade head
```

### Frontend Build Errors

**Issue**: TypeScript import errors or "does not provide an export"

```bash
cd web
# Run import checker
.\check-imports.ps1

# Or fix manually by using 'import type { ... }' for types
```

### Port Conflicts

**Backend (port 8000) in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
uvicorn app.main:app --reload --port 8001
```

**Frontend (port 5173) in use:**
```bash
# Vite will automatically use next available port (5174, 5175, etc.)
npm run dev
```

### Environment Issues

**Virtual environment not activated:**
```bash
# Windows
venv\Scripts\activate
# You should see (venv) in your prompt

# Linux/Mac
source venv/bin/activate
```

### Reset Everything

**Complete reset (warning: deletes all data):**
```bash
# Stop and remove database
docker-compose down -v

# Restart and reinitialize
docker-compose up -d
cd server
python init_db.py
alembic upgrade head
```

## Development Commands

### Daily Development
```bash
# Start all services
docker-compose up -d                    # PostgreSQL
cd server && uvicorn app.main:app --reload  # Backend (terminal 1)
cd web && npm run dev                    # Frontend (terminal 2)
```

### Database Operations
```bash
cd server
alembic upgrade head                     # Apply migrations
alembic revision --autogenerate -m "desc" # Create migration
python init_db.py                       # Reset database
```

### Testing
```bash
cd server
pytest                                   # All backend tests
pytest -v --cov=app                     # With coverage

cd web
npm run build                            # Frontend build test
.\check-imports.ps1                      # TypeScript validation
```

### Monitoring
```bash
docker-compose ps                        # Database status
docker-compose logs -f                   # Database logs
netstat -an | findstr "8000\|5173"       # Port usage
```

## Application URLs

Once running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Next Steps

After successful setup:
1. Import JLPT N4 starter decks via the Welcome page
2. Create your own cards and decks
3. Experience the enhanced review session system
4. Explore themes, statistics, and settings
5. Try keyboard shortcuts during review (Space, 1/2/3, Esc)

**Ready to start learning Japanese! 🌸**
