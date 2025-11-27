/**
 * Theme Types - Unified theme and mode system
 * Phase 3 Implementation: Mizuiro/Sakura themes with Day/Night modes
 */

export type VisualTheme = 'mizuiro' | 'sakura';
export type ThemeMode = 'day' | 'night';

export interface ThemeState {
  theme: VisualTheme;
  mode: ThemeMode;
}

export const DEFAULT_THEME: ThemeState = {
  theme: 'mizuiro',
  mode: 'night',
};

/**
 * Four possible theme combinations:
 * - Mizuiro Day
 * - Mizuiro Night
 * - Sakura Day
 * - Sakura Night
 */
export const THEME_COMBINATIONS = [
  { theme: 'mizuiro' as VisualTheme, mode: 'day' as ThemeMode, label: 'Mizuiro Day' },
  { theme: 'mizuiro' as VisualTheme, mode: 'night' as ThemeMode, label: 'Mizuiro Night' },
  { theme: 'sakura' as VisualTheme, mode: 'day' as ThemeMode, label: 'Sakura Day' },
  { theme: 'sakura' as VisualTheme, mode: 'night' as ThemeMode, label: 'Sakura Night' },
] as const;
