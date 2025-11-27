/**
 * Theme Context - Unified Theme System (Phase 3)
 * Implements REQ-10 (Dark Mode) and Phase 3 Visual Themes
 * Supports four theme combinations: Mizuiro Day/Night, Sakura Day/Night
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ThemeState, VisualTheme, ThemeMode } from '../theme/themeTypes';
import {
  getInitialTheme,
  applyTheme,
  persistTheme,
  syncWithBackend,
  reconcileWithBackend,
  darkModeToThemeMode,
} from '../theme/themeUtils';
import { settingsApi } from '../api/client';

interface ThemeContextType {
  // New unified API
  theme: VisualTheme;
  mode: ThemeMode;
  setTheme: (theme: VisualTheme) => void;
  setMode: (mode: ThemeMode) => void;
  setThemeState: (state: ThemeState) => void;
  
  // Legacy API for backward compatibility
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  visualTheme: VisualTheme;
  setVisualTheme: (theme: VisualTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEBOUNCE_DELAY_MS = 200;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme state from localStorage instantly
  const [themeState, setThemeStateInternal] = useState<ThemeState>(() => {
    const initial = getInitialTheme();
    // Apply immediately to prevent FOUC (though pre-hydration script should handle this)
    applyTheme(initial);
    return initial;
  });

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initializedRef = useRef(false);

  // Fetch backend settings and reconcile (runs once on mount)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const reconcile = async () => {
      try {
        const settings = await settingsApi.get();
        
        // Reconcile localStorage with backend (backend is source of truth)
        const reconciledState = reconcileWithBackend(themeState, settings);

        // If backend has different values, update local state
        if (
          reconciledState.theme !== themeState.theme ||
          reconciledState.mode !== themeState.mode
        ) {
          setThemeStateInternal(reconciledState);
          applyTheme(reconciledState);
          persistTheme(reconciledState);
        }
      } catch (error) {
        console.error('Failed to fetch backend settings for theme reconciliation:', error);
        // Continue with localStorage values if backend fetch fails
      }
    };

    reconcile();
  }, []); // Empty deps - run once on mount

  // Apply theme changes to DOM and persist
  useEffect(() => {
    applyTheme(themeState);
    persistTheme(themeState);

    // Debounced backend sync (200ms after user stops toggling)
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncWithBackend(themeState, settingsApi);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [themeState]);

  // New unified API
  const setTheme = useCallback((theme: VisualTheme) => {
    setThemeStateInternal((prev) => ({ ...prev, theme }));
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setThemeStateInternal((prev) => ({ ...prev, mode }));
  }, []);

  const setThemeState = useCallback((state: ThemeState) => {
    setThemeStateInternal(state);
  }, []);

  // Legacy API for backward compatibility
  const darkMode = themeState.mode === 'night';
  
  const toggleDarkMode = useCallback(() => {
    setThemeStateInternal((prev) => ({
      ...prev,
      mode: prev.mode === 'day' ? 'night' : 'day',
    }));
  }, []);

  const setDarkMode = useCallback((enabled: boolean) => {
    setThemeStateInternal((prev) => ({
      ...prev,
      mode: darkModeToThemeMode(enabled),
    }));
  }, []);

  const visualTheme = themeState.theme;

  const setVisualTheme = useCallback((theme: VisualTheme) => {
    setThemeStateInternal((prev) => ({ ...prev, theme }));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        // New unified API
        theme: themeState.theme,
        mode: themeState.mode,
        setTheme,
        setMode,
        setThemeState,
        // Legacy API
        darkMode,
        toggleDarkMode,
        setDarkMode,
        visualTheme,
        setVisualTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
