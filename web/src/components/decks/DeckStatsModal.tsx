import React, { useEffect } from 'react';
import type { DeckStats } from '../../types/deck';

interface DeckStatsModalProps {
  stats: DeckStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeckStatsModal: React.FC<DeckStatsModalProps> = ({
  stats,
  isOpen,
  onClose,
}) => {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !stats) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4" 
        style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
              📊 {stats.deck_name} - Statistics
            </h2>
            <button
              onClick={onClose}
              className="text-2xl transition-colors"
              style={{ color: 'var(--kd-text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-text-muted)')}
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Card Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--kd-text-primary)' }}>
                Card Distribution
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--kd-primary)' }}>{stats.total_cards}</div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>Total Cards</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--kd-info)' }}>{stats.due_today}</div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>Due Today</div>
                </div>
              </div>
            </div>

            {/* Card States */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--kd-text-primary)' }}>
                Card States
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--kd-success)' }}>{stats.new_cards}</div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>New</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--kd-warning)' }}>{stats.learning_cards}</div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>Learning</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--kd-info)' }}>{stats.review_cards}</div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>Review</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--kd-text-muted)' }}>{stats.suspended_cards}</div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>Suspended</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--kd-text-primary)' }}>
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--kd-accent)' }}>
                    {stats.average_ease.toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>Average Ease Factor</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--kd-success)' }}>
                    {(stats.retention_rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>Retention Rate</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--kd-text-primary)' }}>
                Progress
              </h3>
              <div className="relative">
                <div className="h-8 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div
                    className="h-full flex items-center justify-center text-sm font-medium transition-all duration-300"
                    style={{
                      width: `${stats.total_cards > 0 ? ((stats.review_cards / stats.total_cards) * 100) : 0}%`,
                      backgroundColor: 'var(--kd-primary)',
                      color: 'var(--kd-text-inverse)',
                    }}
                  >
                    {stats.total_cards > 0 && ((stats.review_cards / stats.total_cards) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-sm mt-2 text-center" style={{ color: 'var(--kd-text-secondary)' }}>
                  {stats.review_cards} of {stats.total_cards} cards in review stage
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium rounded-md focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--kd-primary)',
                color: 'var(--kd-text-inverse)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
