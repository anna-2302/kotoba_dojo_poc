import React, { useEffect } from 'react';
import type { DeckStats } from '../../types/deck';

interface DeckStatsModalProps {
  stats: DeckStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeckStatsModal: React.FC<DeckStatsModalProps> = ({
  stats,
  isOpen,
  onClose,
}) => {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 {stats.deck_name} - Statistics
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Card Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Card Distribution
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-pink-500">{stats.total_cards}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-500">{stats.due_today}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Due Today</div>
                </div>
              </div>
            </div>

            {/* Card States */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Card States
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{stats.new_cards}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">New</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">{stats.learning_cards}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Learning</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{stats.review_cards}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Review</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-500">{stats.suspended_cards}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Suspended</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">
                    {stats.average_ease.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Ease Factor</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-500">
                    {(stats.retention_rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Progress
              </h3>
              <div className="relative">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium transition-all duration-300"
                    style={{
                      width: `${stats.total_cards > 0 ? ((stats.review_cards / stats.total_cards) * 100) : 0}%`,
                    }}
                  >
                    {stats.total_cards > 0 && ((stats.review_cards / stats.total_cards) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  {stats.review_cards} of {stats.total_cards} cards in review stage
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
