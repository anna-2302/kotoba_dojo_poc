# Kotoba Dojo API - Quick Reference

## Base URL
```
http://localhost:8000
```

## Endpoints

### 🏠 Health Check
```bash
GET /              # API info
GET /health        # Health status
GET /docs          # Swagger UI
GET /redoc         # ReDoc docs
```

### 📚 Decks

#### List All Decks
```bash
GET /api/decks/
```
Response: List of decks with card counts and due counts

#### Create Deck
```bash
POST /api/decks/
Content-Type: application/json

{
  "name": "JLPT N5 Vocabulary",
  "description": "Basic vocabulary",  # optional
  "new_per_day": 20,                   # optional
  "review_per_day": 150                # optional
}
```

#### Get Deck
```bash
GET /api/decks/{deck_id}
```

#### Update Deck
```bash
PUT /api/decks/{deck_id}
Content-Type: application/json

{
  "name": "Updated Name",     # optional
  "description": "Updated",   # optional
  "new_per_day": 25          # optional
}
```

#### Delete Deck
```bash
DELETE /api/decks/{deck_id}
```
⚠️ Cascades: Deletes all cards in the deck

### 📇 Cards

#### List/Search Cards
```bash
GET /api/cards/
  ?deck_ids=1,2              # Filter by decks
  &tag_ids=1,2               # Filter by tags
  &state=new                 # Filter by state (new|learning|review)
  &suspended=false           # Filter by suspended status
  &search=hello              # Full-text search
  &page=1                    # Page number
  &page_size=50              # Items per page
  &sort_by=created_at        # Sort field
  &sort_order=desc           # Sort order (asc|desc)
```

#### Create Card
```bash
POST /api/cards/
Content-Type: application/json

{
  "deck_id": 1,
  "front": "こんにちは",
  "back": "Hello",
  "notes": "Common greeting",  # optional
  "tag_ids": [1, 2]            # optional
}
```

#### Get Card
```bash
GET /api/cards/{card_id}
```

#### Update Card
```bash
PUT /api/cards/{card_id}
Content-Type: application/json

{
  "front": "Updated front",    # optional
  "back": "Updated back",      # optional
  "notes": "New notes",        # optional
  "deck_id": 2,                # optional (move to different deck)
  "tag_ids": [1, 3]            # optional (replace tags)
}
```

#### Delete Card
```bash
DELETE /api/cards/{card_id}
```

#### Suspend/Unsuspend Card
```bash
PATCH /api/cards/{card_id}/suspend?suspend=true   # Suspend
PATCH /api/cards/{card_id}/suspend?suspend=false  # Unsuspend
```

### 🏷️ Tags

#### List All Tags
```bash
GET /api/tags/
```
Response: List of tags with card counts

#### Create Tag
```bash
POST /api/tags/
Content-Type: application/json

{
  "name": "noun"
}
```

#### Get Tag
```bash
GET /api/tags/{tag_id}
```

#### Delete Tag
```bash
DELETE /api/tags/{tag_id}
```
⚠️ Removes tag from all associated cards

## Example Workflows

### Setup New Deck with Cards
```bash
# 1. Create deck
curl -X POST http://localhost:8000/api/decks/ \
  -H "Content-Type: application/json" \
  -d '{"name": "My Deck"}'
# Returns: {"id": 1, ...}

# 2. Create tags
curl -X POST http://localhost:8000/api/tags/ \
  -H "Content-Type: application/json" \
  -d '{"name": "noun"}'
# Returns: {"id": 1, ...}

# 3. Create card
curl -X POST http://localhost:8000/api/cards/ \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": 1,
    "front": "こんにちは",
    "back": "Hello",
    "tag_ids": [1]
  }'
```

### Search and Filter
```bash
# Search for "hello"
curl "http://localhost:8000/api/cards/?search=hello"

# Get cards from deck 1 with tag 2
curl "http://localhost:8000/api/cards/?deck_ids=1&tag_ids=2"

# Get suspended cards
curl "http://localhost:8000/api/cards/?suspended=true"

# Paginate results
curl "http://localhost:8000/api/cards/?page=1&page_size=20"
```

### Manage Cards
```bash
# Update card text
curl -X PUT http://localhost:8000/api/cards/1 \
  -H "Content-Type: application/json" \
  -d '{"back": "Hello (greeting)"}'

# Move card to different deck
curl -X PUT http://localhost:8000/api/cards/1 \
  -H "Content-Type: application/json" \
  -d '{"deck_id": 2}'

# Suspend card
curl -X PATCH "http://localhost:8000/api/cards/1/suspend?suspend=true"

# Delete card
curl -X DELETE http://localhost:8000/api/cards/1
```

## Response Formats

