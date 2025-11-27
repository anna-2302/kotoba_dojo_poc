import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CompactMusicPlayer } from './CompactMusicPlayer';
import { useTheme } from './ThemeProvider';
import { settingsApi } from '../api';
import type { UserSettingsUpdate } from '../api';

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mode, setMode } = useTheme();
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  // Mutation to persist mode to backend
  const updateMutation = useMutation({
    mutationFn: (data: UserSettingsUpdate) => settingsApi.update(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });

  const handleModeChange = (newMode: 'day' | 'night') => {
    setMode(newMode);
    updateMutation.mutate({ theme_mode: newMode });
    // Don't close dropdown immediately - let onMouseLeave handle it
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md" style={{
      backgroundColor: 'var(--kd-bg-surface)',
      borderBottom: '1px solid var(--kd-border-subtle)'
    }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
              🌸 Kotoba Dojo
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
              Your cozy Japanese learning companion
            </p>
          </button>
          
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/decks')}
              className="transition-colors font-medium"
              style={{ color: 'var(--kd-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--kd-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--kd-text-secondary)'}
            >
              📚 Decks
            </button>
            <button 
              onClick={() => navigate('/browse')}
              className="transition-colors font-medium"
              style={{ color: 'var(--kd-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--kd-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--kd-text-secondary)'}
            >
              🔍 Browse
            </button>
            <button 
              onClick={() => navigate('/stats')}
              className="transition-colors font-medium"
              style={{ color: 'var(--kd-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--kd-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--kd-text-secondary)'}
            >
              📊 Stats
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="transition-colors font-medium"
              style={{ color: 'var(--kd-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--kd-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--kd-text-secondary)'}
            >
              ⚙️ Settings
            </button>
            
            <CompactMusicPlayer />
            
            {/* Day/Night Mode Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowModeDropdown(true)}
              onMouseLeave={() => setShowModeDropdown(false)}
            >
              <button
                className="px-3 py-2 rounded-lg transition-colors text-xl w-[60px]"
                style={{
                  backgroundColor: 'var(--kd-bg-subtle)',
                  border: '1px solid var(--kd-border)',
                }}
                aria-label="Select day or night mode"
              >
                {mode === 'day' ? '☀️' : '🌚'}
              </button>
              
              {showModeDropdown && (
                <div 
                  className="absolute right-0 mt-0 rounded-lg shadow-xl py-1 z-50 w-[60px]"
                  style={{
                    backgroundColor: 'var(--kd-bg-surface)',
                    border: '1px solid var(--kd-border)',
                  }}
                >
                  <button
                    onClick={() => handleModeChange('day')}
                    className="w-full px-4 py-2 text-xl hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: mode === 'day' ? 'var(--kd-bg-subtle)' : 'transparent',
                    }}
                    aria-label="Day mode"
                  >
                    ☀️
                  </button>
                  <button
                    onClick={() => handleModeChange('night')}
                    className="w-full px-4 py-2 text-xl hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: mode === 'night' ? 'var(--kd-bg-subtle)' : 'transparent',
                    }}
                    aria-label="Night mode"
                  >
                    🌚
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
