# Quick Start - Dashboard Stats

## What Was Fixed
- ✅ Dashboard now shows real daily statistics (not mock data)
- ✅ Removed "💪 Start your daily practice!" message from Quick Stats
- ✅ Stats update in real-time as you review cards
- ✅ Browse page "Add Card" button works correctly

## How to Test

### 1. Start the Backend
```bash
test_stats.bat
```
Or manually:
```bash
venv\Scripts\activate
python -m uvicorn server.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
```bash
cd web
npm run dev
```

### 3. Test the Dashboard
1. Go to http://localhost:5173
2. Check Quick Stats section:
   - Should show 0 reviewed, 0% retention, 0 day streak initially
   - Should NOT show "Start your daily practice!" message
3. Click "Start Review" and review some cards
4. Return to dashboard
5. Verify stats updated with your reviews

### 4. Test Browse Page
1. Go to http://localhost:5173/browse
2. Click "Create Card" button (top right, blue button with ➕)
3. Should navigate to Cards page with create form open
4. Button style matches the Cards page "Add Card" button

## API Endpoints

### Today's Stats
```
GET /api/stats/today
```
Returns:
```json
{
  "reviewed_today": 0,
  "new_cards_today": 0,
  "retention_rate": 0.0,
  "study_streak": 0,
  "total_reviews": 0
}
```

### Queue Stats (existing)
```
GET /api/review/stats
```
Returns:
```json
{
  "learning_due": 0,
  "reviews_due": 0,
  "new_available": 10,
  "total_due": 0
}
```

## What Changed

### Backend
- NEW: `server/app/api/stats.py` - Stats API endpoint
- MODIFIED: `server/app/main.py` - Added stats router

### Frontend  
- MODIFIED: `web/src/api/types.ts` - Added TodayStats interface
- MODIFIED: `web/src/api/client.ts` - Added statsApi.getToday()
- MODIFIED: `web/src/pages/DashboardPage.tsx` - Fetch real stats
- MODIFIED: `web/src/components/QuickStatsCard.tsx` - Removed "start practice" message

## Troubleshooting

**Stats not updating:**
- Refresh the page (stats refetch every 60 seconds automatically)
- Check browser console for API errors
- Verify backend is running on port 8000

**"Start practice" message still showing:**
- Clear browser cache
- Hard reload (Ctrl+Shift+R)
- Check that QuickStatsCard.tsx changes were saved

**API errors:**
- Run `test_stats_api.py` to verify backend endpoints
- Check that database is initialized
- Verify default_user exists in database

## Technical Details

The stats are calculated from the `ReviewLog` table:
- Counts reviews with `reviewed_at` timestamp from today (00:00 to 23:59 local time)
- Retention rate = (Good + Easy reviews) / Total reviews * 100
- Study streak = Consecutive days with at least one review
- New cards = Cards that transitioned from 'new' to 'learning' today

Stats are cached for 30 seconds on the frontend (staleTime) and refetched every 60 seconds (refetchInterval).
