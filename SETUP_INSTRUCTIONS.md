# Kotoba Dojo POC - Phase 1 Setup Instructions

## Step-by-Step Setup

### 1. Run the Setup Script

```bash
python setup_phase1.py
```

This will create:
- Complete directory structure under `server/`
- Core configuration files
- Database models (SQLAlchemy)
- All `__init__.py` files

### 2. Create and Activate Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI & Uvicorn
- SQLAlchemy & Alembic
- PostgreSQL driver
- Testing tools (pytest, httpx)
- Pydantic & utilities

### 4. Set Up Environment Variables

```bash
# Copy the example file
copy .env.example .env

# Edit .env with your actual values (optional for local dev)
```

### 5. Start PostgreSQL Database

```bash
docker-compose up -d db
```

Verify it's running:
```bash
docker-compose ps
```

### 6. Initialize Database with Alembic

After completing Step 1.3 (Alembic migrations), run:
```bash
cd server
alembic upgrade head
```

### 7. Create Initial User (Manual)

The setup script will include a seed script. For now, you can use SQL:
```sql
INSERT INTO users (username, timezone) VALUES ('default_user', 'UTC');
```

### 8. Start Development Server

```bash
# From project root
cd server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 9. Verify API is Running

Open your browser:
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

### 10. Run Tests

```bash
cd server
pytest
```

With coverage:
```bash
pytest --cov=app --cov-report=html
```

## File Structure Created

```
kotoba_dojo_poc/
├── .gitignore
├── .env.example
├── README.md
├── docker-compose.yml
├── requirements.txt
├── pyproject.toml
├── setup_phase1.py          # Run this first!
│
├── server/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app (to be moved)
│   │   │
│   │   ├── api/              # API routes (Step 1.4)
│   │   │   ├── __init__.py
│   │   │   ├── decks.py      # (Next step)
│   │   │   ├── cards.py
│   │   │   └── tags.py
│   │   │
│   │   ├── models/           # SQLAlchemy models ✅
│   │   │   ├── __init__.py
│   │   │   └── database.py
│   │   │
│   │   ├── schemas/          # Pydantic schemas ✅
│   │   │   ├── __init__.py
│   │   │   └── (to be moved from schemas_all.py)
│   │   │
│   │   ├── services/         # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── scheduler.py  # (Phase 2)
│   │   │   └── queue.py
│   │   │
│   │   ├── db/               # Database config ✅
│   │   │   ├── __init__.py
│   │   │   └── session.py
│   │   │
│   │   └── core/             # Core config ✅
│   │       ├── __init__.py
│   │       └── config.py
│   │
│   └── tests/                # Tests (Step 1.5)
│       ├── __init__.py
│       ├── conftest.py
│       └── test_*.py
```

## What's Next

After completing Phase 1 setup:

**Step 1.3:** Alembic Migrations Setup
**Step 1.4:** Implement CRUD API Endpoints
**Step 1.5:** Write and Run Tests

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Import Errors

Make sure you're in the activated virtual environment:
```bash
# Windows
venv\Scripts\activate

# You should see (venv) in your prompt
```

### Port Already in Use

If port 8000 or 5432 is already in use:
```bash
# Kill process on port (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change the port in the command
uvicorn app.main:app --reload --port 8001
```

## Quick Commands Reference

```bash
# Start everything
docker-compose up -d db
cd server && uvicorn app.main:app --reload

# Run tests
cd server && pytest

# View coverage
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Stop services
docker-compose down
```

## Files to Move After Setup

After running `setup_phase1.py`, manually move these files:

1. `server_main.py` → `server/app/main.py`
2. `schemas_all.py` → `server/app/schemas/schemas.py`

Or the setup script will handle this automatically.
