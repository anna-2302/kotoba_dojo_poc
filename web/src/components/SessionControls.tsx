import React, { useState } from 'react';
import type { CardStub } from '../api/types';

interface SessionControlsProps {
  onFinish: () => void;
  onRestart: () => void;
  onSuspendCard?: (cardId: number) => Promise<void>;
  currentCard: CardStub | null;
  disabled?: boolean;
  sessionStats?: {
    completed: number;
    total: number;
    againRepeats: number;
    currentSection: string;
  };
}

export function SessionControls({ 
  onFinish, 
  onRestart, 
  onSuspendCard,
  currentCard, 
  disabled = false,
  sessionStats
}: SessionControlsProps) {
  const [isSuspending, setIsSuspending] = useState(false);
  const [showCardInfo, setShowCardInfo] = useState(false);

  // Listen for keyboard shortcut to toggle card info
  React.useEffect(() => {
    const handleToggleCardInfo = () => {
      setShowCardInfo(prev => !prev);
    };

    window.addEventListener('toggleCardInfo', handleToggleCardInfo);
    return () => window.removeEventListener('toggleCardInfo', handleToggleCardInfo);
  }, []);

  const handleSuspendCard = async () => {
    if (!currentCard || !onSuspendCard) return;
    
    setIsSuspending(true);
    try {
      await onSuspendCard(currentCard.id);
    } catch (error) {
      console.error('Failed to suspend card:', error);
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {/* Keyboard Shortcuts Reference - Moved to top */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-6 px-4 py-2 rounded-lg text-xs" 
             style={{ backgroundColor: 'var(--kd-surface-2)', color: 'var(--kd-text-muted)' }}>
          <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--kd-surface)' }}>Space</kbd> Flip</span>
          <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--kd-surface)' }}>1</kbd> Again</span>
          <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--kd-surface)' }}>2</kbd> Good</span>
          <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--kd-surface)' }}>3</kbd> Easy</span>
          <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--kd-surface)' }}>Esc</kbd> Finish</span>
          <span><kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--kd-surface)' }}>I</kbd> Card Info</span>
        </div>
      </div>

      {/* Session Stats Bar */}
      {sessionStats && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-surface)' }}>
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <span style={{ color: 'var(--kd-text-secondary)' }}>
                Progress: <span style={{ color: 'var(--kd-text-primary)' }}>
                  {sessionStats.completed}/{sessionStats.total}
                </span>
              </span>
              <span style={{ color: 'var(--kd-text-secondary)' }}>
                Section: <span style={{ color: 'var(--kd-primary)' }}>
                  {sessionStats.currentSection.toUpperCase()}
                </span>
              </span>
              <span style={{ color: 'var(--kd-text-secondary)' }}>
                Again: <span style={{ color: 'var(--kd-warning)' }}>
                  {sessionStats.againRepeats}
                </span>
              </span>
            </div>
            {currentCard && (
              <button
                onClick={() => setShowCardInfo(!showCardInfo)}
                className="px-2 py-1 text-xs rounded transition-colors"
                style={{ 
                  backgroundColor: showCardInfo ? 'var(--kd-primary)' : 'var(--kd-surface-2)',
                  color: showCardInfo ? 'var(--kd-text-inverse)' : 'var(--kd-text-secondary)'
                }}
              >
                ℹ️ Card #{currentCard.id}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card Info Panel */}
      {showCardInfo && currentCard && (
        <div className="mb-4 p-3 rounded-lg border" style={{ 
          backgroundColor: 'var(--kd-surface-2)', 
          borderColor: 'var(--kd-divider)' 
        }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--kd-text-secondary)' }}>Card ID:</span>
              <span className="ml-2" style={{ color: 'var(--kd-text-primary)' }}>{currentCard.id}</span>
            </div>
            <div>
              <span style={{ color: 'var(--kd-text-secondary)' }}>State:</span>
              <span className="ml-2" style={{ color: 'var(--kd-text-primary)' }}>{currentCard.state}</span>
            </div>
            <div>
              <span style={{ color: 'var(--kd-text-secondary)' }}>Due:</span>
              <span className="ml-2" style={{ color: 'var(--kd-text-primary)' }}>
                {currentCard.due_at ? new Date(currentCard.due_at).toLocaleString() : 'Now'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--kd-text-secondary)' }}>Tags:</span>
              <span className="ml-2" style={{ color: 'var(--kd-text-primary)' }}>
                {currentCard.tags.length > 0 ? currentCard.tags.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Control Buttons */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={onFinish}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium transition-all rounded-lg border focus:outline-none"
          style={{
            color: 'var(--kd-text-secondary)',
            borderColor: 'var(--kd-divider)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)';
            e.currentTarget.style.color = 'var(--kd-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--kd-text-secondary)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          aria-label="Finish session early and return to dashboard (keyboard shortcut: Esc)"
        >
          🏁 Finish Session <span className="text-xs opacity-75">(Esc)</span>
        </button>
        
        <button
          onClick={onRestart}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium transition-all rounded-lg border focus:outline-none"
          style={{
            color: 'var(--kd-primary)',
            borderColor: 'var(--kd-primary)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--kd-primary)';
            e.currentTarget.style.color = 'var(--kd-text-inverse)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--kd-primary)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          aria-label="Start a new review session"
        >
          🔄 New Session
        </button>
        
        {currentCard && onSuspendCard && (
          <button
            onClick={handleSuspendCard}
            disabled={disabled || isSuspending}
            className="px-4 py-2 text-sm font-medium transition-all rounded-lg border focus:outline-none"
            style={{
              color: 'var(--kd-warning)',
              borderColor: 'var(--kd-warning)',
              backgroundColor: 'transparent',
              opacity: isSuspending ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSuspending) {
                e.currentTarget.style.backgroundColor = 'var(--kd-warning)';
                e.currentTarget.style.color = 'var(--kd-text-inverse)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSuspending) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--kd-warning)';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            aria-label="Suspend current card (remove from reviews)"
          >
            ⏸️ {isSuspending ? 'Suspending...' : 'Suspend Card'}
          </button>
        )}
      </div>
    </div>
  );
}