"""
Pytest configuration and fixtures.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from datetime import datetime

from app.db.session import Base
from app.main import app
from app.core.config import settings
from app.models.database import User, UserSettings

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Create a fresh database for each test.
    """
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    # Create default test user
    test_user = User(
        username="test_user",
        timezone="UTC",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(test_user)
    session.commit()
    session.refresh(test_user)
    
    # Create default settings
    test_settings = UserSettings(
        user_id=test_user.id,
        learning_steps="10,1440",
        dark_mode=False,
        music_enabled=False,
        music_volume=0.5
    )
    session.add(test_settings)
    session.commit()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Create a test client with dependency override.
    """
    from app.db.session import get_db
    
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Get the default test user."""
    return db.query(User).filter(User.username == "test_user").first()
