Phase 3 Implementation Plan: Mizuiro Calm & Sakura Serenity (Day & Night Modes)
Based on the PRD Phase 3 requirements and current codebase analysis, here's the detailed implementation plan:

📊 Current State Analysis
Already Implemented:

✅ Basic theme infrastructure with ThemeProvider (dark mode + visual theme support)
✅ Token-based CSS system in tokens.css with Mizuiro and Sakura themes
✅ Backend UserSettings model with dark_mode and visual_theme fields
✅ localStorage persistence for instant theme application
✅ Tailwind v4 integration with theme-aware color mappings
Gap Analysis:

❌ Current system treats dark mode as separate from theme (needs unification into Day/Night modes)
❌ No unified theme/mode selector UI (currently separate controls)
❌ Missing backend sync for combined theme+mode state
❌ Tokens need refinement to match PRD's exact Day/Night specifications
❌ No pre-hydration script to prevent FOUC with combined theme+mode
❌ Missing comprehensive component coverage verification
🎯 Implementation Strategy
Phase 3 will refactor the existing two-axis system (theme + dark mode) into a unified four-state system:

Mizuiro Day
Mizuiro Night
Sakura Day
Sakura Night
📋 Implementation Tasks
Task 1: Backend - Update Settings Model & API
Priority: High | Effort: 2-3 hours

1.1 Database Migration

Create Alembic migration to add theme_mode field
Migration should:
Add theme_mode ENUM column ('day', 'night') with default 'day'
Migrate existing dark_mode boolean to theme_mode (true → 'night', false → 'day')
Optionally deprecate dark_mode column (or keep for backward compatibility during transition)
Update updated_at timestamp trigger
Files to modify:

alembic/versions/00X_add_theme_mode.py (new migration file)
database.py - Add theme_mode field to UserSettings
1.2 Update Settings Schema

Extend Pydantic schemas to include theme_mode
Ensure validation (must be 'day' or 'night')
Maintain backward compatibility with dark_mode field during transition
Files to modify:

schemas.py - Update UserSettingsResponse and UserSettingsUpdate
1.3 Update Settings API Endpoint

Modify GET/PUT /api/v1/settings to handle theme_mode
Add logic to sync dark_mode ↔ theme_mode for backward compatibility
Return both visual_theme and theme_mode in responses
Files to modify:

settings.py
Test coverage:

Add tests for theme_mode field validation
Test backward compatibility (setting dark_mode updates theme_mode)
Test GET/PUT roundtrip with new fields
Task 2: Frontend - Refactor Theme System Architecture
Priority: High | Effort: 4-5 hours

2.1 Update ThemeProvider Context

Refactor to use unified theme and mode state instead of separate darkMode + visualTheme
Add reconciliation logic: read localStorage → apply instantly → fetch backend → sync
Implement debounced backend persistence (200ms delay)
Add TypeScript types for theme combinations
Files to modify:

ThemeProvider.tsx
Create web/src/theme/themeTypes.ts with enums:
2.2 Create Theme Utility Functions

Extract theme logic into reusable utilities
Functions: getInitialTheme(), applyTheme(), persistTheme(), syncWithBackend()
Files to create:

web/src/theme/themeUtils.ts
2.3 Add Pre-Hydration Script

Inline script in index.html to read localStorage and set data attributes before React mounts
Prevents FOUC (Flash of Unstyled Content)
Files to modify:

index.html - Add inline <script> in <head> before app bundle
2.4 Update API Client

Add theme_mode field to settings types
Ensure GET/PUT handle new field structure
Files to modify:

types.ts - Update UserSettings interface
client.ts - No changes needed (generic PUT/GET already handles new fields)
Task 3: CSS Tokens - Refine Day/Night Palettes
Priority: Medium | Effort: 3-4 hours

3.1 Update Token Structure

Refactor tokens.css to use data-theme AND data-mode attributes
Current: [data-theme="mizuiro"] + .dark
New structure:
[data-theme="mizuiro"][data-mode="day"] - Mizuiro Day
[data-theme="mizuiro"][data-mode="night"] - Mizuiro Night
[data-theme="sakura"][data-mode="day"] - Sakura Day
[data-theme="sakura"][data-mode="night"] - Sakura Night
3.2 Match PRD Exact Colors

Cross-reference PRD lines 1406-1536 for exact hex values
Update token values to match specifications
Validate WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
Files to modify:

tokens.css
3.3 Add Missing Semantic Tokens

Ensure all required tokens from PRD exist:
--kd-bg, --kd-surface, --kd-surface-2, --kd-surface-3
--kd-text-primary, --kd-text-secondary, --kd-text-muted, --kd-text-inverse
--kd-primary, --kd-primary-contrast
--kd-accent, --kd-accent-contrast
--kd-border, --kd-divider
--kd-success, --kd-warning, --kd-danger, --kd-link, --kd-link-hover
--kd-hover, --kd-active, --kd-disabled, --kd-focus-ring, --kd-selection
--kd-shadow-color, --kd-shadow-elevation-1/2
3.4 Update Tailwind Config

Ensure Tailwind v4 @theme block maps to updated token structure
Verify utility classes (e.g., bg-kd-surface, text-kd-primary) work with all four theme combinations
Files to modify:

index.css - Update @theme block if needed
Task 4: UI Components - Theme Controls
Priority: High | Effort: 3-4 hours

4.1 Create Unified Theme Selector Component

Dropdown or segmented control showing both theme and mode
Options: "Mizuiro Day", "Mizuiro Night", "Sakura Day", "Sakura Night"
OR: Two separate controls side-by-side (Theme dropdown + Day/Night toggle)
Include visual preview icons/colors
Keyboard accessible (arrow keys, Enter)
Files to create:

