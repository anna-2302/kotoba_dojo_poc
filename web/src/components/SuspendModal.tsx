import { useEffect } from 'react';

interface SuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuspendModal({ isOpen, onClose }: SuspendModalProps) {
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg max-w-md w-full p-6 relative"
        style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ color: 'var(--kd-text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-text-muted)')}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with sensei icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">🥋</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            Sensei's Wisdom
          </h2>
        </div>

        {/* Message */}
        <div className="space-y-4" style={{ color: 'var(--kd-text-secondary)' }}>
          <p className="text-center italic">
            "Young learner, I sense hesitation in your heart..."
          </p>
          
          <p>
            The path of mastery is not found in setting knowledge aside. Every card you study is a step forward on your journey. To suspend is to pause your progress.
          </p>
          
          <p>
            Remember: <span className="font-semibold" style={{ color: 'var(--kd-primary)' }}>The bamboo that bends is stronger than the oak that resists.</span> Embrace the challenge, and you will grow stronger with each review.
          </p>
          
          <p className="text-sm text-center" style={{ color: 'var(--kd-text-muted)' }}>
            💫 The suspend feature is being refined in the dojo... but between us, you won't need it. Trust the process.
          </p>
        </div>

        {/* Footer button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 font-medium rounded-lg transition-all"
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
            I understand, Sensei 🙏
          </button>
        </div>
      </div>
    </div>
  );
}
