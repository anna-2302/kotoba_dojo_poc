import React, { useEffect } from 'react';

interface DeleteDeckModalProps {
  deckName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteDeckModal: React.FC<DeleteDeckModalProps> = ({
  deckName,
  isOpen,
  onClose,
  onConfirm,
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg max-w-md w-full m-4 p-6"
        style={{
          backgroundColor: 'var(--kd-surface)',
          boxShadow: 'var(--kd-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            ⚠️ Delete Deck
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

        {/* Content */}
        <div className="mb-6">
          <p className="text-base mb-3" style={{ color: 'var(--kd-text-primary)' }}>
            Are you sure you want to delete <span className="font-semibold">"{deckName}"</span>?
          </p>
          <p className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
            This action cannot be undone. All cards in this deck will be permanently deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-md font-medium transition-all"
            style={{
              backgroundColor: 'var(--kd-danger)',
              color: 'var(--kd-text-inverse)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Delete Deck
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md font-medium transition-all"
            style={{
              backgroundColor: 'var(--kd-bg-subtle)',
              color: 'var(--kd-text-primary)',
              border: '1px solid var(--kd-border)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-bg-elevated)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-bg-subtle)')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
