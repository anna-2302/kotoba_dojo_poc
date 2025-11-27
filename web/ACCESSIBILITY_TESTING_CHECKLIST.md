# Accessibility Testing Checklist

## Pre-Test Setup
- [ ] Latest version deployed locally (http://localhost:5173)
- [ ] Backend running (http://localhost:8000)
- [ ] Test user with sample data available
- [ ] Browser DevTools open (F12)

---

## 1. Automated Testing (30 min)

### Lighthouse Audit
- [ ] Run Lighthouse in Chrome DevTools (Lighthouse tab)
- [ ] Select "Accessibility" category
- [ ] Run audit on:
  - [ ] Dashboard (/)
  - [ ] Review session (/review)
  - [ ] Browse page (/browse)
  - [ ] Settings (/settings)
- [ ] **Target score: 90+** (100 ideal)
- [ ] Screenshot results and save report

### axe DevTools Extension
- [ ] Install: https://www.deque.com/axe/devtools/
- [ ] Run scan on all pages
- [ ] Check for violations:
  - [ ] Color contrast
  - [ ] ARIA attributes
  - [ ] Keyboard accessibility
  - [ ] Form labels
- [ ] Export report (CSV or JSON)

### WAVE Extension
- [ ] Install: https://wave.webaim.org/extension/
- [ ] Run scan on all pages
- [ ] Check for:
  - [ ] Errors (red icons)
  - [ ] Contrast errors
  - [ ] Missing alt text
  - [ ] Structural issues
- [ ] Screenshot violations

---

## 2. Contrast Validation (15 min)

### Manual Spot Checks
Test each theme combination against tokens.css documented ratios:

#### Mizuiro Day
- [ ] Primary text (#1a2733) on surface (#f8fbfe): Expected 12.6:1 ✅
- [ ] Links (#2563a8) on surface: Expected 4.7:1 ✅
- [ ] Rating buttons visible and readable
- [ ] Focus rings clearly visible

#### Mizuiro Night
- [ ] Primary text (#e8f0f7) on surface (#151b21): Expected 13.2:1 ✅
- [ ] Links (#5a9fd8) on surface: Expected 5.2:1 ✅
- [ ] Rating buttons visible and readable
- [ ] Focus rings clearly visible

#### Sakura Day
- [ ] Primary text (#2d1a23) on surface (#fef9fb): Expected 13.5:1 ✅
- [ ] Links (#b8527d) on surface: Expected 4.9:1 ✅
- [ ] Rating buttons visible and readable
- [ ] Focus rings clearly visible

#### Sakura Night
- [ ] Primary text (#f5f0f2) on surface (#1f1a1d): Expected 13.8:1 ✅
- [ ] Links (#e89bb0) on surface: Expected 6.1:1 ✅
- [ ] Rating buttons visible and readable
- [ ] Focus rings clearly visible

### WebAIM Contrast Checker
- [ ] Use: https://webaim.org/resources/contrastchecker/
- [ ] Manually verify 2-3 critical color pairs per theme
- [ ] Document any failures

---

## 3. Keyboard Navigation (45 min)

### Dashboard Page
- [ ] Tab order logical (header → theme selector → start button)
- [ ] Focus rings visible on all interactive elements
- [ ] Enter activates Start Review button
- [ ] Can navigate to all pages via header links

### Review Session
- [ ] Space flips card (front → back)
- [ ] 1/2/3 rate card (Again/Good/Easy)
- [ ] Escape exits session
- [ ] Tab focuses rating buttons
- [ ] Enter activates focused button
- [ ] Keyboard shortcuts announced by screen reader (if available)

### Browse Page
- [ ] Tab through filters, search box, pagination
- [ ] Enter in search box triggers search
- [ ] Create button accessible via Tab
- [ ] Pagination Previous/Next work with Enter
- [ ] Focus visible on all interactive elements

### Settings Page
- [ ] Tab through all settings controls
- [ ] Arrow keys navigate theme selector dropdown
- [ ] Enter activates theme cards
- [ ] Save button accessible and functional

### Theme Selector
- [ ] Tab focuses dropdown
- [ ] Arrow up/down cycles options
- [ ] Enter applies selection
- [ ] Theme change announced to screen reader
- [ ] Focus ring visible in all themes

### Rating Buttons
- [ ] Tab cycles through Again → Good → Easy
- [ ] Shift+Tab cycles in reverse
- [ ] Enter activates focused button
- [ ] 1/2/3 shortcuts work even when not focused
- [ ] ARIA labels read correctly (test with screen reader)

---

## 4. Screen Reader Testing (60 min)

### Screen Readers to Test
- **Windows**: NVDA (free) or JAWS (trial)
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

### Test Scenarios

#### Theme Selection
- [ ] Screen reader announces current theme
- [ ] Announces available options when navigating dropdown
- [ ] Announces "Theme changed to [X]" after selection
- [ ] Emoji hidden from screen reader (aria-hidden="true")

#### Review Session
- [ ] Announces card front text
- [ ] Announces "Show Answer" button
- [ ] Announces card back text after flip
- [ ] Announces rating button labels with shortcuts
  - [ ] "Rate as Again - resets card progress (keyboard shortcut: 1)"
  - [ ] "Rate as Good - standard advancement (keyboard shortcut: 2)"
  - [ ] "Rate as Easy - skip ahead (keyboard shortcut: 3)"
- [ ] Announces keyboard shortcut number separately (aria-hidden="true")
- [ ] Announces session progress (X/Y cards)

#### Browse Page
- [ ] Announces page heading
- [ ] Announces filter controls and current values
- [ ] Announces card list structure
- [ ] Announces pagination state ("Page 1 of 5")

#### Settings Page
- [ ] Announces section headings
- [ ] Announces theme cards with descriptions
- [ ] Announces current theme indicator ("Current")
- [ ] Announces toggle states (on/off)

---

## 5. Focus Ring Visibility (15 min)

### Visual Check
For each theme combination:
- [ ] Tab through entire page
- [ ] Verify focus ring visible on:
  - [ ] Buttons
  - [ ] Links
  - [ ] Form inputs
  - [ ] Dropdowns (ThemeSelector)
  - [ ] Theme cards
  - [ ] Pagination controls

### Focus Ring Properties
- [ ] Outline: 2px solid
- [ ] Color: `--kd-focus-ring` token (semi-transparent theme color)
- [ ] Offset: 2px from element border
- [ ] No overlap with content
- [ ] Visible against all background colors

---

## 6. Reduced Motion (10 min)

### Enable Reduced Motion
**Windows**:
1. Settings → Accessibility → Visual effects
2. Turn off "Show animations in Windows"

**macOS**:
1. System Preferences → Accessibility → Display
2. Check "Reduce motion"

**Browser Override** (Firefox):
1. about:config
2. Set `ui.prefersReducedMotion` to 1

### Verify Behavior
- [ ] Theme switches instantly (no fade transition)
- [ ] Button hover effects disabled (no opacity change)
- [ ] Card flip animation disabled
- [ ] Page transitions instant
- [ ] No smooth scrolling

### CSS Media Query
- [ ] Verify tokens.css contains `@media (prefers-reduced-motion: reduce)`
- [ ] Verify `--kd-transition-*` set to 0ms
- [ ] Verify `animation-duration` overridden to 0.01ms

---

## 7. Touch Target Size (10 min)

### Minimum Size: 44x44px (WCAG 2.1 Level AA)

Measure in browser DevTools (hover element, check Computed styles):

- [ ] Rating buttons: `px-6 py-3` → ~48px height ✅
- [ ] Theme selector: `px-4 py-2` → ~44px height ✅
- [ ] Mode toggle: `p-2` with emoji → ~44px both dimensions ✅
- [ ] Pagination buttons: Check computed height
- [ ] Start Review button: Check computed height
- [ ] Create Card button: Check computed height

---

## 8. Color Blindness Simulation (15 min)

### Tools
- **Color Oracle** (free simulator): https://colororacle.org/
- **Browser DevTools**: Chrome → Rendering → Emulate vision deficiencies

### Test Cases
For each deficiency type:
- [ ] **Deuteranopia** (red-green, most common)
- [ ] **Protanopia** (red-green)
- [ ] **Tritanopia** (blue-yellow)

### Verify:
- [ ] Rating buttons distinguishable (Again/Good/Easy)
  - Text labels visible ("Again", "Good", "Easy")
  - Keyboard shortcuts visible ("1", "2", "3")
  - Not relying on color alone
- [ ] Theme selector options distinguishable
- [ ] Links distinguishable from body text
- [ ] Success/warning/danger states have text/icons, not just color

---

## 9. Browser Compatibility (30 min)

### Browsers to Test
- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (macOS/iOS if available)
- [ ] **Edge** (latest)

### Per Browser:
- [ ] CSS variables render correctly
- [ ] Focus rings visible
- [ ] Theme switching instant
- [ ] Keyboard shortcuts work
- [ ] ARIA announcements work (test with browser's screen reader)

---

## 10. High Contrast Mode (10 min)

### Windows High Contrast
1. Settings → Accessibility → Contrast themes
2. Select "Aquatic" or "Desert"
3. Verify app still usable

### Forced Colors Mode (CSS)
- [ ] Check if app respects `prefers-contrast: high`
- [ ] Verify focus rings remain visible
- [ ] Verify interactive elements distinguishable

---

## 11. Zoom and Magnification (15 min)

### Browser Zoom
- [ ] 100% (baseline)
- [ ] 200% (WCAG requirement)
- [ ] 400% (extreme case)

### Verify:
- [ ] No horizontal scrolling at 200%
- [ ] Text remains readable
- [ ] Buttons remain clickable
- [ ] Layout doesn't break
- [ ] Focus rings still visible

### Text-Only Zoom (Firefox)
- [ ] View → Zoom → Zoom Text Only
- [ ] Set to 200%
- [ ] Verify text doesn't overflow containers

---

## 12. Mobile Keyboard (10 min, if mobile testing available)

### Mobile Browser (Chrome/Safari on phone)
- [ ] External keyboard connects
- [ ] Tab navigation works
- [ ] Focus rings visible on mobile screen
- [ ] Keyboard shortcuts work (Space, 1/2/3, Esc)

---

## Test Results Summary

### Pass Criteria
- ✅ Lighthouse Accessibility score: 90+
- ✅ axe DevTools: 0 critical violations
- ✅ All contrast ratios meet WCAG AA (4.5:1 text, 3.0:1 UI)
- ✅ Keyboard navigation 100% functional (no mouse required)
- ✅ Screen reader announces all interactive elements correctly
- ✅ Focus rings visible in all themes
- ✅ Reduced motion respected
- ✅ Touch targets ≥ 44x44px
- ✅ No critical color blindness issues

### Issues Found
*(Document issues here with severity: Critical/High/Medium/Low)*

| Issue | Severity | Page | Description | Status |
|-------|----------|------|-------------|--------|
| | | | | |

### Recommendations
*(List improvements based on test results)*

1. 
2. 
3. 

---

## Sign-Off

- **Tester Name**: ___________________________
- **Date**: ___________________________
- **Overall Status**: ⬜ Pass / ⬜ Conditional Pass / ⬜ Fail
- **Notes**: 

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Kotoba Dojo Accessibility Report](./ACCESSIBILITY_REPORT.md)
- [Kotoba Dojo Keyboard Shortcuts](./KEYBOARD_SHORTCUTS.md)
