-- Manual fix if migration 002 failed after adding column but before completing
-- Connect to database: psql -U kotoba_user -d kotoba_dojo

-- Step 1: Check current state
\d user_settings

-- Step 2: If theme_mode column exists but data not migrated, run this:
UPDATE user_settings 
SET theme_mode = CASE 
    WHEN dark_mode = TRUE THEN 'night'
    WHEN dark_mode = FALSE THEN 'day'
    ELSE 'day'
END;

-- Step 3: If check constraint is missing, add it:
ALTER TABLE user_settings 
ADD CONSTRAINT ck_user_settings_theme_mode 
CHECK (theme_mode IN ('day', 'night'));

-- Step 4: Update alembic version to mark migration as complete
-- (Only if above steps worked and you want to skip re-running migration)
UPDATE alembic_version SET version_num = '002' WHERE version_num = '001';

-- Step 5: Verify
SELECT id, dark_mode, theme_mode, visual_theme FROM user_settings;
