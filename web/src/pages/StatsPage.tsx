import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '../api';
import { StatsCard } from '../components/StatsCard';
import { AppHeader } from '../components/AppHeader';

interface ReviewStats {
  today_stats?: {
    total_reviews: number;
    again_count: number;
    good_count: number;
    easy_count: number;
  };
  session_data?: {
    ratings: Array<{
      rating: 'again' | 'good' | 'easy';
      count: number;
      percentage: number;
    }>;
  };
}

export const StatsPage: React.FC = () => {
  // Fetch review stats
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await reviewApi.getStats();
      return response as unknown as ReviewStats;
    },
    staleTime: 60000, // 1 minute
  });

  // Calculate derived stats
  const calculatedStats = useMemo(() => {
    if (!stats?.today_stats) {
      return {
        totalReviews: 0,
        retention: 0,
        retention_display: '0%',
        accuracy: 0,
        accuracy_display: '0%',
        avgEaseFactor: 2.5,
        easy_percent: 0,
        good_percent: 0,
        again_percent: 0,
      };
    }

    const {
      total_reviews,
      again_count,
      good_count,
      easy_count,
    } = stats.today_stats;

    const totalRatings = again_count + good_count + easy_count;
    const retention = totalRatings > 0
      ? ((good_count + easy_count) / totalRatings) * 100
      : 0;
    const accuracy = totalRatings > 0
      ? ((easy_count + good_count) / totalRatings) * 100
      : 0;

    return {
      totalReviews: total_reviews || 0,
      retention: Math.round(retention),
      retention_display: `${Math.round(retention)}%`,
      accuracy: Math.round(accuracy),
      accuracy_display: `${Math.round(accuracy)}%`,
      avgEaseFactor: 2.5,
      easy_percent: totalRatings > 0 ? Math.round((easy_count / totalRatings) * 100) : 0,
      good_percent: totalRatings > 0 ? Math.round((good_count / totalRatings) * 100) : 0,
      again_percent: totalRatings > 0 ? Math.round((again_count / totalRatings) * 100) : 0,
      easy_count,
      good_count,
      again_count,
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-3xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Sensei's Wisdom Banner */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">🥋</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sensei's Wisdom
            </h2>
          </div>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-center italic">
              "Young learner, why do you seek numbers when the journey itself is the treasure?"
            </p>
            
            <p>
              The true measure of progress is not found in charts and graphs, but in the knowledge growing within you. Every card you master, every review you complete—these are victories that no statistic can fully capture.
            </p>
            
            <p>
              Remember: <span className="font-semibold text-blue-600 dark:text-blue-400">The wise student trusts the path, not the map.</span> Focus on your practice, and the results will follow naturally.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              💫 The advanced statistics are being forged in the dojo... but between us, you don't need them yet. Trust your journey.
            </p>
          </div>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your learning progress and review analytics
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Total Reviews Today"
            value={calculatedStats.totalReviews}
            color="blue"
            subtext="cards reviewed"
          />
          <StatsCard
            label="Retention Rate"
            value={calculatedStats.retention_display}
            color="green"
            subtext="(Good + Easy) / Total"
          />
          <StatsCard
            label="Accuracy"
            value={calculatedStats.accuracy_display}
            color="purple"
            subtext="correct responses"
          />
          <StatsCard
            label="Avg Ease Factor"
            value={calculatedStats.avgEaseFactor.toFixed(2)}
            color="indigo"
            subtext="SM-2 difficulty"
          />
        </div>

        {/* Rating Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribution Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Today's Rating Distribution
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Easy
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {calculatedStats.easy_count} ({calculatedStats.easy_percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${calculatedStats.easy_percent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Good
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {calculatedStats.good_count} ({calculatedStats.good_percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${calculatedStats.good_percent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Again
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {calculatedStats.again_count} ({calculatedStats.again_percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${calculatedStats.again_percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Responses</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {calculatedStats.easy_count +
                    calculatedStats.good_count +
                    calculatedStats.again_count}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Correct Answers</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {calculatedStats.easy_count + calculatedStats.good_count}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Needs Review</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {calculatedStats.again_count}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Success Rate</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {calculatedStats.retention_display}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            💡 Understanding Your Stats
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Retention Rate:</strong> Percentage of cards you answered correctly
              (Good + Easy). Aim for 80%+ for optimal learning.
            </p>
            <p>
              <strong>Ease Factor:</strong> SM-2 algorithm parameter. Starts at 2.5. Increases
              with correct answers, decreases with mistakes.
            </p>
            <p>
              <strong>Rating Distribution:</strong> Shows the balance of your answers. Too
              many "Again" means cards need more review time.
            </p>
            <p>
              <strong>Accuracy:</strong> Overall percentage of correct responses, calculated
              as (Easy + Good) / Total.
            </p>
          </div>
        </div>

        {/* No Data State */}
        {calculatedStats.totalReviews === 0 && (
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-yellow-800 dark:text-yellow-200">
              No reviews yet today. Start a review session to see your statistics!
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default StatsPage;
