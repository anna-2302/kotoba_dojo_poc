import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewApi, statsApi } from '../api';
import type { SessionStatsAnalytics } from '../api';
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

  // Fetch session analytics
  const { data: sessionStats, isLoading: sessionLoading } = useQuery<SessionStatsAnalytics>({
    queryKey: ['session-stats'],
    queryFn: () => statsApi.getSessions(),
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

  if (isLoading || sessionLoading) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--kd-bg)' }}>
          <div className="text-center">
            <div className="text-3xl mb-4">📊</div>
            <p style={{ color: 'var(--kd-text-secondary)' }}>Loading statistics...</p>
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--kd-bg)' }}>
          <div className="text-center">
            <div className="text-3xl mb-4">⚠️</div>
            <p style={{ color: 'var(--kd-danger)' }}>Failed to load statistics</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--kd-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Session Analytics Banner */}
        <div className="mb-6 rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}>
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">📊</div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
              Session Analytics
            </h2>
            <p style={{ color: 'var(--kd-text-secondary)' }}>
              Detailed insights from your review sessions
            </p>
          </div>
          
          {sessionStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--kd-primary)' }}>
                  {sessionStats.total_sessions}
                </div>
                <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                  Total Sessions
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--kd-success)' }}>
                  {Math.round(sessionStats.average_completion_rate)}%
                </div>
                <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                  Avg Completion
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--kd-warning)' }}>
                  {sessionStats.section_completions.new_section_completions}
                </div>
                <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                  New Sections Done
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--kd-info)' }}>
                  {sessionStats.section_completions.review_section_completions}
                </div>
                <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                  Review Sections Done
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--kd-text-primary)' }}>
           Statistics
          </h1>
          <p style={{ color: 'var(--kd-text-secondary)' }}>
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

        {/* Session Performance Trends */}
        {sessionStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kd-text-primary)' }}>
              Session Performance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>Performance Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--kd-text-secondary)' }}>Again:</span>
                    <span style={{ color: 'var(--kd-danger)' }}>{Math.round(sessionStats.performance_trends.again_percentage)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--kd-text-secondary)' }}>Good:</span>
                    <span style={{ color: 'var(--kd-primary)' }}>{Math.round(sessionStats.performance_trends.good_percentage)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--kd-text-secondary)' }}>Easy:</span>
                    <span style={{ color: 'var(--kd-success)' }}>{Math.round(sessionStats.performance_trends.easy_percentage)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>Section Completions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--kd-text-secondary)' }}>New:</span>
                    <span style={{ color: 'var(--kd-warning)' }}>{sessionStats.section_completions.new_section_completions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--kd-text-secondary)' }}>Learning:</span>
                    <span style={{ color: 'var(--kd-info)' }}>{sessionStats.section_completions.learning_section_completions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--kd-text-secondary)' }}>Review:</span>
                    <span style={{ color: 'var(--kd-success)' }}>{sessionStats.section_completions.review_section_completions}</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>Trend Analysis</h3>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {sessionStats.performance_trends.improvement_trend === 'improving' ? '📈' : 
                     sessionStats.performance_trends.improvement_trend === 'declining' ? '📉' : '📊'}
                  </div>
                  <div className="text-sm font-medium" style={{ 
                    color: sessionStats.performance_trends.improvement_trend === 'improving' ? 'var(--kd-success)' :
                           sessionStats.performance_trends.improvement_trend === 'declining' ? 'var(--kd-danger)' :
                           'var(--kd-info)'
                  }}>
                    {sessionStats.performance_trends.improvement_trend === 'improving' ? 'Improving' :
                     sessionStats.performance_trends.improvement_trend === 'declining' ? 'Needs Focus' : 'Stable'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Daily Session History */}
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--kd-text-primary)' }}>Recent Session Activity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sessionStats.daily_sessions.slice(0, 6).map((day, index) => (
                  <div key={index} className="p-3 rounded" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--kd-text-secondary)' }}>
                      {new Date(day.date).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--kd-text-primary)' }}>
                          {day.session_count} sessions
                        </div>
                        <div className="text-xs" style={{ color: 'var(--kd-text-secondary)' }}>
                          {day.cards_reviewed} cards
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: 'var(--kd-success)' }}>
                          {Math.round(day.completion_rate)}%
                        </div>
                        <div className="text-xs" style={{ color: 'var(--kd-text-secondary)' }}>
                          completed
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribution Cards */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--kd-text-primary)' }}>
              Today's Rating Distribution
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--kd-text-primary)' }}>
                    Easy
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--kd-success)' }}>
                    {calculatedStats.easy_count} ({calculatedStats.easy_percent}%)
                  </span>
                </div>
                <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: `${calculatedStats.easy_percent}%`, backgroundColor: 'var(--kd-success)' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--kd-text-primary)' }}>
                    Good
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--kd-primary)' }}>
                    {calculatedStats.good_count} ({calculatedStats.good_percent}%)
                  </span>
                </div>
                <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: `${calculatedStats.good_percent}%`, backgroundColor: 'var(--kd-primary)' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--kd-text-primary)' }}>
                    Again
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--kd-danger)' }}>
                    {calculatedStats.again_count} ({calculatedStats.again_percent}%)
                  </span>
                </div>
                <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: `${calculatedStats.again_percent}%`, backgroundColor: 'var(--kd-danger)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Info */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--kd-text-primary)' }}>
              Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
                <span className="font-medium" style={{ color: 'var(--kd-text-primary)' }}>Total Responses</span>
                <span className="font-bold" style={{ color: 'var(--kd-text-primary)' }}>
                  {(calculatedStats.easy_count || 0) +
                    (calculatedStats.good_count || 0) +
                    (calculatedStats.again_count || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-success-bg)' }}>
                <span className="font-medium" style={{ color: 'var(--kd-text-primary)' }}>Correct Answers</span>
                <span className="font-bold" style={{ color: 'var(--kd-success)' }}>
                  {(calculatedStats.easy_count || 0) + (calculatedStats.good_count || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-danger-bg)' }}>
                <span className="font-medium" style={{ color: 'var(--kd-text-primary)' }}>Needs Review</span>
                <span className="font-bold" style={{ color: 'var(--kd-danger)' }}>
                  {calculatedStats.again_count}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-primary-bg)' }}>
                <span className="font-medium" style={{ color: 'var(--kd-text-primary)' }}>Success Rate</span>
                <span className="font-bold" style={{ color: 'var(--kd-primary)' }}>
                  {calculatedStats.retention_display}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default StatsPage;
