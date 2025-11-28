import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const STORAGE_KEY = 'ambient-audio-settings';
const API_BASE_URL = 'http://localhost:8000/api';

interface AudioSettings {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
}

const defaultSettings: AudioSettings = {
  isPlaying: false,
  volume: 0.3,
  isMuted: false,
};

// Debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function AmbientAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [settings, setSettings] = useState<AudioSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed, isPlaying: false }; // Never autoplay
      }
    } catch (e) {
      console.error('Failed to load audio settings:', e);
    }
    return defaultSettings;
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Sync settings to backend (debounced)
  const syncToBackend = useCallback(
    debounce(async (music_on: boolean, music_volume: number) => {
      try {
        await axios.put(`${API_BASE_URL}/settings`, {
          music_on,
          music_volume,
        });
        console.log('Audio settings synced to backend');
      } catch (error) {
        console.warn('Failed to sync audio settings to backend:', error);
      }
    }, 1000),
    []
  );

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      
      // Sync to backend (only if user has explicitly played at least once)
      if (settings.isPlaying || localStorage.getItem('audio-ever-played') === 'true') {
        if (settings.isPlaying) {
          localStorage.setItem('audio-ever-played', 'true');
        }
        syncToBackend(settings.isPlaying, settings.volume);
      }
    } catch (e) {
      console.error('Failed to save audio settings:', e);
    }
  }, [settings, syncToBackend]);

  // Update audio element when settings change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.isMuted ? 0 : settings.volume;
      
      if (settings.isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Autoplay prevented:', err);
          setSettings(prev => ({ ...prev, isPlaying: false }));
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [settings.isPlaying, settings.volume, settings.isMuted]);

  // Keyboard shortcuts: Shift+P (play/pause), Shift+M (mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'P') {
        e.preventDefault();
        togglePlay();
      } else if (e.shiftKey && e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    setSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setSettings(prev => ({ ...prev, volume: newVolume, isMuted: false }));
  };

  const toggleMute = () => {
    setSettings(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleAudioEnded = () => {
    // Loop the audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div className="ambient-audio-player">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/audio/lofi-ambient.mp3"
        onEnded={handleAudioEnded}
        preload="none"
        aria-label="Background ambient audio"
      />

      {/* Compact control button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="audio-toggle-btn"
        title="Ambient music controls (Shift+P to play/pause)"
        aria-label="Open ambient audio player. Keyboard shortcuts: Shift+P to play/pause, Shift+M to mute"
      >
        🎵 {settings.isPlaying ? '♪' : ''}
      </button>

      {/* Expanded controls panel */}
      {isExpanded && (
        <div className="audio-controls-panel">
          <div className="audio-header">
            <span className="audio-title">🎵 Ambient Music</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="close-btn"
              title="Close audio player"
              aria-label="Close audio player"
            >
              ×
            </button>
          </div>

          <div className="audio-controls">
            <button
              onClick={togglePlay}
              className="play-pause-btn"
              title={`${settings.isPlaying ? 'Pause' : 'Play'} (Shift+P)`}
              aria-label={`${settings.isPlaying ? 'Pause' : 'Play'} ambient audio. Keyboard shortcut: Shift+P`}
            >
              {settings.isPlaying ? '⏸' : '▶'}
            </button>

            <button
              onClick={toggleMute}
              className="mute-btn"
              title={`${settings.isMuted ? 'Unmute' : 'Mute'} (Shift+M)`}
              aria-label={`${settings.isMuted ? 'Unmute' : 'Mute'} audio. Keyboard shortcut: Shift+M`}
            >
              {settings.isMuted ? '🔇' : '🔊'}
            </button>

            <div className="volume-control">
              <label htmlFor="volume-slider" className="volume-label">
                Volume
              </label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={handleVolumeChange}
                disabled={settings.isMuted}
                className="volume-slider"
                aria-label="Volume slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(settings.volume * 100)}
              />
              <span className="volume-value">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
          </div>

          <div className="audio-info">
            <small>🎧 Lo-fi ambient track for focused study</small>
            <div style={{ fontSize: '11px', marginTop: '8px', color: '#666' }}>
              💡 <strong>Shift+P</strong>: Play/Pause
              <br />
              💡 <strong>Shift+M</strong>: Mute
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ambient-audio-player {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .audio-toggle-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #8b9a89;
          background: rgba(255, 255, 255, 0.95);
          color: #2d3e2d;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .audio-toggle-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 1);
        }

        .audio-controls-panel {
          position: absolute;
          bottom: 60px;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          border: 2px solid #8b9a89;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          min-width: 280px;
          backdrop-filter: blur(10px);
        }

        .audio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
        }

        .audio-title {
          font-weight: 600;
          color: #2d3e2d;
          font-size: 14px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #333;
        }

        .audio-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 12px;
        }

        .play-pause-btn,
        .mute-btn {
          padding: 8px 16px;
          border: 1px solid #8b9a89;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
          color: #2d3e2d;
        }

        .play-pause-btn:hover,
        .mute-btn:hover {
          background: #f5f8f5;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .play-pause-btn:active,
        .mute-btn:active {
          transform: translateY(0);
        }

        .volume-control {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .volume-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .volume-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #8b9a89 0%, #8b9a89 var(--volume-percent), #e0e0e0 var(--volume-percent), #e0e0e0 100%);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b9a89;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: #6d7a6d;
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b9a89;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          background: #6d7a6d;
        }

        .volume-slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .volume-value {
          font-size: 12px;
          color: #666;
          text-align: right;
        }

        .audio-info {
          padding-top: 8px;
          border-top: 1px solid #e0e0e0;
        }

        .audio-info small {
          color: #666;
          font-size: 11px;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .audio-toggle-btn {
            background: rgba(45, 62, 45, 0.95);
            color: #e8f4e8;
            border-color: #6d7a6d;
          }

          .audio-toggle-btn:hover {
            background: rgba(45, 62, 45, 1);
          }

          .audio-controls-panel {
            background: rgba(45, 62, 45, 0.98);
            border-color: #6d7a6d;
          }

          .audio-title {
            color: #e8f4e8;
          }

          .close-btn {
            color: #ccc;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }

          .play-pause-btn,
          .mute-btn {
            background: rgba(255, 255, 255, 0.1);
            border-color: #6d7a6d;
            color: #e8f4e8;
          }

          .play-pause-btn:hover,
          .mute-btn:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          .volume-label,
          .volume-value,
          .audio-info small {
            color: #ccc;
          }

          .audio-header,
          .audio-info {
            border-color: #555;
          }
        }
      `}</style>
    </div>
  );
}
