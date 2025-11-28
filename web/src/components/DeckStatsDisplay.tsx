import React from 'react';
import type { Deck } from '../types/deck';

interface DeckStatsDisplayProps {
  deck: Deck;
  className?: string;
}

export const DeckStatsDisplay: React.FC<DeckStatsDisplayProps> = ({
  deck,
  className = '',
}) => {
  const hasCards = deck.card_count > 0;

  return (
    <div className={`${className}`}>
      {/* Card Counts Grid - similar to SessionDueCountsCard layout */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* New Cards */}
        <div 
          className="text-center p-3 rounded-lg border-2 transition-all" 
          style={{
            backgroundColor: hasCards && deck.new_count > 0 ? 'rgba(34, 197, 94, 0.1)' : 'var(--kd-surface-2)',
            borderColor: hasCards && deck.new_count > 0 ? 'var(--kd-success)' : 'var(--kd-divider)'
          }}
        >
          <div 
            className="text-2xl font-bold" 
            style={{ 
              color: hasCards && deck.new_count > 0 ? 'var(--kd-success)' : 'var(--kd-text-muted)' 
            }}
          >
            {deck.new_count || 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
            New
          </div>
        </div>

        {/* Learning Cards */}
        <div 
          className="text-center p-3 rounded-lg border-2 transition-all" 
          style={{
            backgroundColor: hasCards && deck.learning_count > 0 ? 'rgba(251, 191, 36, 0.1)' : 'var(--kd-surface-2)',
            borderColor: hasCards && deck.learning_count > 0 ? 'var(--kd-warning)' : 'var(--kd-divider)'
          }}
        >
          <div 
            className="text-2xl font-bold" 
            style={{ 
              color: hasCards && deck.learning_count > 0 ? 'var(--kd-warning)' : 'var(--kd-text-muted)' 
            }}
          >
            {deck.learning_count || 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
            Learning
          </div>
        </div>

        {/* Review Cards */}
        <div 
          className="text-center p-3 rounded-lg border-2 transition-all" 
          style={{
            backgroundColor: hasCards && deck.review_count > 0 ? 'rgba(59, 130, 246, 0.1)' : 'var(--kd-surface-2)',
            borderColor: hasCards && deck.review_count > 0 ? 'var(--kd-primary)' : 'var(--kd-divider)'
          }}
        >
          <div 
            className="text-2xl font-bold" 
            style={{ 
              color: hasCards && deck.review_count > 0 ? 'var(--kd-primary)' : 'var(--kd-text-muted)' 
            }}
          >
            {deck.review_count || 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
            Review
          </div>
        </div>
      </div>

      {/* Total Cards Chip */}
      <div className="flex items-center justify-center">
        <div 
          className="inline-flex items-center px-3 py-1 rounded-full text-sm"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-secondary)',
            border: '1px solid var(--kd-divider)'
          }}
        >
          <span className="text-xs mr-1">📊</span>
          <span>{deck.card_count} total cards</span>
        </div>
      </div>

      {/* Daily Limits (if set) */}
      {(deck.new_per_day || deck.review_per_day) && (
        <div className="text-xs mt-3 space-y-1" style={{ color: 'var(--kd-text-secondary)' }}>
          {deck.new_per_day && (
            <div className="flex justify-between">
              <span>Daily new limit:</span>
              <span>{deck.new_per_day}</span>
            </div>
          )}
          {deck.review_per_day && (
            <div className="flex justify-between">
              <span>Daily review limit:</span>
              <span>{deck.review_per_day}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};