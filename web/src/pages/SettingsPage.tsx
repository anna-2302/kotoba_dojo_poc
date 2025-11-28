/**
 * Settings Page - User Preferences
 * Implements REQ-10 (Theme System) and REQ-11 (Music)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, decksApi } from '../api';
import type { UserSettingsUpdate, Deck } from '../api';
import { useTheme } from '../components/ThemeProvider';
import { AppHeader } from '../components/AppHeader';
import type { VisualTheme, ThemeMode } from '../theme/themeTypes';

interface ThemeCombination {
  theme: VisualTheme;
  mode: ThemeMode;
  label: string;
  emoji: string;
  description: string;
  colors: string[];
}


const THEME_COMBINATIONS: ThemeCombination[] = [
  {
    theme: 'mizuiro',
    mode: 'day',
    label: 'Mizuiro',
    emoji: '🌊',
    description: 'Cool blues and crisp neutrals for focused clarity',
    colors: ['#2563a8', '#5a9fd8', '#e8f0f7'],
  },
  {
    theme: 'sakura',
    mode: 'day',
    label: 'Sakura',
    emoji: '🌸',
    description: 'Soft pink and warm neutrals with gentle accents',
    colors: ['#b8527d', '#e89bb0', '#faf9f7'],
  },
];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, mode, setTheme } = useTheme();

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 60000, // 1 minute
  });

  // Fetch decks for session configuration
  const { data: decks } = useQuery({
    queryKey: ['decks'],
    queryFn: decksApi.list,
    staleTime: 300000, // 5 minutes
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserSettingsUpdate) => settingsApi.update(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });

  const handleThemeChange = (newTheme: VisualTheme) => {
    // Update local state immediately
    if (newTheme !== theme) {
      setTheme(newTheme);
      // Keep the current mode when changing themes
    }
    
    // Persist to server (backend sync is already handled by ThemeProvider)
    // This is redundant but ensures immediate backend update on explicit Settings page change
    updateMutation.mutate({ 
      visual_theme: newTheme,
      theme_mode: mode  // Use current mode, not the combo's mode
    });
  };

  const isCurrentTheme = (themeOption: VisualTheme) => {
    return theme === themeOption;  // Only check theme, not mode
  };

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--kd-bg)' }}>
          <div style={{ color: 'var(--kd-text-secondary)' }}>Loading settings...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--kd-bg)' }}>
          <div style={{ color: 'var(--kd-danger)' }}>
            Failed to load settings. Please try again.
          </div>
        </div>
      </>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--kd-bg)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
          Settings
          </h1>
          <p className="mt-2" style={{ color: 'var(--kd-text-secondary)' }}>
            Customize your learning experience
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Theme Selection Section */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kd-text-primary)' }}>
              🎨 Visual Theme & Mode
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm mb-4" style={{ color: 'var(--kd-text-secondary)' }}>
                Choose your visual theme - use the header dropdown to switch between day/night modes
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {THEME_COMBINATIONS.map((combo) => {
                  const isCurrent = isCurrentTheme(combo.theme);
                  
                  return (
                    <button
                      key={`${combo.theme}-${combo.mode}`}
                      onClick={() => handleThemeChange(combo.theme)}
                      className="relative group p-6 rounded-lg hover:shadow-lg transition-all duration-200 text-left"
                      style={{
                        backgroundColor: isCurrent ? 'var(--kd-surface-2)' : 'var(--kd-surface)',
                        border: isCurrent ? '2px solid var(--kd-primary)' : '2px solid var(--kd-border)',
                        boxShadow: isCurrent ? 'var(--kd-shadow-md)' : 'none',
                        paddingTop: isCurrent ? '2.5rem' : '1.5rem'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = 'var(--kd-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = 'var(--kd-border)';
                        }
                      }}
                    >
                      {isCurrent && (
                        <span className="absolute top-2 left-3 text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--kd-primary)', color: 'var(--kd-text-inverse)', opacity: 0.9 }}>
                          Current
                        </span>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl" role="img" aria-hidden="true">
                            {combo.emoji}
                          </span>
                          <h3 className="font-semibold" style={{ color: 'var(--kd-text-primary)' }}>
                            {combo.label}
                          </h3>
                        </div>
                        {isCurrent && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--kd-primary)', border: '2px solid var(--kd-primary)' }}>
                            <span className="text-xs" style={{ color: 'var(--kd-text-inverse)' }}>✓</span>
                          </div>
                        )}
                        {!isCurrent && (
                          <div className="w-5 h-5 rounded-full" style={{ border: '2px solid var(--kd-border)' }}></div>
                        )}
                      </div>
                      
                      <p className="text-sm mb-4" style={{ color: 'var(--kd-text-secondary)' }}>
                        {combo.description}
                      </p>
                      
                      {/* Color palette preview */}
                      <div className="flex gap-2">
                        {combo.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-full shadow-sm"
                            style={{ backgroundColor: color, border: '2px solid var(--kd-surface)' }}
                            title={color}
                          />
                        ))}
                      </div>
                      
                      {/* Sample component preview */}
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--kd-divider)' }}>
                        <div className="flex gap-2">
                          <div
                            className="px-3 py-1 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: combo.colors[0],
                              color: '#ffffff',
                            }}
                          >
                            Primary
                          </div>
                          <div
                            className="px-3 py-1 rounded-md text-xs font-medium"
                            style={{
                              border: `1px solid ${combo.colors[0]}`,
                              color: combo.colors[0],
                            }}
                          >
                            Secondary
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Learning Settings Section */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kd-text-primary)' }}>
              📚 Learning Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                  Learning Steps (minutes)
                </label>
                <input
                  type="text"
                  value={settings.learning_steps}
                  onChange={(e) => updateMutation.mutate({ learning_steps: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--kd-surface-2)',
                    color: 'var(--kd-text-primary)',
                    border: '1px solid var(--kd-border)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                    e.currentTarget.style.outlineOffset = '0px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  placeholder="10,1440"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
                  Comma-separated learning intervals in minutes (e.g., "10,1440" = 10 min, 1 day)
                </p>
              </div>
            </div>
          </div>

          {/* Session Configuration Section */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kd-text-primary)' }}>
              🎯 Session Configuration
            </h2>
            
            <div className="space-y-6">
              {/* Session Size Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                    Max Session Size
                  </label>
                  <input
                    type="number"
                    value={settings.max_session_size || 50}
                    onChange={(e) => updateMutation.mutate({ max_session_size: parseInt(e.target.value) || 50 })}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--kd-surface-2)',
                      color: 'var(--kd-text-primary)',
                      border: '1px solid var(--kd-border)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                      e.currentTarget.style.outlineOffset = '0px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                    min="5"
                    max="200"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
                    Maximum cards per review session (5-200)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                    Session Scope Preference
                  </label>
                  <select
                    value={settings.preferred_session_scope || 'all'}
                    onChange={(e) => updateMutation.mutate({ preferred_session_scope: e.target.value as 'all' | 'deck' })}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--kd-surface-2)',
                      color: 'var(--kd-text-primary)',
                      border: '1px solid var(--kd-border)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                      e.currentTarget.style.outlineOffset = '0px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    <option value="all">All Decks</option>
                    <option value="deck">Specific Decks</option>
                  </select>
                  <p className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
                    Default session scope when starting reviews
                  </p>
                </div>
              </div>

              {/* Section Limits */}
              <div>
                <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--kd-text-primary)' }}>
                  Section Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--kd-warning)' }}></span>
                        New Cards
                      </span>
                    </label>
                    <input
                      type="number"
                      value={settings.new_section_limit || 15}
                      onChange={(e) => updateMutation.mutate({ new_section_limit: parseInt(e.target.value) || 15 })}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--kd-surface-2)',
                        color: 'var(--kd-text-primary)',
                        border: '1px solid var(--kd-border)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                        e.currentTarget.style.outlineOffset = '0px';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                      min="0"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--kd-info)' }}></span>
                        Learning Cards
                      </span>
                    </label>
                    <input
                      type="number"
                      value={settings.learning_section_limit || 20}
                      onChange={(e) => updateMutation.mutate({ learning_section_limit: parseInt(e.target.value) || 20 })}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--kd-surface-2)',
                        color: 'var(--kd-text-primary)',
                        border: '1px solid var(--kd-border)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                        e.currentTarget.style.outlineOffset = '0px';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--kd-success)' }}></span>
                        Review Cards
                      </span>
                    </label>
                    <input
                      type="number"
                      value={settings.review_section_limit || 30}
                      onChange={(e) => updateMutation.mutate({ review_section_limit: parseInt(e.target.value) || 30 })}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--kd-surface-2)',
                        color: 'var(--kd-text-primary)',
                        border: '1px solid var(--kd-border)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                        e.currentTarget.style.outlineOffset = '0px';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                      min="0"
                      max="150"
                    />
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--kd-text-secondary)' }}>
                  Maximum cards per section within each session. Set to 0 to disable section.
                </p>
              </div>

              {/* Preferred Decks Selection */}
              {(settings.preferred_session_scope === 'deck') && decks && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                    Preferred Decks
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
                    {decks.map((deck: Deck) => {
                      const isSelected = (settings.preferred_deck_ids || []).includes(deck.id);
                      return (
                        <label key={deck.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const currentIds = settings.preferred_deck_ids || [];
                              const newIds = e.target.checked 
                                ? [...currentIds, deck.id]
                                : currentIds.filter(id => id !== deck.id);
                              updateMutation.mutate({ preferred_deck_ids: newIds });
                            }}
                            className="rounded"
                            style={{ accentColor: 'var(--kd-primary)' }}
                          />
                          <span className="text-sm" style={{ color: 'var(--kd-text-primary)' }}>
                            {deck.name}
                          </span>
                          <span className="text-xs ml-auto" style={{ color: 'var(--kd-text-secondary)' }}>
                            {deck.card_count || 0} cards
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
                    Select which decks to include when using 'Specific Decks' scope
                  </p>
                </div>
              )}

              {/* Session Behavior */}
              <div>
                <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--kd-text-primary)' }}>
                  Session Behavior
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_start_sessions || false}
                    onChange={(e) => updateMutation.mutate({ auto_start_sessions: e.target.checked })}
                    className="rounded"
                    style={{ accentColor: 'var(--kd-primary)' }}
                  />
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--kd-text-primary)' }}>
                      Auto-start Next Session
                    </span>
                    <p className="text-xs" style={{ color: 'var(--kd-text-secondary)' }}>
                      Automatically start the next session after completing the current one
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kd-text-primary)' }}>
              ℹ️ About
            </h2>
            
            <div className="space-y-3 text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
              <p>
                <strong style={{ color: 'var(--kd-text-primary)' }}>Kotoba Dojo</strong> - 
                Hi! And welcome to a cozy spaced-repetition flashcard app for Japanese language learning.
              </p>
              <p>
                This lovely app has been built during my late night vibe coding sessions instead of actually learning Japanese. Don't be like me, when you study Japanese, focus on Japanese, not on a million unrelated side projects. 
              </p>
              
              <div className="pt-4" style={{ borderTop: '1px solid var(--kd-divider)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                  Data Attribution
                </h3>
                <p className="leading-relaxed">
                  Prebuilt vocabulary decks use data derived from <strong>JMdict</strong> and{' '}
                  <strong>KANJIDIC</strong>, both created by the{' '}
                  <a
                    href="http://www.edrdg.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--kd-link)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-link-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-link)')}
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
                    style={{ color: 'var(--kd-link)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-link-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-link)')}
                  >
                    licence
                  </a>
                  .
                </p>
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid var(--kd-divider)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>
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
              className="font-medium"
              style={{ color: 'var(--kd-link)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-link-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-link)')}
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
