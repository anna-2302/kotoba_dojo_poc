/**
 * Import Banner - Prompts users to import prebuilt decks
 * Shows on dashboard if decks haven't been imported yet
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ImportBannerProps {
  onDismiss?: () => void;
}

export function ImportBanner({ onDismiss }: ImportBannerProps) {
  const navigate = useNavigate();

  const handleImport = () => {
    navigate('/welcome');
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg p-6 shadow-lg text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🎁</span>
            <h3 className="text-lg font-semibold">Get Started with JLPT N4 Decks</h3>
          </div>
          <p className="text-blue-50 mb-4">
            Import 50 curated flashcards covering essential N4 vocabulary and kanji to start your learning journey
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleImport}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-2 rounded-lg
                       transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              📥 Import Now
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-blue-700/50 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg
                         transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-blue-100 hover:text-white focus:outline-none"
            aria-label="Dismiss"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default ImportBanner;
