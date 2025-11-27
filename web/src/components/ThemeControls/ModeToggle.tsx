/**
 * ModeToggle - Separate Day/Night mode toggle component
 * Alternative to unified ThemeSelector for users who want independent controls
 */
import { useTheme } from '../ThemeProvider';

export function ModeToggle() {
  const { mode, setMode } = useTheme();
  const isNight = mode === 'night';

  const handleToggle = () => {
    setMode(isNight ? 'day' : 'night');
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95
                 focus:outline-none focus:ring-2"
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
      aria-label={`Switch to ${isNight ? 'day' : 'night'} mode`}
      title={`Current: ${mode} mode. Click to switch to ${isNight ? 'day' : 'night'} mode.`}
    >
      <span className="text-xl" role="img" aria-hidden="true">
        {isNight ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