web/src/components/ThemeControls/ThemeSelector.tsx
web/src/components/ThemeControls/ModeToggle.tsx (if using separate controls)
4.2 Update AppHeader

Add theme controls to header navigation
Show current theme/mode in tooltip
Ensure controls are visible but not obtrusive
Files to modify:

AppHeader.tsx
4.3 Update Settings Page

Add dedicated theme section with descriptions
Include visual previews of each theme/mode combination
Show sample components (button, card, tag) in each theme
Files to modify:

SettingsPage.tsx
4.4 Deprecate Old Controls (if needed)

Remove or update existing DarkModeToggle component to use new system
Ensure backward compatibility during transition
Files to check:

DarkModeToggle.tsx
Task 5: Component Audit - Verify Token Coverage
Priority: Medium | Effort: 2-3 hours

5.1 Audit All Components

Verify every component uses tokens instead of hard-coded colors
Check all four theme/mode combinations render correctly
Verify hover/focus/active/disabled states
Components to audit:

AppHeader, AmbientAudioPlayer, ThemeProvider
All pages: DashboardPage, ReviewPage, BrowsePage, CardsPage, StatsPage, SettingsPage, WelcomePage
Review answer buttons (Again/Good/Easy colors)
Tag chips
Card surfaces
Input fields, buttons, lists, dialogs, toasts
5.2 Fix Hardcoded Colors

Replace any remaining hex values with token references
Use Tailwind utilities that map to tokens
5.3 Test Interaction States

Hover: should deepen colors slightly, raise shadow
Active/pressed: compress shadow, reduce brightness
Focus: clear focus ring using --kd-focus-ring
Disabled: reduced contrast with --kd-text-muted
Task 6: Accessibility & Contrast Validation
Priority: High | Effort: 2-3 hours

6.1 Automated Contrast Checks

Use tools (axe DevTools, Lighthouse, WebAIM) to verify WCAG AA compliance
Check all text/background combinations in all four themes
Verify focus ring visibility on all interactive elements
6.2 Manual Testing

Test keyboard navigation (Tab, Shift+Tab, Arrow keys, Enter, Space)
Verify screen reader announcements (ARIA labels on theme controls)
Test with reduced motion preference enabled (animations disabled)
6.3 Fix Contrast Issues

If any combination fails AA (4.5:1), adjust token hex values
Create -contrast-strong variants for edge cases (e.g., text on accent backgrounds)
Test checklist:

✅ Text on surface backgrounds (primary, secondary, subtle)
✅ Buttons (all states: default, hover, active, disabled, focus)
✅ Links (default, hover)
✅ Review answer buttons (Again/Good/Easy)
✅ Tag chips (selected vs unselected)
✅ Input fields (placeholder text, focus ring)
✅ Focus rings visible in all themes
Task 7: Testing & QA
Priority: High | Effort: 3-4 hours

7.1 Unit Tests

Test themeUtils.ts functions (getInitialTheme, applyTheme, persistTheme)
Test ThemeProvider state transitions
Test localStorage read/write
Test backend reconciliation logic
Files to create:

web/src/theme/__tests__/themeUtils.test.ts
web/src/components/__tests__/ThemeProvider.test.tsx
7.2 Integration Tests

Test settings API with new theme_mode field
Test GET/PUT roundtrip
Test backward compatibility with dark_mode
Files to modify:

test_api_settings.py
7.3 E2E Tests (Manual or Playwright)

Theme selector changes all components instantly
No FOUC on page reload
Theme persists across sessions
Settings page shows correct theme/mode
Keyboard shortcuts work (if implemented)
Test scenarios:

Fresh user → defaults to Mizuiro Day
Select Sakura Night → reload → still Sakura Night
Toggle between all four combinations → visual consistency
Change theme in Settings → reflects in header immediately
Open in multiple tabs → theme syncs via backend
7.4 Browser Compatibility

Test on Chrome, Firefox, Safari (macOS + Windows)
Verify CSS variable support (all modern browsers)
Test on different screen sizes (desktop focus for POC)
Task 8: Documentation & Polish
Priority: Low | Effort: 1-2 hours

8.1 Update Documentation

Document new theme system architecture
Update copilot-instructions.md with new patterns
Add comments in code explaining theme/mode relationship
Files to modify:

copilot-instructions.md - Update "Frontend Structure" and "Common Pitfalls" sections
README.md - Add theme usage guide
8.2 Add Developer Guide

Document how to add new themes (if future expansion needed)
Document token naming conventions
Add examples of using tokens in components
Files to create:

web/THEMING_GUIDE.md (optional)
8.3 Performance Optimization

Ensure theme switches are instant (<16ms paint)
Verify no layout shifts during theme changes
Check bundle size impact (should be minimal, CSS-only)

🎯 Success Criteria (from PRD)
✅ Users can switch between Mizuiro/Sakura and Day/Night independently
✅ Entire app color scheme updates instantly and consistently
✅ Theme/mode preferences persist without FOUC
✅ Text/interactive elements meet WCAG AA in all themes
✅ Review performance remains unaffected (<16ms theme switch)
✅ No layout shifts or jank during theme changes
📝 Notes for Implementation
Backward Compatibility: Keep dark_mode field in API during transition, map to/from theme_mode automatically
localStorage keys: Use kd.theme (mizuiro/sakura) and kd.mode (day/night) instead of old darkMode and visualTheme
Default behavior: Mizuiro Day on first run, unless system prefers-color-scheme: dark detected → then Mizuiro Night
Atomic updates: When changing theme or mode, update both data-theme and data-mode attributes + .dark class simultaneously
Debounced backend sync: Wait 200ms after user stops toggling before PUT to /api/v1/settings