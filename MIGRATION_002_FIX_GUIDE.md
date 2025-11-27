# Migration 002 Error Fix Guide

## Problem
Migration failed with error:
```
psycopg2.errors.UndefinedFunction: operator does not exist: boolean = integer
LINE 4: WHEN dark_mode = 1 THEN 'night'
```

**Root Cause:** Migration was written for SQLite (uses `1`/`0` for booleans) but database is PostgreSQL (uses `TRUE`/`FALSE`).

## Solution Applied

### Fixed Migration File
Updated `alembic/versions/002_add_theme_mode.py` to use `TRUE`/`FALSE` instead of `1`/`0`:

```sql
-- OLD (SQLite syntax)
WHEN dark_mode = 1 THEN 'night'

-- NEW (PostgreSQL syntax)
WHEN dark_mode = TRUE THEN 'night'
```

## How to Fix Your Database

### Option 1: Automated Fix (Recommended)

Run the provided PowerShell script from project root:

```powershell
# From project root (where alembic.ini is)
.\fix_migration.ps1
```

This script will:
1. Check current state
2. Rollback to revision 001
3. Re-apply migration 002 with corrected SQL
4. Verify success

### Option 2: Manual Steps

If the automated script doesn't work or you prefer manual control:

#### Step 1: Activate Environment
```powershell
cd C:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc
.\venv\Scripts\Activate.ps1
```

#### Step 2: Check Current State
```powershell
alembic current
```

Expected output: `001` or `002 (head)` (with error)

#### Step 3: Rollback to 001
```powershell
alembic downgrade 001
```

If this fails with "revision not found", the database may be in inconsistent state. See Option 3 below.

#### Step 4: Re-run Migration
```powershell
alembic upgrade head
```

Should now complete successfully showing:
```
INFO  [alembic.runtime.migration] Running upgrade 001 -> 002, Add theme_mode to user_settings
```

#### Step 5: Verify
```powershell
alembic current
# Should show: 002 (head)
```

### Option 3: Manual Database Fix (If Column Already Exists)

If the migration failed after creating the column but before completing, you need to manually finish it.

#### Connect to Database
```powershell
# Using psql
psql -U kotoba_user -d kotoba_dojo

# OR using pgAdmin or your preferred PostgreSQL client
```

#### Check Table State
```sql
\d user_settings
```

Look for `theme_mode` column. If it exists, proceed with manual fix.

#### Run Fix SQL
```sql
-- Populate theme_mode from dark_mode
UPDATE user_settings 
SET theme_mode = CASE 
    WHEN dark_mode = TRUE THEN 'night'
    WHEN dark_mode = FALSE THEN 'day'
    ELSE 'day'
END;

-- Add check constraint if missing
ALTER TABLE user_settings 
ADD CONSTRAINT ck_user_settings_theme_mode 
CHECK (theme_mode IN ('day', 'night'));

-- Mark migration as complete in alembic
UPDATE alembic_version SET version_num = '002';
```

#### Verify Fix
```sql
-- Check data
SELECT id, dark_mode, theme_mode, visual_theme FROM user_settings;

-- Should see theme_mode populated correctly:
-- dark_mode=true → theme_mode='night'
-- dark_mode=false → theme_mode='day'
```

#### Exit psql
```sql
\q
```

#### Verify Alembic
```powershell
alembic current
# Should now show: 002 (head)
```

## Verification Checklist

After applying fix, verify:

- [ ] `alembic current` shows `002 (head)`
- [ ] Database has `theme_mode` column in `user_settings` table
- [ ] All existing rows have `theme_mode` populated ('day' or 'night')
- [ ] Check constraint exists: `ck_user_settings_theme_mode`
- [ ] `dark_mode = TRUE` rows have `theme_mode = 'night'`
- [ ] `dark_mode = FALSE` rows have `theme_mode = 'day'`

### Test with psql:
```sql
-- Connect
psql -U kotoba_user -d kotoba_dojo

-- Check constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'ck_user_settings_theme_mode';

-- Check data consistency
SELECT 
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE dark_mode = TRUE AND theme_mode = 'night') as correct_night,
    COUNT(*) FILTER (WHERE dark_mode = FALSE AND theme_mode = 'day') as correct_day
FROM user_settings;
```

## Prevention for Future Migrations

When writing migrations that work with both SQLite and PostgreSQL:

### For Boolean Comparisons:
```python
# ✅ CORRECT - Works on both
op.execute("""
    UPDATE table_name 
    SET column = CASE 
        WHEN bool_column = TRUE THEN 'value1'
        ELSE 'value2'
    END
""")

# ❌ WRONG - Only works on SQLite
op.execute("""
    UPDATE table_name 
    SET column = CASE 
        WHEN bool_column = 1 THEN 'value1'
        ELSE 'value2'
    END
""")
```

### Or Use Conditional Logic:
```python
from alembic import op, context

def upgrade():
    conn = op.get_bind()
    dialect_name = conn.dialect.name
    
    if dialect_name == 'postgresql':
        op.execute("... PostgreSQL-specific SQL ...")
    elif dialect_name == 'sqlite':
        op.execute("... SQLite-specific SQL ...")
```

## Files Created

- `fix_migration.ps1` - Automated fix script
- `manual_migration_fix.sql` - Manual SQL fix steps
- `check_migration_state.sql` - Diagnostic queries
- `MIGRATION_002_FIX_GUIDE.md` - This guide

## Need Help?

If none of these options work:

1. Check PostgreSQL logs: Look for detailed error messages
2. Verify database connection: Ensure you can connect with `psql -U kotoba_user -d kotoba_dojo`
3. Check permissions: User needs ALTER TABLE privileges
4. Backup first: `pg_dump -U kotoba_user kotoba_dojo > backup.sql`

## Related Files

- Migration file: `alembic/versions/002_add_theme_mode.py`
- Backend model: `server/app/models/database.py`
- Backend API: `server/app/api/settings.py`
- Backend schemas: `server/app/schemas/schemas.py`
