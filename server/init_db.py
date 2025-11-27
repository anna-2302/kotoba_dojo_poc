"""
Initialize database with default user and data.
Run this to fix CORS/500 errors caused by missing default user.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.database import Base, User, UserSettings
from app.db.session import engine, SessionLocal

def init_default_user():
    """Create default user if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if default user exists
        user = db.query(User).filter(User.username == "default_user").first()
        
        if not user:
            print("Creating default user...")
            user = User(
                id=1,
                username="default_user",
                timezone="UTC"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✓ Created default user (ID: {user.id})")
        else:
            print(f"✓ Default user already exists (ID: {user.id})")
        
        # Check if user settings exist
        settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        
        if not settings:
            print("Creating default user settings...")
            settings = UserSettings(
                user_id=user.id,
                learning_steps="10,1440",
                dark_mode=False,
                music_enabled=False,
                music_volume=0.5
            )
            db.add(settings)
            db.commit()
            print("✓ Created default user settings")
        else:
            print("✓ User settings already exist")
        
        print("\n✅ Database initialization complete!")
        print("You can now start the backend server:")
        print("  uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    print("=" * 50)
    
    # Create all tables if they don't exist
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created/verified")
    
    # Initialize default user
    init_default_user()
