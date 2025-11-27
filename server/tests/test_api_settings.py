"""
Tests for Settings API endpoints.
Tests REQ-10 (Dark Mode) and REQ-11 (Music).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.models.database import User, UserSettings

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_settings.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


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


def test_get_settings_creates_default(setup_database):
    """Test that GET /api/settings creates default settings if not exist."""
    response = client.get("/api/settings")
    
    assert response.status_code == 200
    data = response.json()
    
    # Check default values
    assert data["learning_steps"] == "10,1440"
    assert data["dark_mode"] is False
    assert data["music_enabled"] is False
    assert data["music_volume"] == 0.5


def test_update_dark_mode(setup_database):
    """Test updating dark mode setting."""
    # First get default settings
    client.get("/api/settings")
    
    # Update dark mode
    response = client.put(
        "/api/settings",
        json={"dark_mode": True}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["dark_mode"] is True
    
    # Verify persistence
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert response.json()["dark_mode"] is True


def test_update_music_settings(setup_database):
    """Test updating music settings."""
    # Get default settings first
    client.get("/api/settings")
    
    # Update music settings
    response = client.put(
        "/api/settings",
        json={
            "music_enabled": True,
            "music_volume": 0.7
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["music_enabled"] is True
    assert data["music_volume"] == 0.7
    
    # Verify persistence
    response = client.get("/api/settings")
    data = response.json()
    assert data["music_enabled"] is True
    assert data["music_volume"] == 0.7


def test_update_all_settings(setup_database):
    """Test updating all settings at once."""
    # Get default settings first
    client.get("/api/settings")
    
    # Update all settings
    response = client.put(
        "/api/settings",
        json={
            "dark_mode": True,
            "music_enabled": True,
            "music_volume": 0.3,
            "learning_steps": "5,1440,10080"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["dark_mode"] is True
    assert data["music_enabled"] is True
    assert data["music_volume"] == 0.3
    assert data["learning_steps"] == "5,1440,10080"


def test_update_partial_settings(setup_database):
    """Test that partial updates don't affect other fields."""
    # Get default settings
    client.get("/api/settings")
    
    # Update only dark mode
    response = client.put(
        "/api/settings",
        json={"dark_mode": True}
    )
    assert response.status_code == 200
    
    # Verify other settings unchanged
    response = client.get("/api/settings")
    data = response.json()
    assert data["dark_mode"] is True
    assert data["music_enabled"] is False  # Should remain default
    assert data["music_volume"] == 0.5  # Should remain default


def test_music_volume_validation(setup_database):
    """Test that music volume is validated to be between 0 and 1."""
    client.get("/api/settings")
    
    # Test invalid volume (too high)
    response = client.put(
        "/api/settings",
        json={"music_volume": 1.5}
    )
    assert response.status_code == 422  # Validation error
    
    # Test invalid volume (negative)
    response = client.put(
        "/api/settings",
        json={"music_volume": -0.1}
    )
    assert response.status_code == 422  # Validation error
    
    # Test valid boundaries
    response = client.put(
        "/api/settings",
        json={"music_volume": 0.0}
    )
    assert response.status_code == 200
    
    response = client.put(
        "/api/settings",
        json={"music_volume": 1.0}
    )
    assert response.status_code == 200


def test_settings_persistence_across_requests(setup_database):
    """Test that settings persist across multiple requests."""
    # Initialize
    client.get("/api/settings")
    
    # Set dark mode
    client.put("/api/settings", json={"dark_mode": True})
    
    # Set music
    client.put("/api/settings", json={"music_enabled": True})
    
    # Set volume
    client.put("/api/settings", json={"music_volume": 0.8})
    
    # Verify all changes persisted
    response = client.get("/api/settings")
    data = response.json()
    assert data["dark_mode"] is True
    assert data["music_enabled"] is True
    assert data["music_volume"] == 0.8


def test_theme_mode_default(setup_database):
    """Test that GET /api/settings returns default theme_mode value."""
    response = client.get("/api/settings")
    
    assert response.status_code == 200
    data = response.json()
    
    # Check default theme_mode value (Phase 3)
    assert "theme_mode" in data
    assert data["theme_mode"] == "day"
    assert data["visual_theme"] == "mizuiro"


