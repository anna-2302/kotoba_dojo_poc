import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { reviewApi, statsApi } from '../api';
import { DueCountsCard } from '../components/DueCountsCard';
import { QuickStatsCard } from '../components/QuickStatsCard';
import { AppHeader } from '../components/AppHeader';

export function DashboardPage() {
  const navigate = useNavigate();

  // Fetch queue stats
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['reviewStats'],
    queryFn: reviewApi.getStats,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });

  // Fetch today's stats
  const { data: todayStats, isLoading: todayLoading } = useQuery({
    queryKey: ['todayStats'],
    queryFn: statsApi.getToday,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  // Keyboard shortcut: R to start review
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        if (stats && stats.total_due > 0) {
          navigate('/review');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, stats]);

  const handleStartReview = () => {
    navigate('/review');
  };

  // Navigation handlers
  const handleNavigateToDecks = () => navigate('/decks');
  const handleNavigateToBrowse = () => navigate('/browse');
  const handleNavigateToStats = () => navigate('/stats');
  const handleNavigateToSettings = () => navigate('/settings');
  const handleNavigateToCards = () => navigate('/cards');
  const handleNavigateToWelcome = () => navigate('/welcome');

  // Loading state
  if (isLoading || todayLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your stats...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Could not connect to the server. Make sure the backend is running.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Due Counts - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            {stats && (
              <DueCountsCard
                stats={stats}
                onStartReview={handleStartReview}
                isLoading={isLoading}
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
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-2">➕</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Add Cards
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create new flashcards
            </p>
          </button>

          <button 
            onClick={handleNavigateToDecks}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Manage Decks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Organize your decks
            </p>
          </button>

          <button 
            onClick={handleNavigateToWelcome}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-2">📥</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Import Decks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start with importing starter decks
            </p>
          </button>
        </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Made with ❤️ for Japanese language learners</p>
        </footer>
      </div>
    </>
  );
}
