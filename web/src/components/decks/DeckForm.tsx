import React, { useState } from 'react';
import type { Deck, CreateDeckRequest } from '../../types/deck';

interface DeckFormProps {
  deck?: Deck;
  onSubmit: (data: CreateDeckRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeckForm: React.FC<DeckFormProps> = ({
  deck,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateDeckRequest>({
    name: deck?.name || '',
    description: deck?.description || '',
    new_per_day: deck?.new_per_day,
    review_per_day: deck?.review_per_day,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Deck name is required';
    }

    if (formData.new_per_day !== undefined && formData.new_per_day < 0) {
      newErrors.new_per_day = 'Must be a positive number';
    }

    if (formData.review_per_day !== undefined && formData.review_per_day < 0) {
      newErrors.review_per_day = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    field: keyof CreateDeckRequest,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Deck Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="e.g., JLPT N4 Vocabulary"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
          placeholder="Optional description for this deck"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="new_per_day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Daily New Cards
          </label>
          <input
            type="number"
            id="new_per_day"
            value={formData.new_per_day ?? ''}
            onChange={(e) =>
              handleChange('new_per_day', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
              errors.new_per_day ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Default: 15"
            min="0"
            disabled={isLoading}
          />
          {errors.new_per_day && (
            <p className="mt-1 text-sm text-red-500">{errors.new_per_day}</p>
          )}
        </div>

        <div>
          <label htmlFor="review_per_day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Daily Review Cards
          </label>
          <input
            type="number"
            id="review_per_day"
            value={formData.review_per_day ?? ''}
            onChange={(e) =>
              handleChange('review_per_day', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
              errors.review_per_day ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Default: 200"
            min="0"
            disabled={isLoading}
          />
          {errors.review_per_day && (
            <p className="mt-1 text-sm text-red-500">{errors.review_per_day}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : deck ? 'Update Deck' : 'Create Deck'}
        </button>
      </div>
    </form>
  );
};
