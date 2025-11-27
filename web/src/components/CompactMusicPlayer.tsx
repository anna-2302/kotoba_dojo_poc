/**
 * Compact Music Player for Header
 * Persistent audio player visible across all pages (PRD REQ-11, Phase 2)
 */
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api';
import type { UserSettingsUpdate } from '../api';

export function CompactMusicPlayer() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 60000,
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserSettingsUpdate) => settingsApi.update(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // audioRef.current.src = '/audio/chill-background.mp3'; // Placeholder for actual audio file
      audioRef.current.loop = true;
      audioRef.current.volume = settings?.music_volume ?? 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync volume with settings
  useEffect(() => {
    if (audioRef.current && settings) {
      audioRef.current.volume = settings.music_volume;
    }
  }, [settings?.music_volume]);

  // Handle play/pause based on settings and playing state
  useEffect(() => {
    if (audioRef.current) {
      if (settings?.music_enabled && isPlaying) {
        audioRef.current.play().catch((err) => {
          console.log('Audio play failed:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [settings?.music_enabled, isPlaying]);

  const handlePlayPause = () => {
    if (!settings?.music_enabled) {
      // Enable music first
      updateMutation.mutate({ music_enabled: true });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updateMutation.mutate({ music_volume: newVolume });
  };

  const handleMuteToggle = () => {
    const newVolume = (settings?.music_volume ?? 0) > 0 ? 0 : 0.5;
    updateMutation.mutate({ music_volume: newVolume });
  };

  // Keyboard shortcuts (Shift+P for play/pause, Shift+M for mute)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'KeyP') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.shiftKey && e.code === 'KeyM') {
        e.preventDefault();
        handleMuteToggle();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [settings, isPlaying]);

  if (!settings) return null;

  const isMuted = settings.music_volume === 0;

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Music player"
        title="Music player (Shift+P to play/pause)"
      >
        <span className="text-lg">
          {isPlaying ? '🎵' : '🎶'}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {isPlaying ? 'Playing' : 'Music'}
        </span>
      </button>

      {/* Dropdown Controls */}
      {showControls && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowControls(false)}
          />
          
          {/* Controls Panel */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
            <div className="space-y-4">
              {/* Title */}
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                🎵 Background Music
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <span className="text-xl">
                  {isPlaying ? '⏸️' : '▶️'}
                </span>
                <span>
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </button>

              {/* Volume Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Volume</span>
                  <span>{Math.round(settings.music_volume * 100)}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMuteToggle}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    title="Shift+M to mute/unmute"
                  >
                    <span className="text-lg">
                      {isMuted ? '🔇' : settings.music_volume < 0.5 ? '🔉' : '🔊'}
                    </span>
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.music_volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-4
                             [&::-webkit-slider-thumb]:h-4
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-blue-600
                             [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p>Keyboard shortcuts:</p>
                <p>• Shift+P: Play/Pause</p>
                <p>• Shift+M: Mute/Unmute</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
