import React, { useEffect } from 'react';
import { CardForm } from './CardForm';
import type { CardCreateRequest, Deck, Tag } from '../api';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CardCreateRequest) => void;
  decks: Deck[];
  availableTags: Tag[];
  isLoading?: boolean;
  error?: string;
}

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  decks,
  availableTags,
  isLoading,
  error,
}) => {
  // Handle Escape key to close modal
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--kd-surface)',
          boxShadow: 'var(--kd-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
              Create New Card
            </h2>
            <button
              onClick={onClose}
              className="text-2xl transition-colors"
              style={{ color: 'var(--kd-text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-text-muted)')}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <CardForm
            decks={decks}
            availableTags={availableTags}
            onSubmit={onSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
