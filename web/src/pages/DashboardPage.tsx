import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { reviewApi, statsApi } from '../api';
import { SessionDueCountsCard } from '../components/SessionDueCountsCard';
import { QuickStatsCard } from '../components/QuickStatsCard';
import { AppHeader } from '../components/AppHeader';

export function DashboardPage() {
  const navigate = useNavigate();

  // Fetch session-based queue stats
  const { data: sessionStats, isLoading: sessionLoading, error: sessionError, refetch: refetchSession } = useQuery({
    queryKey: ['sessionStats', 'all'],
    queryFn: () => reviewApi.getSessionStats('all'),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });

  // Fetch today's stats
  const { data: todayStats, isLoading: todayLoading, refetch: refetchToday } = useQuery({
    queryKey: ['todayStats'],
    queryFn: statsApi.getToday,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  // Refetch data when page becomes visible (e.g., returning from review)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchSession();
        refetchToday();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchSession, refetchToday]);

  // Also refetch when component mounts (returning from navigation)
  useEffect(() => {
    refetchSession();
    refetchToday();
  }, []);

  // Keyboard shortcut: R to start review
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        const hasCards = sessionStats && sessionStats.total_available > 0;
        
        if (hasCards) {
          navigate('/review');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, sessionStats]);

  const handleStartReview = () => {
    navigate('/review');
  };

  // Navigation handlers
  const handleNavigateToDecks = () => navigate('/decks');

  const handleNavigateToCards = () => navigate('/cards');
  const handleNavigateToWelcome = () => navigate('/welcome');

  // Loading state
  if (sessionLoading || todayLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--kd-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--kd-primary)' }}></div>
          <p style={{ color: 'var(--kd-text-secondary)' }}>
            Loading review session...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--kd-bg)' }}>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4" style={{ color: 'var(--kd-danger)' }}>⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--kd-text-primary)' }}>
            Connection Error
          </h2>
          <p className="mb-6" style={{ color: 'var(--kd-text-secondary)' }}>
            Could not connect to the server. Make sure the backend is running.
          </p>
          <button
            onClick={() => refetchSession()}
            className="px-6 py-3 rounded-lg transition-all focus:outline-none"
            style={{
              backgroundColor: 'var(--kd-primary)',
              color: 'var(--kd-text-inverse)',
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--kd-bg)' }}>
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Due Counts - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            {sessionStats && (
              <SessionDueCountsCard
                stats={sessionStats}
                onStartSession={handleStartReview}
                isLoading={sessionLoading}
              />
            )}
          </div>

          {/* Quick Stats - Takes 1 column */}
          <div>
            {todayStats && (
              <QuickStatsCard
                reviewedToday={todayStats.reviewed_today}
                retention={todayStats.retention_rate}
                streak={todayStats.study_streak}
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleNavigateToCards}
            className="p-6 rounded-lg transition-all text-left focus:outline-none"
            style={{ 
              backgroundColor: 'var(--kd-accent-ocean, var(--kd-accent-sakura, var(--kd-primary)))', 
              boxShadow: 'var(--kd-shadow-md)' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--kd-shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.opacity = '0.95';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.opacity = '1';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--kd-text-inverse)' }}>➕</div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--kd-text-inverse)' }}>
                Add Cards
              </h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--kd-text-inverse)', opacity: 0.9 }}>
              Create new flashcards to expand your study collection
            </p>
          </button>

          <button 
            onClick={handleNavigateToDecks}
            className="p-6 rounded-lg transition-all text-left focus:outline-none"
            style={{ 
              backgroundColor: 'var(--kd-accent-sky, var(--kd-accent-matcha, var(--kd-accent)))', 
              boxShadow: 'var(--kd-shadow-md)' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--kd-shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.opacity = '0.95';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.opacity = '1';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--kd-text-inverse)' }}>📚</div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--kd-text-inverse)' }}>
                Manage Decks
              </h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--kd-text-inverse)', opacity: 0.9 }}>
              Organize and configure your study decks
            </p>
          </button>

          <button 
            onClick={handleNavigateToWelcome}
            className="p-6 rounded-lg transition-all text-left focus:outline-none"
            style={{ 
              backgroundColor: 'var(--kd-accent-lagoon, var(--kd-primary))', 
              boxShadow: 'var(--kd-shadow-md)' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--kd-shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.opacity = '0.95';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.opacity = '1';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--kd-text-inverse)' }}>📥</div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--kd-text-inverse)' }}>
                Import Decks
              </h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--kd-text-inverse)', opacity: 0.9 }}>
              Get started with prebuilt JLPT N4 decks
            </p>
          </button>
        </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-sm" style={{ color: 'var(--kd-text-muted)' }}>
          <p>Made with ❤️ for Japanese language learners</p>
        </footer>
      </div>
    </>
  );
}
