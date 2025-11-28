import React from 'react';
import type { Deck } from '../../types/deck';
import { DeckStatsDisplay } from '../DeckStatsDisplay';

interface DeckCardProps {
  deck: Deck;
  onStudy: (deckId: number) => void;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: number) => void;
  onViewStats: (deckId: number) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onStudy,
  onEdit,
  onDelete,
  onViewStats,
}) => {
  const hasDueCards = deck.due_count > 0;

  return (
    <div className="rounded-lg p-6 transition-shadow flex flex-col" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)', minHeight: '280px' }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--kd-shadow-lg)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)')}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--kd-text-primary)' }}>
            {deck.name}
          </h3>
          {deck.description && (
            <p className="text-sm line-clamp-2" style={{ color: 'var(--kd-text-secondary)' }}>
              {deck.description}
            </p>
          )}
        </div>
      </div>

      {/* Use the new DeckStatsDisplay component */}
      <div className="mb-4 flex-grow" style={{ minHeight: '8rem' }}>
        <DeckStatsDisplay deck={deck} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStudy(deck.id)}
          disabled={!hasDueCards}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-all"
          style={{
            backgroundColor: hasDueCards ? 'var(--kd-primary)' : 'var(--kd-disabled)',
            color: 'var(--kd-text-inverse)',
            cursor: hasDueCards ? 'pointer' : 'not-allowed',
            opacity: hasDueCards ? 1 : 0.6,
          }}
          onMouseEnter={(e) => hasDueCards && (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => hasDueCards && (e.currentTarget.style.opacity = '1')}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {hasDueCards ? 'Study Now' : 'No Cards Due'}
        </button>

        <button
          onClick={() => onViewStats(deck.id)}
          className="px-3 py-2 text-sm font-medium rounded-md focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)')}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          title="View Statistics"
        >
          📊
        </button>

        <button
          onClick={() => onEdit(deck)}
          className="px-3 py-2 text-sm font-medium rounded-md focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)')}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          title="Edit Deck"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(deck.id)}
          className="px-3 py-2 text-sm font-medium rounded-md focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-danger)',
            border: '1px solid var(--kd-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(184, 40, 56, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          title="Delete Deck"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
