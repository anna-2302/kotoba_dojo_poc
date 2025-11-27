/**
 * Compact Music Player for Header
 * Persistent audio player visible across all pages (PRD REQ-11, Phase 2)
 * Supports multiple tracks with random playback
 */
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api';
import type { UserSettingsUpdate } from '../api';

// Available audio tracks
const AUDIO_TRACKS = [
  '/audio/lofi-ambient.mp3',
  '/audio/jazz-lounge-elevator-music-322314.mp3',
  '/audio/jazz-lounge-elevator-music-332339.mp3',
  '/audio/summer-walk-152722.mp3',
];

// Singleton audio instance - survives component unmount/remount
let globalAudioInstance: HTMLAudioElement | null = null;
let currentTrackIndex: number = -1;
let playedTracks: number[] = [];

const getRandomTrackIndex = (): number => {
  // If all tracks have been played, reset the played list
  if (playedTracks.length >= AUDIO_TRACKS.length) {
    playedTracks = [];
  }
  
  // Get available tracks (not yet played)
  const availableTracks = AUDIO_TRACKS.map((_, index) => index)
    .filter(index => !playedTracks.includes(index));
  
  // Pick random from available tracks
  const randomIndex = Math.floor(Math.random() * availableTracks.length);
  const trackIndex = availableTracks[randomIndex];
  
  // Mark as played
  playedTracks.push(trackIndex);
  
  return trackIndex;
};

const getAudioInstance = () => {
  if (!globalAudioInstance) {
    globalAudioInstance = new Audio();
    
    // Load first random track
    currentTrackIndex = getRandomTrackIndex();
    globalAudioInstance.src = AUDIO_TRACKS[currentTrackIndex];
    
    // Handle track end - play next random track
    globalAudioInstance.addEventListener('ended', () => {
      currentTrackIndex = getRandomTrackIndex();
      globalAudioInstance!.src = AUDIO_TRACKS[currentTrackIndex];
      globalAudioInstance!.play().catch(err => console.log('Auto-play failed:', err));
    });
  }
  return globalAudioInstance;
};

export function CompactMusicPlayer() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(getAudioInstance());
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

  // Initialize playing state from audio element on mount
  useEffect(() => {
    const audio = audioRef.current;
    setIsPlaying(!audio.paused);
    
    // Set initial volume if settings are available
    if (settings) {
      audio.volume = settings.music_volume;
    }
  }, []);

  // Sync volume with settings
  useEffect(() => {
    if (audioRef.current && settings) {
      audioRef.current.volume = settings.music_volume;
    }
  }, [settings?.music_volume]);

  // Listen to audio element events to sync state
  useEffect(() => {
    const audio = audioRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    
    if (!settings?.music_enabled) {
      // Enable music first
      updateMutation.mutate({ music_enabled: true });
    }
    
    if (audio.paused) {
      audio.play().catch((err) => {
        console.log('Audio play failed:', err);
      });
    } else {
      audio.pause();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updateMutation.mutate({ music_volume: newVolume });
  };

  const handleMuteToggle = () => {
    const newVolume = (settings?.music_volume ?? 0) > 0 ? 0 : 0.5;
    updateMutation.mutate({ music_volume: newVolume });
  };

  const handleNextTrack = () => {
    const audio = audioRef.current;
    const wasPlaying = !audio.paused;
    
    // Get next random track
    currentTrackIndex = getRandomTrackIndex();
    audio.src = AUDIO_TRACKS[currentTrackIndex];
    
    // Resume playing if it was playing before
    if (wasPlaying) {
      audio.play().catch((err) => {
        console.log('Audio play failed:', err);
      });
    }
  };

  // Keyboard shortcuts (Shift+P for play/pause, Shift+M for mute, Shift+N for next track)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'KeyP') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.shiftKey && e.code === 'KeyM') {
        e.preventDefault();
        handleMuteToggle();
      } else if (e.shiftKey && e.code === 'KeyN') {
        e.preventDefault();
        handleNextTrack();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [settings, isPlaying]);

  if (!settings) return null;

  const isMuted = settings.music_volume === 0;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main Button */}
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--kd-bg-subtle)',
          color: 'var(--kd-text-primary)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--kd-bg-elevated)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--kd-bg-subtle)'}
        aria-label="Music player"
        title="Music player (Shift+P: play/pause, Shift+N: next track)"
      >
        <span className="text-lg">
          {isPlaying ? '🎵' : '🎶'}
        </span>
      </button>

      {/* Dropdown Controls */}
      {showControls && (
        <>          
          {/* Controls Panel */}
          <div className="absolute right-0 mt-0 w-64 rounded-lg shadow-xl p-4 z-50" style={{
            backgroundColor: 'var(--kd-bg-surface)',
            border: '1px solid var(--kd-border)'
          }}>
            <div className="space-y-4">
              {/* Title */}
              <div className="text-sm font-semibold" style={{ color: 'var(--kd-text-primary)' }}>
                🎵 Background Music
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--kd-primary)',
                  color: 'var(--kd-primary-contrast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--kd-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--kd-primary)'}
              >
                <span className="text-xl">
                  {isPlaying ? '⏸️' : '▶️'}
                </span>
                <span>
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </button>

              {/* Next Track Button */}
              <button
                onClick={handleNextTrack}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--kd-bg-subtle)',
                  color: 'var(--kd-text-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--kd-bg-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--kd-bg-subtle)'}
                title="Shift+N to skip"
              >
                <span className="text-xl">
                  ⏭️
                </span>
                <span>
                  Next Track
                </span>
              </button>

              {/* Volume Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--kd-text-secondary)' }}>
                  <span>Volume</span>
                  <span>{Math.round(settings.music_volume * 100)}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMuteToggle}
                    className="transition-colors"
                    style={{ color: 'var(--kd-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--kd-text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--kd-text-secondary)'}
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
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-4
                             [&::-webkit-slider-thumb]:h-4
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{
                      backgroundColor: 'var(--kd-bg-subtle)',
                      accentColor: 'var(--kd-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="text-xs pt-2" style={{
                color: 'var(--kd-text-subtle)',
                borderTop: '1px solid var(--kd-border-subtle)'
              }}>
                <p>Keyboard shortcuts:</p>
                <p>• Shift+P: Play/Pause</p>
                <p>• Shift+M: Mute/Unmute</p>
                <p>• Shift+N: Next Track</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
