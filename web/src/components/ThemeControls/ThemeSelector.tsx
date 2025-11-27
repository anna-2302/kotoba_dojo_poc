/**
 * ThemeSelector - Unified theme and mode selector component
 * Allows selection of all four theme combinations:
 * - Mizuiro Day/Night
 * - Sakura Day/Night
 */
import { useTheme } from '../ThemeProvider';
import { useAriaAnnounce } from '../AriaAnnouncer';
import type { VisualTheme, ThemeMode } from '../../theme/themeTypes';

interface ThemeOption {
  theme: VisualTheme;
  mode: ThemeMode;
  label: string;
  emoji: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    theme: 'mizuiro',
    mode: 'day',
    label: 'Mizuiro Day',
    emoji: '🌊☀️',
    description: 'Cool blues with light background',
  },
  {
    theme: 'mizuiro',
    mode: 'night',
    label: 'Mizuiro Night',
    emoji: '🌊🌙',
    description: 'Cool blues with dark background',
  },
  {
    theme: 'sakura',
    mode: 'day',
    label: 'Sakura Day',
    emoji: '🌸☀️',
    description: 'Soft pinks with light background',
  },
  {
    theme: 'sakura',
    mode: 'night',
    label: 'Sakura Night',
    emoji: '🌸🌙',
    description: 'Soft pinks with dark background',
  },
];

export function ThemeSelector() {
  const { theme, mode, setTheme, setMode } = useTheme();
  const announce = useAriaAnnounce();

  const currentValue = `${theme}-${mode}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [newTheme, newMode] = value.split('-') as [VisualTheme, ThemeMode];
    
    // Find the option for announcement
    const selectedOption = THEME_OPTIONS.find(
      opt => opt.theme === newTheme && opt.mode === newMode
    );
    
    // Update theme and mode atomically
    if (newTheme !== theme) {
      setTheme(newTheme);
    }
    if (newMode !== mode) {
      setMode(newMode);
    }
    
    // Announce to screen readers
    if (selectedOption) {
      announce(`Theme changed to ${selectedOption.label}`);
    }
  };

  return (
    <div className="relative">
      <select
        value={currentValue}
        onChange={handleChange}
        className="px-4 py-2 pr-8 rounded-lg font-medium cursor-pointer transition-all duration-200
                   appearance-none focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--kd-surface)',
          color: 'var(--kd-text-primary)',
          border: '1px solid var(--kd-border)',
          boxShadow: 'var(--kd-shadow-sm)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-label="Select theme and mode"
      >
        {THEME_OPTIONS.map((option) => (
          <option key={`${option.theme}-${option.mode}`} value={`${option.theme}-${option.mode}`}>
            {option.emoji} {option.label}
          </option>
        ))}
      </select>
      
      {/* Dropdown arrow icon */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--kd-text-secondary)' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
