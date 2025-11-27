import type { QueueStats } from '../api';

interface DueCountsCardProps {
  stats: QueueStats;
  onStartReview: () => void;
  isLoading?: boolean;
}

export function DueCountsCard({ stats, onStartReview, isLoading }: DueCountsCardProps) {
  const hasCards = stats.total_due > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Today's Reviews
      </h2>

      {/* Due Counts Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Learning Due */}
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.learning_due}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Learning
          </div>
        </div>

        {/* Reviews Due */}
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.reviews_due}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review
          </div>
        </div>

        {/* New Available */}
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.new_available}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            New
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Total Due
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total_due}
          </span>
        </div>
      </div>

      {/* Start Review Button */}
      <button
        onClick={onStartReview}
        disabled={!hasCards || isLoading}
        className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all ${
          hasCards && !isLoading
            ? 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          'Loading...'
        ) : hasCards ? (
          <>
            Start Review Session
            <span className="ml-2 text-sm opacity-75">(Press R)</span>
          </>
        ) : (
          'No Cards Due'
        )}
      </button>

      {!hasCards && !isLoading && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
          🎉 All caught up! Check back later or add more cards.
        </p>
      )}
    </div>
  );
}
