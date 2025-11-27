import React, { useState, useEffect } from 'react';
import type { Card } from '../api';

interface EditCardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<Card>) => void;
  availableTags: string[];
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
  availableTags,
}) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
      setNotes(card.notes || '');
      // Extract tag names from tag objects
      const tagNames = Array.isArray(card.tags) 
        ? card.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
        : [];
      setSelectedTags(tagNames);
    }
  }, [card]);

  // Handle ESC key globally when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(card.id, {
      front,
      back,
      notes: notes || null,
      tags: selectedTags,
    });
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddNewTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags(prev => [...prev, trimmed]);
      setNewTag('');
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
              Edit Card
            </h2>
            <button
              onClick={onClose}
              className="text-2xl"
              style={{ color: 'var(--kd-text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-text-muted)')}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Front */}
            <div>
              <label htmlFor="front" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
                Front <span style={{ color: 'var(--kd-danger)' }}>*</span>
              </label>
              <textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
                rows={3}
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

            {/* Back */}
            <div>
              <label htmlFor="back" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
                Back <span style={{ color: 'var(--kd-danger)' }}>*</span>
              </label>
              <textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                required
                rows={3}
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

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes..."
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

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                Tags
              </label>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: 'var(--kd-primary)', color: 'var(--kd-text-inverse)', opacity: 0.9 }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Available Tags */}
              {availableTags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs mb-2" style={{ color: 'var(--kd-text-secondary)' }}>Available tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => !selectedTags.includes(tag))
                      .map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className="px-2 py-1 text-xs rounded transition-colors"
                          style={{ backgroundColor: 'var(--kd-surface-2)', color: 'var(--kd-text-primary)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)')}
                        >
                          + {tag}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewTag();
                    }
                  }}
                  className="flex-1 px-3 py-1 text-sm rounded-md shadow-sm"
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
                <button
                  type="button"
                  onClick={handleAddNewTag}
                  className="px-3 py-1 text-sm rounded transition-colors"
                  style={{ backgroundColor: 'var(--kd-surface-2)', color: 'var(--kd-text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)')}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 font-medium rounded-md shadow-sm transition-all"
                style={{ backgroundColor: 'var(--kd-primary)', color: 'var(--kd-text-inverse)' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium rounded-md shadow-sm transition-colors"
                style={{ backgroundColor: 'var(--kd-surface-2)', color: 'var(--kd-text-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)')}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
