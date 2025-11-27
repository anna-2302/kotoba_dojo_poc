import React, { useState } from 'react';
import type { Deck, CardFilters as FilterType } from '../api';

interface CardFiltersProps {
  filters: FilterType;
  decks: Deck[];
  tags: string[];
  onChange: (filters: FilterType) => void;
  onReset: () => void;
  totalCards?: number;
}

export const CardFilters: React.FC<CardFiltersProps> = ({
  filters,
  decks,
  tags,
  onChange,
  onReset,
  totalCards,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
        <button
          onClick={onReset}
          className="text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!hasActiveFilters}
          style={{ color: 'var(--kd-link)' }}
          onMouseEnter={(e) => !hasActiveFilters || (e.currentTarget.style.color = 'var(--kd-link-hover)')}
          onMouseLeave={(e) => !hasActiveFilters || (e.currentTarget.style.color = 'var(--kd-link)')}
        >
          Clear all
        </button>
      </div>

      {/* Cards Counter - Small inline */}
      {totalCards !== undefined && (
        <p className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
          <span className="font-semibold" style={{ color: 'var(--kd-text-primary)' }}>
            {totalCards}
          </span>
          {' '}card{totalCards !== 1 ? 's' : ''}
        </p>
      )}

      {/* Search - Always Visible */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
          Search
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search front, back, or notes..."
          value={filters.q || ''}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 rounded-md shadow-sm"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '0px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        />
      </div>

      {/* Expandable Filters Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors"
        style={{
          color: 'var(--kd-text-primary)',
          backgroundColor: isExpanded ? 'var(--kd-hover)' : 'transparent'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isExpanded ? 'var(--kd-hover)' : 'transparent')}
      >
        <span>More Filters</span>
        <span className="text-lg">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Expandable Filters Section */}
      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Deck Filter */}
          <div>
            <label htmlFor="deck" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
              Deck
            </label>
            <input
              id="deck"
              type="text"
              list="decks-list"
              placeholder="Select or type deck name..."
              value={filters.deck_id ? decks.find(d => d.id === filters.deck_id)?.name || '' : ''}
              onChange={(e) => {
                const value = e.target.value;
                const matchedDeck = decks.find(d => d.name === value);
                onChange({
                  ...filters,
                  deck_id: matchedDeck ? matchedDeck.id : undefined,
                  page: 1,
                });
              }}
              className="w-full px-3 py-2 rounded-md shadow-sm"
              style={{
                backgroundColor: 'var(--kd-surface-2)',
                color: 'var(--kd-text-primary)',
                border: '1px solid var(--kd-border)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                e.currentTarget.style.outlineOffset = '0px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            />
            <datalist id="decks-list">
              {decks.map(deck => (
                <option key={deck.id} value={deck.name}>
                  {deck.name} ({deck.card_count})
                </option>
              ))}
            </datalist>
          </div>

          {/* State Filter */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
              State
            </label>
            <select
              id="state"
              value={filters.state || ''}
              onChange={handleStateChange}
              className="w-full px-3 py-2 rounded-md shadow-sm"
              style={{
                backgroundColor: 'var(--kd-surface-2)',
                color: 'var(--kd-text-primary)',
                border: '1px solid var(--kd-border)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                e.currentTarget.style.outlineOffset = '0px';
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const isSelected = filters.tags?.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'var(--kd-primary)' : 'var(--kd-surface-2)',
                        color: isSelected ? 'var(--kd-text-inverse)' : 'var(--kd-text-primary)'
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
        </div>
      )}
    </div>
  );
};