### Deck Response
```json
{
  "id": 1,
  "user_id": 1,
  "name": "JLPT N5 Vocabulary",
  "description": "Basic vocabulary",
  "new_per_day": 20,
  "review_per_day": 200,
  "card_count": 150,
  "due_count": 12,
  "new_count": 5,
  "created_at": "2025-01-26T10:00:00",
  "updated_at": "2025-01-26T10:00:00"
}
```

### Card Response
```json
{
  "id": 1,
  "user_id": 1,
  "deck_id": 1,
  "deck_name": "JLPT N5 Vocabulary",
  "front": "こんにちは",
  "back": "Hello",
  "notes": "Common greeting",
  "suspended": false,
  "tags": [
    {"id": 1, "name": "noun", "card_count": 50, "created_at": "..."}
  ],
  "state": "new",
  "due_at": "2025-01-26T10:00:00",
  "interval_days": 0.0,
  "created_at": "2025-01-26T10:00:00",
  "updated_at": "2025-01-26T10:00:00"
}
```

### Card List Response
```json
{
  "cards": [...],
  "total": 150,
  "page": 1,
  "page_size": 50,
  "has_more": true
}
```

### Tag Response
```json
{
  "id": 1,
  "user_id": 1,
  "name": "noun",
  "card_count": 50,
  "created_at": "2025-01-26T10:00:00"
}
```

### Error Response
```json
{
  "detail": "Deck 999 not found"
}
```

## Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success (no body)
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Testing

### Run All Tests
```bash
cd server
pytest tests/test_api_*.py -v
```

### Run Specific Tests
```bash
pytest tests/test_api_decks.py -v
pytest tests/test_api_cards.py -v
pytest tests/test_api_tags.py -v
```

### With Coverage
```bash
pytest tests/test_api_*.py --cov=app.api --cov-report=html
```

## Development

### Start Server
```bash
cd server
uvicorn app.main:app --reload
```

### Access Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Notes

- All timestamps are in UTC
- User ID is automatically set (default_user for POC)
- Cascade deletes: Deck → Cards → Sched States & Review Logs
- Tags are removed from cards when deleted (not cards themselves)
- Suspended cards are excluded from review queues
- Search is case-insensitive and searches front/back/notes
- Pagination defaults: page=1, page_size=50, max=200

### 🔍 Browse/Search (Phase 3)

#### Browse Cards with Advanced Filters
```bash
GET /api/browse/cards
  ?deck_id=1                 # Filter by specific deck
  &tag_ids=1,2               # Filter by tags (multiple)
  &state=new                 # Filter by state (new|learning|review)
  &suspended=true            # Filter by suspended status
  &search=hello              # Text search in front/back/notes
  &sort_by=due_at            # Sort field (created_at|due_at|front|state)
  &sort_desc=false           # Sort direction
  &page=1                    # Page number
  &page_size=50              # Items per page (max 200)
```

Response:
```json
{
  "items": [...],          // Array of CardResponse
  "total": 150,            // Total matching cards
  "page": 1,              // Current page
  "page_size": 50,        // Items per page
  "pages": 3              // Total pages
}
```

### 📊 Statistics (Phase 3)

#### Get Overview Statistics
```bash
GET /api/statistics/overview
  ?days=30                   # Time period (default: 30, max: 365)
```

Response:
```json
{
  "total_reviews": 450,
  "total_new_introduced": 60,
  "retention_rate": 85.5,        // (good + easy) / total * 100
  "cards_new": 40,
  "cards_learning": 25,
  "cards_review": 135,
  "today_reviews": 15,
  "today_new": 5,
  "period_days": 30
}
```

#### Get Daily Statistics
```bash
GET /api/statistics/daily
  ?days=7                    # Number of days (default: 30)
```

Response:
```json
[
  {
    "date": "2025-01-20",
    "reviews_done": 45,
    "new_introduced": 5,
    "again_count": 8,
    "good_count": 32,
    "easy_count": 5
  },
  ...
]
```

#### Get Heatmap Data
```bash
GET /api/statistics/heatmap
  ?year=2024                 # Year (default: current year)
```

Response:
```json
[
  {
    "date": "2024-01-15",
    "review_count": 42
  },
  ...
]
```

#### Get Per-Deck Statistics
```bash
GET /api/statistics/decks
```

Response:
```json
[
  {
    "deck_id": 1,
    "deck_name": "JLPT N5 Vocabulary",
    "total_cards": 150,
    "cards_new": 40,
    "cards_learning": 25,
    "cards_review": 85
  },
  ...
]
```

### ⚙️ Settings (Phase 3)

#### Get User Settings
```bash
GET /api/settings
```

Response:
```json
{
  "user_id": 1,
  "dark_mode": false,
  "music_enabled": false,
  "music_volume": 50,
  "learning_steps_minutes": [10, 1440],
  "graduating_interval_days": 1,
  "easy_interval_days": 4,
  "new_cards_per_day": 15,
  "reviews_per_day": 200,
  "timezone": "UTC"
}
```

