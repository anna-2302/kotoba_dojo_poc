import { useEffect } from 'react';
import type { Card } from '../api';

interface DeleteCardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCardModal({ card, isOpen, onClose, onConfirm }: DeleteCardModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg max-w-md w-full p-6"
        style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            Delete Card
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--kd-text-secondary)' }}>
            Are you sure you want to delete this card? This action cannot be undone.
          </p>
        </div>

        {/* Card preview */}
        <div 
          className="p-4 rounded-lg mb-6"
          style={{ backgroundColor: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}
        >
          <div className="mb-2">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--kd-text-muted)' }}>
              Front
            </div>
            <div className="font-medium" style={{ color: 'var(--kd-text-primary)' }}>
              {card.front}
            </div>
          </div>
          {card.back && (
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--kd-text-muted)' }}>
                Back
              </div>
              <div style={{ color: 'var(--kd-text-secondary)' }}>
                {card.back}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium rounded-lg transition-all"
            style={{
              backgroundColor: 'var(--kd-surface-2)',
              color: 'var(--kd-text-primary)',
              border: '1px solid var(--kd-border)'
            }}
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
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 font-medium rounded-lg transition-all"
            style={{
              backgroundColor: 'var(--kd-danger)',
              color: 'var(--kd-text-inverse)'
            }}
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
            Delete Card
          </button>
        </div>
      </div>
    </div>
  );
}
