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
        <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
          Deck Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: `1px solid ${errors.name ? 'var(--kd-danger)' : 'var(--kd-border)'}`,
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          placeholder="e.g., JLPT N4 Vocabulary"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm" style={{ color: 'var(--kd-danger)' }}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          placeholder="Optional description for this deck"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="new_per_day" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
            Daily New Cards
          </label>
          <input
            type="number"
            id="new_per_day"
            value={formData.new_per_day ?? ''}
            onChange={(e) =>
              handleChange('new_per_day', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--kd-surface-2)',
              color: 'var(--kd-text-primary)',
              border: `1px solid ${errors.new_per_day ? 'var(--kd-danger)' : 'var(--kd-border)'}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            placeholder="Default: 15"
            min="0"
            disabled={isLoading}
          />
          {errors.new_per_day && (
            <p className="mt-1 text-sm" style={{ color: 'var(--kd-danger)' }}>{errors.new_per_day}</p>
          )}
        </div>

        <div>
          <label htmlFor="review_per_day" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
            Daily Review Cards
          </label>
          <input
            type="number"
            id="review_per_day"
            value={formData.review_per_day ?? ''}
            onChange={(e) =>
              handleChange('review_per_day', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--kd-surface-2)',
              color: 'var(--kd-text-primary)',
              border: `1px solid ${errors.review_per_day ? 'var(--kd-danger)' : 'var(--kd-border)'}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            placeholder="Default: 200"
            min="0"
            disabled={isLoading}
          />
          {errors.review_per_day && (
            <p className="mt-1 text-sm" style={{ color: 'var(--kd-danger)' }}>{errors.review_per_day}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--kd-surface-2)',
            color: 'var(--kd-text-primary)',
            border: '1px solid var(--kd-border)',
            opacity: isLoading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)')}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--kd-primary)',
            color: 'var(--kd-text-inverse)',
            opacity: isLoading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.opacity = '1')}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {isLoading ? 'Saving...' : deck ? 'Update Deck' : 'Create Deck'}
        </button>
      </div>
    </form>
  );
};
