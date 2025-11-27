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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with sensei icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">🥋</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sensei's Wisdom
          </h2>
        </div>

        {/* Message */}
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p className="text-center italic">
            "Young learner, I sense hesitation in your heart..."
          </p>
          
          <p>
            The path of mastery is not found in setting knowledge aside. Every card you study is a step forward on your journey. To suspend is to pause your progress.
          </p>
          
          <p>
            Remember: <span className="font-semibold text-blue-600 dark:text-blue-400">The bamboo that bends is stronger than the oak that resists.</span> Embrace the challenge, and you will grow stronger with each review.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            💫 The suspend feature is being refined in the dojo... but between us, you won't need it. Trust the process.
          </p>
        </div>

        {/* Footer button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            I understand, Sensei 🙏
          </button>
        </div>
      </div>
    </div>
  );
}
