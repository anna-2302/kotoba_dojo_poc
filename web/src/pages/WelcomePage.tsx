/**
 * Welcome Page - First-run experience with prebuilt deck import
 * Implements REQ-12 (Prebuilt N4 Decks)
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { importApi } from '../api';
import { AppHeader } from '../components/AppHeader';

export function WelcomePage() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [hasJustImported, setHasJustImported] = useState(false);

  // Check if already imported
  const { data: importStatus } = useQuery({
    queryKey: ['import-status'],
    queryFn: importApi.getStatus,
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: importApi.importPrebuilt,
    onSuccess: () => {
      setHasJustImported(true);
      // Navigate to dashboard after successful import
      setTimeout(() => navigate('/'), 1500);
    },
  });

  const handleImport = () => {
    importMutation.mutate();
  };

  const handleSkip = () => {
    navigate('/');
  };

  // Only auto-redirect on first load if already imported
  // Don't redirect if user explicitly navigated here or just imported
  useEffect(() => {
    // Remove the auto-redirect - let users visit welcome page anytime
    // if (importStatus?.imported && !hasJustImported && !importMutation.isPending) {
    //   navigate('/');
    // }
  }, [importStatus, navigate, hasJustImported, importMutation.isPending]);

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
        {/* Welcome Card */}
        <div className="kd-bg-surface rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🎌 Welcome to Kotoba Dojo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your cozy Japanese learning companion
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Get started with curated beginner study materials
              </p>
            </div>

            {/* Deck Preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Vocabulary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Study essential words covering nouns, verbs, and adjectives
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
                <div className="text-3xl mb-2">🈁</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                   Kanji
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn fundamental kanji with readings and usage
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">✨</span>
                What you'll get:
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                  <span>100+ ready-to-study flashcards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                  <span>Organized by tags (verb, noun, adjective, kanji)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                  <span>Spaced-repetition scheduling ready</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                  <span>Can be customized or deleted anytime</span>
                </li>
              </ul>
            </div>

            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showDetails ? '▼ Hide details' : '▶ Show details'}
            </button>

            {showDetails && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-sm">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Data Source:</strong> Sample cards for POC demonstration.
                  Production version will use JMdict and KANJIDIC data.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Attribution:</strong> Full JMdict/KANJIDIC attribution
                  available in Settings → About section.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {importMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </span>
                ) : (
                  '📥 Import Starter Decks'
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={importMutation.isPending}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-gray-900 dark:text-white font-semibold py-4 px-6 rounded-lg
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Skip for Now
              </button>
            </div>

            {/* Success Message */}
            {importMutation.isSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-300 font-semibold">
                  ✓ Decks imported successfully! Redirecting...
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {importMutation.data?.total_cards} cards ready to study
                </p>
              </div>
            )}

            {/* Error Message */}
            {importMutation.isError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded-lg p-4 text-center">
                <p className="text-red-800 dark:text-red-300 font-semibold">
                  ✗ Import failed
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {(importMutation.error as Error)?.message || 'Please try again or skip for now'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>You can always import these decks later from the Decks page</p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
