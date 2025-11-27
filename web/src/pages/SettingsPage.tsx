/**
 * Settings Page - User Preferences
 * Implements REQ-10 (Dark Mode) and REQ-11 (Music)
 */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api';
import type { UserSettingsUpdate } from '../api';
import { useTheme } from '../components/ThemeProvider';
import DarkModeToggle from '../components/DarkModeToggle';
import MusicPlayer from '../components/MusicPlayer';
import { AppHeader } from '../components/AppHeader';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { darkMode, setDarkMode } = useTheme();

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 60000, // 1 minute
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserSettingsUpdate) => settingsApi.update(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      // Sync dark mode with theme context
      if (data.dark_mode !== undefined && data.dark_mode !== darkMode) {
        setDarkMode(data.dark_mode);
      }
    },
  });

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled); // Update local state immediately
    updateMutation.mutate({ dark_mode: enabled }); // Persist to server
  };

  const handleMusicToggle = (enabled: boolean) => {
    updateMutation.mutate({ music_enabled: enabled });
  };

  const handleVolumeChange = (volume: number) => {
    updateMutation.mutate({ music_volume: volume });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Failed to load settings. Please try again.
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ⚙️ Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your learning experience
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🎨 Appearance
            </h2>
            
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle
                enabled={darkMode}
                onChange={handleDarkModeToggle}
              />
            </div>
          </div>

          {/* Audio Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🎵 Background Music
            </h2>
            
            <MusicPlayer
              enabled={settings.music_enabled}
              volume={settings.music_volume}
              onToggle={handleMusicToggle}
              onVolumeChange={handleVolumeChange}
            />
          </div>

          {/* Learning Settings Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📚 Learning Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Learning Steps (minutes)
                </label>
                <input
                  type="text"
                  value={settings.learning_steps}
                  onChange={(e) => updateMutation.mutate({ learning_steps: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10,1440"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Comma-separated learning intervals in minutes (e.g., "10,1440" = 10 min, 1 day)
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ℹ️ About
            </h2>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-white">Kotoba Dojo</strong> - 
                A cozy spaced-repetition flashcard app for Japanese language learning
              </p>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Data Attribution
                </h3>
                <p className="leading-relaxed">
                  Prebuilt vocabulary decks use data derived from <strong>JMdict</strong> and{' '}
                  <strong>KANJIDIC</strong>, both created by the{' '}
                  <a
                    href="http://www.edrdg.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Electronic Dictionary Research and Development Group
                  </a>
                  .
                </p>
                <p className="mt-2 leading-relaxed">
                  These dictionaries are the property of the EDRDG and are used in conformance
                  with the EDRDG's{' '}
                  <a
                    href="http://www.edrdg.org/edrdg/licence.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    licence
                  </a>
                  .
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Version
                </h3>
                <p>Kotoba Dojo POC v0.1.0</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center pt-4">
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
