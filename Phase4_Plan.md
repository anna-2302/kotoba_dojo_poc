Phase 4 Implementation Plan: Enhanced Review Session Logic
Based on the Phase 4 PRD requirements, I've created a comprehensive implementation plan to transform the current single-card queue system into an Anki-like fixed queue with three sections (New → Learning → Review) and proper "Again" repeat handling.

Overview of Changes
The implementation will transform the current review system from:

Current: Single card-by-card queue with immediate next card selection
Phase 4: Fixed three-section queue (New → Learning → Review) built at session start with round-robin deck allocation and in-session "Again" repeats
Key Implementation Tasks
Backend Changes (Tasks 1-4)
Queue Builder Redesign: Refactor queue_builder.py to build structured sections instead of a flat list, implementing round-robin allocation across decks for fairness.

Enhanced Session API: Create new POST /api/v1/session/build endpoint that returns the complete fixed queue with metadata about limits applied and deck distribution.

Scheduler Updates: Modify scheduler.py to handle the new graduation paths - New cards skip Learning and go directly to Review, while maintaining legacy Learning card support.

Per-Deck Counter Tracking: Enhance DailyCounter to track limits per deck for proper cap enforcement in "All Decks" sessions.

Frontend Changes (Tasks 5-8)
Session State Management: Create new session state structure to manage three sections with repeat buffers and section navigation.

"Again" Repeat Logic: Implement client-side N=3 reinsertion logic that keeps cards in their current section until rated Good/Easy.

UI Component Updates: Modify ReviewPage.tsx to show section-based progress and handle the structured queue navigation.

Session Start Options: Add UI options for "All Decks" vs "Specific Deck" sessions with clear limit indicators.

Quality Assurance (Tasks 9-10)
Stats Accuracy: Ensure only final ratings count toward daily stats while all ratings update scheduler state immediately.

Comprehensive Testing: Add unit tests for allocation algorithms, integration tests for session flow, and E2E tests for complete user journeys.

Critical Design Decisions
Session Types
All Decks: Uses global limits (New=12, Review=150) with per-deck caps as maxima, round-robin distribution
Specific Deck: Uses only that deck's limits, ignoring global limits
Queue Structure
Fixed at Start: Queue built once at session start, never rebuilt during session
Section Order: New → Learning → Review (strict ordering)
Within-Deck: Randomized selection within each deck's pool
"Again" Handling
N=3 Rule: Reinsert after 3 cards of same type within current section
End-of-Section Loop: If <3 cards remain, append to section end
No Cross-Section: "Again" cards stay in their original section
Graduation Changes
New Cards: Skip Learning state, graduate directly to Review with 1-day interval
Learning Cards: Legacy cards only, no new Learning states created
Review Cards: Standard SM-2 intervals with Again causing lapses
Implementation Priority
I recommend starting with Task 1 (Backend Queue Builder) as it's the foundation for all other changes. The round-robin allocation algorithm needs to be solid before building the API and frontend components that depend on it.