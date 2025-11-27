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
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      {validationError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-300">{validationError}</p>
        </div>
      )}

      {/* Deck Selection */}
      <div>
        <label htmlFor="deck_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Deck <span className="text-red-500">*</span>
        </label>
        <select
          id="deck_id"
          value={formData.deck_id}
          onChange={(e) =>
            setFormData({ ...formData, deck_id: parseInt(e.target.value) })
          }
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        <label htmlFor="front" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Front <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          This will be shown first when reviewing
        </p>
        <textarea
          id="front"
          value={formData.front}
          onChange={(e) => setFormData({ ...formData, front: e.target.value })}
          placeholder="e.g., 覚える (oboeru)"
          rows={3}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Back Side */}
      <div>
        <label htmlFor="back" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Back <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          This will be shown after flipping the card
        </p>
        <textarea
          id="back"
          value={formData.back}
          onChange={(e) => setFormData({ ...formData, back: e.target.value })}
          placeholder="e.g., to remember, to memorize"
          rows={3}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (Optional)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Add context or hints for this card
        </p>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="e.g., Verb, used in casual conversation"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (Optional)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Select tags to categorize this card for easy filtering
        </p>
        {availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  (formData.tag_ids || []).includes(tag.id)
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No tags created yet. Create tags while editing a card.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Card...' : 'Create Card'}
      </button>
    </form>
  );
};
