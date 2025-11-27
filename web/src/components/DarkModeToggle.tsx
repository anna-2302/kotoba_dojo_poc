/**
 * Dark Mode Toggle Component
 * Simple toggle switch for dark/light mode
 */
import React from 'react';

interface DarkModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function DarkModeToggle({ enabled, onChange }: DarkModeToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white block">
          Dark Mode
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {enabled ? 'Dark theme enabled' : 'Light theme enabled'}
        </p>
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
        `}
      >
        <span className="sr-only">Toggle dark mode</span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
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
