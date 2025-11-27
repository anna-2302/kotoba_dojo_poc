import React, { useState } from 'react';
import type { Deck } from '../api';

export interface CardFormData {
  deck_id: number;
  front: string;
  back: string;
  notes?: string;
  tag_ids?: number[];
}

interface CardFormProps {
  decks: Deck[];
  availableTags: Array<{ id: number; name: string }>;
  onSubmit: (data: CardFormData) => void;
  isLoading?: boolean;
  error?: string;
}

export const CardForm: React.FC<CardFormProps> = ({
  decks,
  availableTags,
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<CardFormData>({
    deck_id: decks.length > 0 ? decks[0].id : 0,
    front: '',
    back: '',
    notes: '',
    tag_ids: [],
  });
  const [validationError, setValidationError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate required fields
    if (!formData.deck_id) {
      setValidationError('Please select a deck');
      return;
    }
    if (!formData.front.trim()) {
      setValidationError('Front side is required');
      return;
    }
    if (!formData.back.trim()) {
      setValidationError('Back side is required');
      return;
    }

    onSubmit({
      ...formData,
      front: formData.front.trim(),
      back: formData.back.trim(),
      notes: formData.notes?.trim() || undefined,
    });
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: (prev.tag_ids || []).includes(tagId)
        ? (prev.tag_ids || []).filter(id => id !== tagId)
        : [...(prev.tag_ids || []), tagId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Messages */}
      {error && (
        <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--kd-danger)', color: 'var(--kd-text-inverse)', border: '1px solid var(--kd-danger)' }}>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {validationError && (
        <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--kd-danger)', color: 'var(--kd-text-inverse)', border: '1px solid var(--kd-danger)' }}>
          <p className="text-sm">{validationError}</p>
        </div>
      )}

      {/* Deck Selection */}
      <div>
        <label htmlFor="deck_id" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
          Deck <span style={{ color: 'var(--kd-danger)' }}>*</span>
        </label>
        <select
          id="deck_id"
          value={formData.deck_id}
          onChange={(e) =>
            setFormData({ ...formData, deck_id: parseInt(e.target.value) })
          }
          required
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
            boxShadow: 'var(--kd-shadow-sm)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '0px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          <option value="">Select a deck</option>
          {decks.map(deck => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
      </div>

      {/* Front Side */}
      <div>
        <label htmlFor="front" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
          Front <span style={{ color: 'var(--kd-danger)' }}>*</span>
        </label>
        <p className="text-xs mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
          This will be shown first when reviewing
        </p>
        <textarea
          id="front"
          value={formData.front}
          onChange={(e) => setFormData({ ...formData, front: e.target.value })}
          placeholder="e.g., 覚える (oboeru)"
          rows={3}
          required
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
            boxShadow: 'var(--kd-shadow-sm)'
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

      {/* Back Side */}
      <div>
        <label htmlFor="back" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
          Back <span style={{ color: 'var(--kd-danger)' }}>*</span>
        </label>
        <p className="text-xs mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
          This will be shown after flipping the card
        </p>
        <textarea
          id="back"
          value={formData.back}
          onChange={(e) => setFormData({ ...formData, back: e.target.value })}
          placeholder="e.g., to remember, to memorize"
          rows={3}
          required
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
            boxShadow: 'var(--kd-shadow-sm)'
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

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
          Notes (Optional)
        </label>
        <p className="text-xs mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
          Add context or hints for this card
        </p>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="e.g., Verb, used in casual conversation"
          rows={2}
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
            boxShadow: 'var(--kd-shadow-sm)'
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

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
          Tags (Optional)
        </label>
        <p className="text-xs mb-3" style={{ color: 'var(--kd-text-secondary)' }}>
          Select tags to categorize this card for easy filtering
        </p>
        {availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
              const isSelected = (formData.tag_ids || []).includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--kd-primary)' : 'var(--kd-surface-2)',
                    color: isSelected ? 'var(--kd-text-inverse)' : 'var(--kd-text-primary)',
                    border: isSelected ? '1px solid var(--kd-primary)' : '1px solid var(--kd-border)',
                    boxShadow: isSelected ? 'var(--kd-shadow-md)' : 'none'
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
                  {tag.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm italic" style={{ color: 'var(--kd-text-secondary)' }}>
            No tags created yet. Create tags while editing a card.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isLoading ? 'var(--kd-disabled)' : 'var(--kd-primary)',
          color: 'var(--kd-text-inverse)',
          boxShadow: 'var(--kd-shadow-md)',
          opacity: isLoading ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.boxShadow = 'var(--kd-shadow-lg)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)';
          }
        }}
      >
        {isLoading ? 'Creating Card...' : 'Create Card'}
      </button>
    </form>
  );
};
