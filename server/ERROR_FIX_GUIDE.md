# Quick Fix Guide for Errors

## Error 1: Alembic "No 'script_location' key found"

**Problem:** Running `alembic upgrade head` from the `server` directory.

**Solution:** Alembic must be run from the project root directory (where `alembic.ini` is located).

```powershell
# WRONG (from server directory)
cd server
alembic upgrade head  # ❌ This fails

# CORRECT (from project root)
cd c:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc
alembic upgrade head  # ✅ This works
```

## Error 2: SQLite Test Database "index already exists"

**Problem:** Stale test database file with conflicting indexes.

**Solution:** Delete the test database file before running tests.

```powershell
# From server directory with venv activated
cd c:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc\server

# Remove stale database
Remove-Item test_settings.db -ErrorAction SilentlyContinue

# Run tests
python -m pytest tests/test_api_settings.py -v
```

**OR use the provided script:**

```powershell
# From server directory
.\run_tests.ps1
```

## Complete Workflow

### 1. Apply Database Migration

```powershell
# Activate virtual environment
& C:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc\venv\Scripts\Activate.ps1

# Navigate to project root (NOT server directory)
cd c:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc

# Run migration
alembic upgrade head

# Verify
alembic current
# Should show: 002 (head)
```

### 2. Run Tests

```powershell
# Navigate to server directory
cd server

# Clean and run tests
.\run_tests.ps1

# OR manually
Remove-Item test_settings.db -ErrorAction SilentlyContinue
python -m pytest tests/test_api_settings.py -v
```

### 3. Run All Tests with Coverage

```powershell
cd server
Remove-Item test_settings.db -ErrorAction SilentlyContinue
python -m pytest tests/test_api_settings.py --cov=app.api.settings --cov-report=html -v
```

## Expected Results

After fixes:
- ✅ All 15 tests should pass
- ✅ No database errors
- ✅ Coverage report shows 95%+ for settings.py

## Test Fixed

The `setup_database` fixture now properly drops all tables before creating them, preventing index conflicts:

```python
@pytest.fixture(scope="function")
def setup_database():
    """Create test database before each test."""
    # Drop all tables first to ensure clean state
    Base.metadata.drop_all(bind=engine)
    # Then create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up after test
    Base.metadata.drop_all(bind=engine)
```

## Quick Reference

| Task | Command | Directory |
|------|---------|-----------|
| Apply migration | `alembic upgrade head` | **Project root** |
| Check migration | `alembic current` | **Project root** |
| Run tests | `.\run_tests.ps1` | server/ |
| Clean database | `Remove-Item test_settings.db` | server/ |