#### Update User Settings
```bash
PUT /api/settings
Content-Type: application/json

{
  "dark_mode": true,              // optional
  "music_enabled": true,          // optional
  "music_volume": 75,             // optional (0-100)
  "learning_steps_minutes": [1, 10, 1440],  // optional
  "graduating_interval_days": 1,  // optional
  "easy_interval_days": 4,        // optional
  "new_cards_per_day": 20,        // optional
  "reviews_per_day": 150,         // optional
  "timezone": "America/New_York"  // optional
}
```

Note: Partial updates supported. Only send fields you want to change.

### 🎯 Review Session (Phase 2)

#### Get Queue Statistics
```bash
GET /api/review/stats
  ?deck_ids=1,2              # optional: filter by decks
```

Response:
```json
{
  "learning_count": 5,
  "review_count": 12,
  "new_count": 15,
  "total_due": 32,
  "today_new_done": 3,
  "today_reviews_done": 18,
  "new_limit": 15,
  "review_limit": 200
}
```

#### Start Review Session
```bash
POST /api/review/start
Content-Type: application/json

{
  "deck_ids": [1, 2]         // optional: specific decks
}
```

Response:
```json
{
  "session_id": "uuid",
  "cards_due": 32,
  "message": "Review session started"
}
```

#### Get Next Card
```bash
GET /api/review/next
  ?deck_ids=1,2              // optional
```

Response: CardResponse or `{"detail": "No cards due"}`

#### Submit Rating
```bash
POST /api/review/answer
Content-Type: application/json

{
  "card_id": 1,
  "rating": "good"           // "again" | "good" | "easy"
}
```

Response:
```json
{
  "card_id": 1,
  "rating": "good",
  "new_state": "learning",
  "new_due_at": "2025-01-26T11:00:00",
  "new_interval_days": 0.007,
  "message": "Rating recorded"
}
```

## Complete Example Workflows

### Phase 3: Browse and Filter Cards
```bash
# Find all new cards in deck 1
curl "http://localhost:8000/api/browse/cards?deck_id=1&state=new"

# Search for "hello" in suspended cards
curl "http://localhost:8000/api/browse/cards?search=hello&suspended=true"

# Get page 2 of cards, sorted by due date
curl "http://localhost:8000/api/browse/cards?page=2&page_size=20&sort_by=due_at"

# Cards with multiple tags
curl "http://localhost:8000/api/browse/cards?tag_ids=1,2,3"
```

### Phase 3: View Statistics
```bash
# Overview for last 7 days
curl "http://localhost:8000/api/statistics/overview?days=7"

# Daily breakdown for charts
curl "http://localhost:8000/api/statistics/daily?days=30"

# Heatmap for 2024
curl "http://localhost:8000/api/statistics/heatmap?year=2024"

# Check deck performance
curl "http://localhost:8000/api/statistics/decks"
```

### Phase 3: Manage Settings
```bash
# Enable dark mode
curl -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"dark_mode": true}'

# Configure music
curl -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"music_enabled": true, "music_volume": 65}'

# Adjust daily limits
curl -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"new_cards_per_day": 25, "reviews_per_day": 150}'

# Custom learning steps (1min, 10min, 1day)
curl -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"learning_steps_minutes": [1, 10, 1440]}'
```

### Phase 2: Complete Review Session
```bash
# 1. Check what's due
curl "http://localhost:8000/api/review/stats"

# 2. Start session
curl -X POST http://localhost:8000/api/review/start \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Get next card
curl "http://localhost:8000/api/review/next"

# 4. Submit rating
curl -X POST http://localhost:8000/api/review/answer \
  -H "Content-Type: application/json" \
  -d '{"card_id": 1, "rating": "good"}'

# 5. Repeat steps 3-4 until no cards left
```

## Requirements Mapping

### Phase 1 & 1.4
- **REQ-1 (Decks)**: All deck endpoints
- **REQ-2 (Cards)**: All card endpoints  
- **REQ-3 (Tags)**: All tag endpoints
- **REQ-7 (Suspend)**: PATCH /cards/{id}/suspend

### Phase 2
- **REQ-4 (SM-2 Scheduler)**: Implemented in services
- **REQ-5 (Review UI)**: Review session endpoints
- **REQ-6 (Daily Limits)**: Queue stats and limits

### Phase 3
- **REQ-8 (Browse/Search)**: GET /browse/cards with advanced filters
- **REQ-9 (Statistics)**: All /statistics endpoints
- **REQ-10 (Dark Mode)**: Settings API dark_mode field
- **REQ-11 (Music)**: Settings API music_enabled and music_volume
