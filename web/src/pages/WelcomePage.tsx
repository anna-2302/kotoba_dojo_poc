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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--kd-bg)' }}>
        <div className="max-w-2xl w-full">
        {/* Welcome Card */}
        <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--kd-text-primary)' }}>
              🎌 Welcome to Kotoba Dojo
            </h1>
            <p className="text-xl" style={{ color: 'var(--kd-text-secondary)' }}>
              Your cozy Japanese learning companion
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg mb-6" style={{ color: 'var(--kd-text-secondary)' }}>
                Get started with curated beginner study materials
              </p>
            </div>

            {/* Deck Preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg p-6 border-2" style={{ 
                backgroundColor: 'var(--kd-primary-subtle)',
                borderColor: 'var(--kd-primary)'
              }}>
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                  Vocabulary
                </h3>
                <p className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                  Study essential words covering nouns, verbs, and adjectives
                </p>
              </div>

              <div className="rounded-lg p-6 border-2" style={{ 
                backgroundColor: 'var(--kd-accent-subtle)',
                borderColor: 'var(--kd-accent)'
              }}>
                <div className="text-3xl mb-2">🈁</div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>
                   Kanji
                </h3>
                <p className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                  Learn fundamental kanji with readings and usage
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
              <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--kd-text-primary)' }}>
                <span className="text-2xl mr-2">✨</span>
                What you'll get:
              </h3>
              <ul className="space-y-2" style={{ color: 'var(--kd-text-secondary)' }}>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--kd-success)' }}>✓</span>
                  <span>100+ ready-to-study flashcards</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--kd-success)' }}>✓</span>
                  <span>Organized by tags (verb, noun, adjective, kanji)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--kd-success)' }}>✓</span>
                  <span>Spaced-repetition scheduling ready</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--kd-success)' }}>✓</span>
                  <span>Can be customized or deleted anytime</span>
                </li>
              </ul>
            </div>

            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm hover:underline transition-colors"
              style={{ color: 'var(--kd-link)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-link-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-link)')}
            >
              {showDetails ? '▼ Hide details' : '▶ Show details'}
            </button>

            {showDetails && (
              <div className="rounded-lg p-4 text-sm border-2" style={{ 
                backgroundColor: 'var(--kd-surface-2)',
                borderColor: 'var(--kd-warning)'
              }}>
                <p className="mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
                  <strong style={{ color: 'var(--kd-text-primary)' }}>Data Source:</strong> Sample cards for POC demonstration.
                  Production version will use JMdict and KANJIDIC data.
                </p>
                <p style={{ color: 'var(--kd-text-secondary)' }}>
                  <strong style={{ color: 'var(--kd-text-primary)' }}>Attribution:</strong> Full JMdict/KANJIDIC attribution
                  available in Settings → About section.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="flex-1 font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--kd-primary)',
                  color: 'var(--kd-primary-contrast)',
                }}
                onMouseEnter={(e) => !importMutation.isPending && (e.currentTarget.style.backgroundColor = 'var(--kd-primary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-primary)')}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                {importMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: 'currentColor' }}>
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
                className="flex-1 font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--kd-surface-2)',
                  color: 'var(--kd-text-primary)',
                  border: '1px solid var(--kd-border)',
                }}
                onMouseEnter={(e) => !importMutation.isPending && (e.currentTarget.style.backgroundColor = 'var(--kd-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)')}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                Skip for Now
              </button>
            </div>

            {/* Success Message */}
            {importMutation.isSuccess && (
              <div className="border-2 rounded-lg p-4 text-center" style={{ 
                backgroundColor: 'var(--kd-surface-2)',
                borderColor: 'var(--kd-success)'
              }}>
                <p className="font-semibold" style={{ color: 'var(--kd-success)' }}>
                  ✓ Decks imported successfully! Redirecting...
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
                  {importMutation.data?.total_cards} cards ready to study
                </p>
              </div>
            )}

            {/* Error Message */}
            {importMutation.isError && (
              <div className="border-2 rounded-lg p-4 text-center" style={{ 
                backgroundColor: 'var(--kd-surface-2)',
                borderColor: 'var(--kd-danger)'
              }}>
                <p className="font-semibold" style={{ color: 'var(--kd-danger)' }}>
                  ✗ Import failed
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
                  {(importMutation.error as Error)?.message || 'Please try again or skip for now'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 text-center text-sm" style={{ borderTop: '1px solid var(--kd-divider)', color: 'var(--kd-text-muted)' }}>
            <p>You can always import these decks later from the Decks page</p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
