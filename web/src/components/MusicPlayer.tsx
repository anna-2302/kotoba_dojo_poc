/**
 * Music Player Component
 * Implements REQ-11 (Background Music)
 * HTML5 audio with play/pause/volume controls
 */
import React, { useEffect, useRef, useState } from 'react';

interface MusicPlayerProps {
  enabled: boolean;
  volume: number;
  onToggle: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
}

export function MusicPlayer({
  enabled,
  volume,
  onToggle,
  onVolumeChange,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);

  // Initialize audio element
  useEffect(() => {
    // Note: In a real implementation, you would have an actual audio file
    // For POC, we'll create a placeholder
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // audioRef.current.src = '/audio/chill-background.mp3';
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle enabled state
  useEffect(() => {
    if (audioRef.current) {
      if (enabled && isPlaying) {
        audioRef.current.play().catch((err) => {
          console.log('Audio play failed:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [enabled, isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!enabled) {
      onToggle(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const handleMuteToggle = () => {
    if (localVolume > 0) {
      setLocalVolume(0);
      onVolumeChange(0);
    } else {
      setLocalVolume(0.5);
      onVolumeChange(0.5);
    }
  };

  return (
    <div className="space-y-4">
      {/* Music Enable Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white block">
            Background Music
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {enabled ? 'Music enabled' : 'Music disabled'}
          </p>
        </div>
        
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}
          `}
        >
          <span className="sr-only">Toggle music</span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full
              bg-white shadow ring-0 transition duration-200 ease-in-out
              ${enabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {/* Music Controls (shown when enabled) */}
      {enabled && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Play/Pause Button */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-12 h-12 rounded-full
                       bg-blue-600 hover:bg-blue-700 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-colors"
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              <span className="text-2xl">
                {isPlaying ? '⏸️' : '▶️'}
              </span>
            </button>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isPlaying ? 'Now Playing: Chill Lo-Fi Beats' : 'Music Paused'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Background music for focused studying
              </p>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMuteToggle}
              className="text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label={localVolume > 0 ? 'Mute' : 'Unmute'}
            >
              {localVolume === 0 ? '🔇' : localVolume < 0.5 ? '🔉' : '🔊'}
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={localVolume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                         accent-blue-600"
                aria-label="Volume"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0%</span>
                <span>{Math.round(localVolume * 100)}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              💡 <strong>Note:</strong> Audio file not included in POC. 
              Add royalty-free music to <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded">
                /public/audio/chill-background.mp3
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicPlayer;
