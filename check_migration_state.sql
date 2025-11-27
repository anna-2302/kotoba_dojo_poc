-- Emergency migration fix script for PostgreSQL
-- Run this if migration 002 failed partway through

-- Check if theme_mode column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- If theme_mode exists but check constraint doesn't, we need to complete the migration manually

-- Option 1: If theme_mode column exists but is not populated, populate it
-- UPDATE user_settings 
-- SET theme_mode = CASE 
--     WHEN dark_mode = TRUE THEN 'night'
--     ELSE 'day'
-- END
-- WHERE theme_mode = 'day';  -- Only update defaults

-- Option 2: If constraint is missing, add it
-- ALTER TABLE user_settings 
-- ADD CONSTRAINT ck_user_settings_theme_mode 
-- CHECK (theme_mode IN ('day', 'night'));

-- Check alembic version to see if migration was recorded as complete
SELECT * FROM alembic_version;