def test_update_theme_mode(setup_database):
    """Test updating theme_mode setting."""
    # First get default settings
    client.get("/api/settings")
    
    # Update theme mode to night
    response = client.put(
        "/api/settings",
        json={"theme_mode": "night"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["theme_mode"] == "night"
    
    # Verify persistence
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert response.json()["theme_mode"] == "night"


def test_theme_mode_validation(setup_database):
    """Test that theme_mode only accepts 'day' or 'night' values."""
    client.get("/api/settings")
    
    # Test invalid theme_mode
    response = client.put(
        "/api/settings",
        json={"theme_mode": "invalid"}
    )
    assert response.status_code == 422  # Validation error
    
    # Test valid values
    response = client.put(
        "/api/settings",
        json={"theme_mode": "day"}
    )
    assert response.status_code == 200
    assert response.json()["theme_mode"] == "day"
    
    response = client.put(
        "/api/settings",
        json={"theme_mode": "night"}
    )
    assert response.status_code == 200
    assert response.json()["theme_mode"] == "night"


def test_backward_compatibility_dark_mode_to_theme_mode(setup_database):
    """Test that setting dark_mode updates theme_mode (backward compatibility)."""
    client.get("/api/settings")
    
    # Set dark_mode to True
    response = client.put(
        "/api/settings",
        json={"dark_mode": True}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["dark_mode"] is True
    assert data["theme_mode"] == "night"  # Should be synced
    
    # Set dark_mode to False
    response = client.put(
        "/api/settings",
        json={"dark_mode": False}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["dark_mode"] is False
    assert data["theme_mode"] == "day"  # Should be synced


def test_backward_compatibility_theme_mode_to_dark_mode(setup_database):
    """Test that setting theme_mode updates dark_mode (backward compatibility)."""
    client.get("/api/settings")
    
    # Set theme_mode to night
    response = client.put(
        "/api/settings",
        json={"theme_mode": "night"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["theme_mode"] == "night"
    assert data["dark_mode"] is True  # Should be synced
    
    # Set theme_mode to day
    response = client.put(
        "/api/settings",
        json={"theme_mode": "day"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["theme_mode"] == "day"
    assert data["dark_mode"] is False  # Should be synced


def test_theme_and_visual_theme_update(setup_database):
    """Test updating both visual_theme and theme_mode together."""
    client.get("/api/settings")
    
    # Update both theme settings
    response = client.put(
        "/api/settings",
        json={
            "visual_theme": "sakura",
            "theme_mode": "night"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["visual_theme"] == "sakura"
    assert data["theme_mode"] == "night"
    
    # Verify persistence
    response = client.get("/api/settings")
    data = response.json()
    assert data["visual_theme"] == "sakura"
    assert data["theme_mode"] == "night"


def test_theme_mode_doesnt_affect_other_settings(setup_database):
    """Test that updating theme_mode doesn't affect other settings."""
    # Get default settings
    client.get("/api/settings")
    
    # Set music settings
    client.put("/api/settings", json={
        "music_enabled": True,
        "music_volume": 0.7
    })
    
    # Update theme_mode
    response = client.put(
        "/api/settings",
        json={"theme_mode": "night"}
    )
    
    assert response.status_code == 200
    
    # Verify music settings unchanged
    response = client.get("/api/settings")
    data = response.json()
    assert data["theme_mode"] == "night"
    assert data["music_enabled"] is True
    assert data["music_volume"] == 0.7


def test_complete_theme_settings_roundtrip(setup_database):
    """Test GET/PUT roundtrip with all theme-related fields."""
    client.get("/api/settings")
    
    # Update all theme-related settings
    update_payload = {
        "visual_theme": "sakura",
        "theme_mode": "night",
        "dark_mode": True  # Should match theme_mode
    }
    
    response = client.put("/api/settings", json=update_payload)
    assert response.status_code == 200
    
    # Get and verify all fields persisted correctly
    response = client.get("/api/settings")
    data = response.json()
    
    assert data["visual_theme"] == "sakura"
    assert data["theme_mode"] == "night"
    assert data["dark_mode"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
