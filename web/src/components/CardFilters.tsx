import React from 'react';
import type { Deck, CardFilters as FilterType } from '../api';

interface CardFiltersProps {
  filters: FilterType;
  decks: Deck[];
  tags: string[];
  onChange: (filters: FilterType) => void;
  onReset: () => void;
}

export const CardFilters: React.FC<CardFiltersProps> = ({
  filters,
  decks,
  tags,
  onChange,
  onReset,
}) => {
  const handleDeckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({
      ...filters,
      deck_id: value ? parseInt(value) : undefined,
      page: 1, // Reset to first page
    });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FilterType['state'];
    onChange({
      ...filters,
      state: value || undefined,
      page: 1,
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
      page: 1,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      q: e.target.value || undefined,
      page: 1,
    });
  };

  const hasActiveFilters = !!(
    filters.deck_id ||
    filters.state ||
    (filters.tags && filters.tags.length > 0) ||
    filters.q
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search front, back, or notes..."
          value={filters.q || ''}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Deck Filter */}
      <div>
        <label htmlFor="deck" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Deck
        </label>
        <select
          id="deck"
          value={filters.deck_id || ''}
          onChange={handleDeckChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Decks</option>
          {decks.map(deck => (
            <option key={deck.id} value={deck.id}>
              {deck.name} ({deck.card_count})
            </option>
          ))}
        </select>
      </div>

      {/* State Filter */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          State
        </label>
        <select
          id="state"
          value={filters.state || ''}
          onChange={handleStateChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All States</option>
          <option value="new">New</option>
          <option value="learning">Learning</option>
          <option value="review">Review</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const isSelected = filters.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filters.tags && filters.tags.length > 0 && (
              <span className="mr-2">
                {filters.tags.length} tag{filters.tags.length !== 1 ? 's' : ''}
              </span>
            )}
            {filters.deck_id && <span className="mr-2">Deck filter</span>}
            {filters.state && <span className="mr-2">{filters.state}</span>}
            {filters.q && <span>"{filters.q}"</span>}
          </p>
        </div>
      )}
    </div>
  );
};
