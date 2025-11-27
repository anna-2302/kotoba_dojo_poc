interface QuickStatsCardProps {
  reviewedToday: number;
  retention: number;
  streak: number;
}

export function QuickStatsCard({ reviewedToday, retention, streak }: QuickStatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Quick Stats
      </h2>

      <div className="space-y-4">
        {/* Reviews Today */}
        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
          <span className="text-gray-700 dark:text-gray-300">
            Reviewed Today
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {reviewedToday}
          </span>
        </div>

        {/* Retention Rate */}
        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
          <span className="text-gray-700 dark:text-gray-300">
            Retention Rate
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {retention.toFixed(0)}%
          </span>
        </div>

        {/* Study Streak */}
        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
          <span className="text-gray-700 dark:text-gray-300">
            Study Streak
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Encouragement Message - Only show if user has reviewed today */}
      {reviewedToday > 0 && retention >= 80 ? (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-center text-green-700 dark:text-green-300 text-sm">
            ⭐ Excellent work! Keep it up!
          </p>
        </div>
      ) : reviewedToday > 0 && retention < 80 ? (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-center text-yellow-700 dark:text-yellow-300 text-sm">
            📚 Keep practicing, you're doing great!
          </p>
        </div>
      ) : null}
    </div>
  );
}
