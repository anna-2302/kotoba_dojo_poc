/**
 * Theme Utilities - Functions for theme management
 * Handles localStorage persistence, DOM updates, and backend sync
 */

import type { ThemeState, VisualTheme, ThemeMode } from './themeTypes';
import { DEFAULT_THEME } from './themeTypes';

// LocalStorage keys
const STORAGE_KEY_THEME = 'kd.theme';
const STORAGE_KEY_MODE = 'kd.mode';

/**
 * Get initial theme state from localStorage or system preference
 */
export function getInitialTheme(): ThemeState {
  try {
    // Try to read from localStorage
    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    const storedMode = localStorage.getItem(STORAGE_KEY_MODE);

    let theme: VisualTheme = DEFAULT_THEME.theme;
    let mode: ThemeMode = DEFAULT_THEME.mode;

    // Validate and use stored theme
    if (storedTheme === 'mizuiro' || storedTheme === 'sakura') {
      theme = storedTheme;
    }

    // Validate and use stored mode, or detect from system preference
    if (storedMode === 'day' || storedMode === 'night') {
      mode = storedMode;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      mode = prefersDark ? 'night' : 'day';
    }

    return { theme, mode };
  } catch (error) {
    console.error('Error reading theme from localStorage:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Apply theme and mode to DOM immediately
 * Updates data-theme, data-mode attributes and .dark class
 */
export function applyTheme(state: ThemeState): void {
  const { theme, mode } = state;
  
  // Set data-theme attribute
  document.documentElement.setAttribute('data-theme', theme);
  
  // Set data-mode attribute
  document.documentElement.setAttribute('data-mode', mode);
  
  // Set .dark class for compatibility with existing Tailwind dark: variants
  if (mode === 'night') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Persist theme state to localStorage
 */
export function persistTheme(state: ThemeState): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, state.theme);
    localStorage.setItem(STORAGE_KEY_MODE, state.mode);
  } catch (error) {
    console.error('Error persisting theme to localStorage:', error);
  }
}

/**
 * Sync theme state with backend (debounced in ThemeProvider)
 * Returns updated UserSettings from backend
 */
export async function syncWithBackend(
  state: ThemeState,
  settingsApi: {
    update: (data: { visual_theme?: string; theme_mode?: 'day' | 'night' }) => Promise<any>;
  }
): Promise<void> {
  try {
    await settingsApi.update({
      visual_theme: state.theme,
      theme_mode: state.mode,
    });
  } catch (error) {
    console.error('Error syncing theme with backend:', error);
    // Don't throw - theme should work even if backend sync fails
  }
}

/**
 * Reconcile localStorage with backend settings
 * localStorage wins initially (instant load), but backend is source of truth
 */
export function reconcileWithBackend(
  localState: ThemeState,
  backendSettings: { visual_theme?: string; theme_mode?: 'day' | 'night' }
): ThemeState {
  let theme: VisualTheme = localState.theme;
  let mode: ThemeMode = localState.mode;

  // Use backend values if valid
  if (backendSettings.visual_theme === 'mizuiro' || backendSettings.visual_theme === 'sakura') {
    theme = backendSettings.visual_theme;
  }

  if (backendSettings.theme_mode === 'day' || backendSettings.theme_mode === 'night') {
    mode = backendSettings.theme_mode;
  }

  return { theme, mode };
}

/**
 * Convert old dark_mode boolean to theme_mode for backward compatibility
 */
export function darkModeToThemeMode(darkMode: boolean): ThemeMode {
  return darkMode ? 'night' : 'day';
}

/**
 * Convert theme_mode to dark_mode boolean for backward compatibility
 */
export function themeModeToDarkMode(mode: ThemeMode): boolean {
  return mode === 'night';
}
