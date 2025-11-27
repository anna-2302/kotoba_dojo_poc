"""
Complete Phase 1 Setup and File Organization Script
Run this after setup_phase1.py to organize all files properly
"""
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent

print("🏗️  Kotoba Dojo POC - Phase 1 File Organization\n")

# File movements mapping: source -> destination
file_moves = {
    # Alembic files
    "alembic_env.py": "alembic/env.py",
    "alembic_script.py.mako": "alembic/script.py.mako",
    "migration_001_initial.py": "alembic/versions/001_initial.py",
    
    # Main application
    "server_main.py": "server/app/main.py",
    
    # Schemas
    "schemas_all.py": "server/app/schemas/schemas.py",
    
    # Tests
    "test_conftest.py": "server/tests/conftest.py",
    "test_models.py": "server/tests/test_models.py",
}

# Directories to create
dirs_to_create = [
    "alembic",
    "alembic/versions",
]

print("📁 Creating additional directories...")
for dir_path in dirs_to_create:
    full_path = BASE_DIR / dir_path
    full_path.mkdir(parents=True, exist_ok=True)
    print(f"   ✓ {dir_path}")

print("\n📦 Moving files to correct locations...")
moved_count = 0
skipped_count = 0

for source, destination in file_moves.items():
    source_path = BASE_DIR / source
    dest_path = BASE_DIR / destination
    
    if source_path.exists():
        # Create parent directory if needed
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Move file
        shutil.move(str(source_path), str(dest_path))
        print(f"   ✓ {source} → {destination}")
        moved_count += 1
    else:
        print(f"   ⚠ {source} not found, skipping")
        skipped_count += 1

print(f"\n✅ File organization complete!")
print(f"   Moved: {moved_count} files")
if skipped_count > 0:
    print(f"   Skipped: {skipped_count} files (already moved or not found)")

print("\n" + "="*60)
print("🎉 Phase 1 Setup Complete!")
print("="*60)

print("\n📋 Next Steps:")
print("   1. Create and activate virtual environment:")
print("      python -m venv venv")
print("      venv\\Scripts\\activate  (Windows)")
print()
print("   2. Install dependencies:")
print("      pip install -r requirements.txt")
print()
print("   3. Copy .env.example to .env:")
print("      copy .env.example .env")
print()
print("   4. Start PostgreSQL database:")
print("      docker-compose up -d db")
print()
print("   5. Run database migrations:")
print("      alembic upgrade head")
print()
print("   6. Run tests to verify setup:")
print("      cd server")
print("      pytest")
print()
print("   7. Start development server:")
print("      cd server")
print("      uvicorn app.main:app --reload")
print()
print("   8. Open API documentation:")
print("      http://localhost:8000/docs")
print()

# Create a quick reference file
quick_ref = """# Quick Reference - Kotoba Dojo POC

## Daily Development Commands

### Start Services
```bash
# Start database
docker-compose up -d db

# Start API server
cd server
uvicorn app.main:app --reload
```

### Testing
```bash
cd server
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest --cov=app               # With coverage
pytest --cov=app --cov-report=html  # HTML coverage report
```

### Database
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

### Useful Queries
```bash
# Check database is running
docker-compose ps

# View database logs
docker-compose logs db

# Connect to database
docker-compose exec db psql -U kotoba_user -d kotoba_dojo

# Stop all services
docker-compose down
```

## API Endpoints (Phase 1)

Base URL: http://localhost:8000

- GET `/` - API info
- GET `/health` - Health check
- GET `/docs` - Swagger UI
- GET `/redoc` - ReDoc documentation

## Project Structure

```
kotoba_dojo_poc/
├── server/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── api/              # Route handlers
│   │   ├── models/           # SQLAlchemy models
│   │   │   └── database.py   # All models
│   │   ├── schemas/          # Pydantic schemas
│   │   │   └── schemas.py    # All schemas
│   │   ├── services/         # Business logic
│   │   ├── db/
│   │   │   └── session.py    # Database session
│   │   └── core/
│   │       └── config.py     # Configuration
│   └── tests/                # All tests
│       ├── conftest.py       # Fixtures
│       └── test_models.py    # Model tests
├── alembic/                  # Database migrations
│   ├── versions/             # Migration files
│   │   └── 001_initial.py
│   ├── env.py
│   └── script.py.mako
├── docker-compose.yml        # PostgreSQL
├── alembic.ini              # Alembic config
├── requirements.txt         # Dependencies
└── .env                     # Environment variables
```

## Environment Variables (.env)

```
DATABASE_URL=postgresql://kotoba_user:kotoba_pass@localhost:5432/kotoba_dojo
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
DEFAULT_NEW_PER_DAY=15
DEFAULT_REVIEW_PER_DAY=200
TZ_DEFAULT=UTC
DEBUG=True
```

## Troubleshooting

### Database won't start
```bash
docker-compose down
docker volume prune  # Warning: deletes data!
docker-compose up -d db
```

### Import errors
- Make sure virtual environment is activated
- Check you're in the right directory
- Reinstall: `pip install -r requirements.txt`

### Migration errors
```bash
# Reset database (WARNING: deletes all data!)
docker-compose down -v
docker-compose up -d db
alembic upgrade head
```

### Port conflicts
```bash
# Change ports in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 on host instead

# Or in uvicorn command
uvicorn app.main:app --reload --port 8001
```

## PRD Requirements Tracking

- ✅ REQ-1: Decks (models, schemas)
- ✅ REQ-2: Cards (models, schemas)
- ✅ REQ-3: Tags (models, schemas)
- ✅ REQ-4: Scheduler (models)
- ✅ REQ-6: Daily Limits (models)
- ✅ REQ-7: Suspend (implemented)
- ✅ REQ-9: Stats (models)
- ✅ REQ-10: Dark Mode (settings)
- ✅ REQ-11: Music (settings)

- ⏳ REQ-4: SM-2 Algorithm (Phase 2)
- ⏳ REQ-5: Review UI (Phase 3)
- ⏳ REQ-8: Browse/Search (Phase 1.4)
- ⏳ CRUD Endpoints (Phase 1.4)

## Next Implementation Steps

1. **CRUD Endpoints** (Phase 1.4)
   - Implement deck endpoints
   - Implement card endpoints
   - Implement tag endpoints
   - Add integration tests

2. **SM-2 Scheduler** (Phase 2)
   - Implement algorithm
   - Add queue builder
   - Add unit tests

3. **Review Flow** (Phase 3)
   - Review session endpoints
   - Daily limits logic
   - Integration tests
```
"""

(BASE_DIR / "QUICK_REFERENCE.md").write_text(quick_ref, encoding="utf-8")
print("   ✓ Created QUICK_REFERENCE.md")
print()
