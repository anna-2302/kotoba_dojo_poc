# Keyboard Shortcuts - Kotoba Dojo

## Global Shortcuts

### Audio Controls
| Shortcut | Action | Context |
|----------|--------|---------|
| `Shift+P` | Play/Pause background music | Any page (PRD documented) |
| `Shift+M` | Mute/Unmute background music | Any page (PRD documented) |

*Note: Audio shortcuts are documented in PRD but implementation status TBD*

---

## Review Session Shortcuts

### Card Navigation
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Space` | Flip card | Show answer (front → back) |
| `Escape` | End session | Exit review session and return to dashboard |

### Rating Shortcuts
| Shortcut | Action | SM-2 Effect |
|----------|--------|-------------|
| `1` | Rate "Again" | **Reset progress** - Returns card to learning state, resets step index |
| `2` | Rate "Good" | **Standard advancement** - Progress according to SM-2 algorithm |
| `3` | Rate "Easy" | **Skip ahead** - Graduates immediately or extends interval significantly |

**Mnemonic**: Lower numbers = harder, higher numbers = easier

---

## Browse/Search Shortcuts (Planned)

### List Navigation
| Shortcut | Action | Status |
|----------|--------|--------|
| `J` | Move selection down | 📋 PRD documented, implementation TBD |
| `K` | Move selection up | 📋 PRD documented, implementation TBD |
| `Enter` | Open edit modal | 📋 PRD documented, implementation TBD |
| `S` | Toggle suspend | 📋 PRD documented, implementation TBD |

*Reference: PRD.MD lines 146-148*

---

## General Navigation

### Focus Management
| Shortcut | Action |
|----------|--------|
| `Tab` | Move focus forward |
| `Shift+Tab` | Move focus backward |
| `Enter` | Activate focused button/link |
| `Arrow Keys` | Navigate dropdown options (e.g., ThemeSelector) |

### Accessibility
- All interactive elements support keyboard focus with visible focus rings
- Focus rings use `--kd-focus-ring` token (2px solid outline, 2px offset)
- Focus visible in all four theme combinations (Mizuiro/Sakura, Day/Night)

---

## Component-Specific Shortcuts

### Theme Selector
- **Arrow Up/Down**: Cycle through theme options in dropdown
- **Enter**: Apply selected theme
- **Escape**: Close dropdown without changing theme

### Rating Buttons (Review Session)
- **1**: Again (red button, left)
- **2**: Good (blue button, center)
- **3**: Easy (green button, right)
- **Tab**: Focus buttons sequentially
- **Shift+Tab**: Focus buttons in reverse

### Pagination (Browse View)
- **Tab**: Focus Previous/Next buttons
- **Enter**: Navigate to previous/next page

---

## Screen Reader Support

### Announced Events
- **Theme change**: "Theme changed to [Sakura Night/Mizuiro Day/etc.]"
- **Card rating**: "Card rated as [Again/Good/Easy]" (future enhancement)
- **Queue updates**: "[X] cards remaining in today's queue" (future enhancement)

### ARIA Labels
- **Rating buttons**: Include keyboard shortcut hints
  - "Rate as Again - resets card progress (keyboard shortcut: 1)"
  - "Rate as Good - standard advancement (keyboard shortcut: 2)"
  - "Rate as Easy - skip ahead (keyboard shortcut: 3)"
- **Theme selector**: "Select theme and mode"
- **Mode toggle**: "Switch to [day/night] mode"

---

## Tips for Efficient Review Sessions

1. **Keep hands on keyboard**: Use `Space` to flip, `1/2/3` to rate, `Esc` to exit
2. **Don't overthink ratings**:
   - `1 (Again)`: Struggled or forgot completely
   - `2 (Good)`: Remembered with reasonable effort
   - `3 (Easy)`: Instant recall, no hesitation
3. **Tab through UI**: All controls accessible without mouse
4. **Visual feedback**: Focus rings clearly indicate current element

---

## Accessibility Features

### WCAG AA Compliance
✅ All text meets 4.5:1 contrast ratio  
✅ Interactive elements meet 3.0:1 contrast ratio  
✅ Focus indicators visible in all themes  
✅ Touch targets minimum 44x44px  
✅ Reduced motion support via `prefers-reduced-motion`

### Keyboard-First Design
- Primary review workflow fully keyboard-accessible
- No mouse required for core functionality
- Clear focus states with accessible colors
- Logical tab order throughout application

---

## Future Enhancements (Post-POC)

- [ ] Customizable keyboard shortcuts via Settings
- [ ] Vim-style navigation (hjkl) for Browse view
- [ ] Quick tag filtering shortcuts (1-9 for tag presets)
- [ ] Global search shortcut (Ctrl/Cmd+K)
- [ ] Undo last rating (Ctrl/Cmd+Z)
- [ ] Skip to next new card (N key)
- [ ] Show statistics overlay (Shift+S)

---

## Report Issues

If you encounter keyboard navigation issues:
1. Check browser console for errors
2. Verify focus ring visibility in your theme
3. Test with default browser settings (no extensions)
4. Confirm operating system accessibility settings

**Accessibility is a priority** - please report any keyboard navigation or screen reader issues.
