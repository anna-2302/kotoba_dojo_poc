import React from 'react';
import type { Deck } from '../../types/deck';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {deck.name}
          </h3>
          {deck.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {deck.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-500">{deck.due_count || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Due</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{deck.new_count || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">New</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {deck.card_count || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
        </div>
      </div>

      {(deck.new_per_day || deck.review_per_day) && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-4 space-y-1">
          {deck.new_per_day && (
            <div>Daily new limit: {deck.new_per_day}</div>
          )}
          {deck.review_per_day && (
            <div>Daily review limit: {deck.review_per_day}</div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStudy(deck.id)}
          disabled={!hasDueCards}
          className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
            hasDueCards
              ? 'bg-pink-500 hover:bg-pink-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {hasDueCards ? 'Study Now' : 'No Cards Due'}
        </button>

        <button
          onClick={() => onViewStats(deck.id)}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          title="View Statistics"
        >
          📊
        </button>

        <button
          onClick={() => onEdit(deck)}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          title="Edit Deck"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(deck.id)}
          className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Delete Deck"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
