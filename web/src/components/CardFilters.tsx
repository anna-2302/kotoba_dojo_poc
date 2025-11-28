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
    <div className="rounded-lg p-6 space-y-4" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--kd-text-primary)' }}>
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm transition-colors"
            style={{ color: 'var(--kd-link)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-link-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-link)')}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-secondary)' }}>
          Search
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search front, back, or notes..."
          value={filters.q || ''}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 rounded-md transition-all"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-primary)';
            e.currentTarget.style.outlineOffset = '0';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        />
      </div>

      {/* Deck Filter */}
      <div>
        <label htmlFor="deck" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-secondary)' }}>
          Deck
        </label>
        <select
          id="deck"
          value={filters.deck_id || ''}
          onChange={handleDeckChange}
          className="w-full px-3 py-2 rounded-md transition-all"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-primary)';
            e.currentTarget.style.outlineOffset = '0';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
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
        <label htmlFor="state" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-secondary)' }}>
          State
        </label>
        <select
          id="state"
          value={filters.state || ''}
          onChange={handleStateChange}
          className="w-full px-3 py-2 rounded-md transition-all"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-primary)';
            e.currentTarget.style.outlineOffset = '0';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
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
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const isSelected = filters.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className="px-3 py-1 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--kd-primary)' : 'var(--kd-surface-2)',
                    color: isSelected ? 'var(--kd-primary-contrast)' : 'var(--kd-text-primary)',
                    border: isSelected ? 'none' : '1px solid var(--kd-border)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--kd-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)';
                    }
                  }}
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
        <div className="pt-4" style={{ borderTop: '1px solid var(--kd-border)' }}>
          <p className="text-sm" style={{ color: 'var(--kd-text-muted)' }}>
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
