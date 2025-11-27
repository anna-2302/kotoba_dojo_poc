/**
 * Settings Sync - Synchronizes server settings with local theme context
 * Loads user settings on app init and syncs dark mode + visual theme
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api';
import { useTheme } from './ThemeProvider';

export function SettingsSync() {
  const { setDarkMode, setVisualTheme } = useTheme();

  // Fetch settings on mount
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync settings to theme context when they load
  useEffect(() => {
    if (settings) {
      // Sync dark mode
      if (settings.dark_mode !== undefined) {
        setDarkMode(settings.dark_mode);
      }
      
      // Sync visual theme
      if (settings.visual_theme) {
        setVisualTheme(settings.visual_theme as 'mizuiro' | 'sakura');
      }
    }
  }, [settings, setDarkMode, setVisualTheme]);

  // This component doesn't render anything
  return null;
}
