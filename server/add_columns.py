"""
Add missing columns to user_settings table
"""
from app.db.session import engine
from sqlalchemy import text

def add_columns():
    with engine.connect() as conn:
        try:
            # Add new_per_day column
            conn.execute(text(
                "ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS new_per_day INTEGER DEFAULT 15"
            ))
            print("✅ Added new_per_day column")
            
            # Add review_per_day column
            conn.execute(text(
                "ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS review_per_day INTEGER DEFAULT 200"
            ))
            print("✅ Added review_per_day column")
            
            conn.commit()
            print("\n✅ All columns added successfully!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    add_columns()
