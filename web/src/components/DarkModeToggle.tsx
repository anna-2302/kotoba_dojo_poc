/**
 * Dark Mode Toggle Component
 * DEPRECATED: Use ModeToggle from ThemeControls instead for unified theme system
 * This component is maintained for backward compatibility only
 * 
 * Legacy wrapper around new unified theme system
 */
import React from 'react';
import { useTheme } from './ThemeProvider';

interface DarkModeToggleProps {
  // Legacy props maintained for backward compatibility
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
}

export function DarkModeToggle({ enabled: legacyEnabled, onChange: legacyOnChange }: DarkModeToggleProps) {
  const { mode, setMode } = useTheme();
  
  // Use legacy prop if provided, otherwise use unified theme state
  const enabled = legacyEnabled !== undefined ? legacyEnabled : mode === 'night';
  
  const handleToggle = () => {
    const newMode = enabled ? 'day' : 'night';
    
    // Call legacy onChange if provided (for backward compatibility)
    if (legacyOnChange) {
      legacyOnChange(!enabled);
    }
    
    // Update unified theme system
    setMode(newMode);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium" style={{ color: 'var(--kd-text-primary)' }}>
          Dark Mode
        </label>
        <p className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
          {enabled ? 'Night mode enabled' : 'Day mode enabled'}
        </p>
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: enabled ? 'var(--kd-primary)' : 'var(--kd-border)',
          outlineColor: 'var(--kd-focus-ring)',
        }}
      >
        <span className="sr-only">Toggle dark mode</span>
        <span
          className="pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out"
          style={{
            transform: enabled ? 'translateX(1.25rem)' : 'translateX(0)',
          }}
        >
          {/* Icon inside toggle */}
          <span className="flex items-center justify-center h-full text-xs">
            {enabled ? '🌙' : '☀️'}
          </span>
        </span>
      </button>
    </div>
  );
}

export default DarkModeToggle;
