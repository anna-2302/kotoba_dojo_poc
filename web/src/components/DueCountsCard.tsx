import type { QueueStats } from '../api';

interface DueCountsCardProps {
  stats: QueueStats;
  onStartReview: () => void;
  isLoading?: boolean;
}

export function DueCountsCard({ stats, onStartReview, isLoading }: DueCountsCardProps) {
  const hasCards = stats.total_due > 0;

  return (
    <div 
      className="rounded-lg p-6 transition-shadow" 
      style={{ 
        backgroundColor: 'var(--kd-surface)', 
        boxShadow: 'var(--kd-shadow-md)' 
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--kd-shadow-lg)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)')}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--kd-text-primary)' }}>
            Today's Reviews
          </h2>
          <p className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
            Cards ready for your review session
          </p>
        </div>
      </div>

      {/* Due Counts Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Learning Due */}
        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--kd-warning)' }}>
            {stats.learning_due}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
            Learning
          </div>
        </div>

        {/* Reviews Due */}
        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--kd-primary)' }}>
            {stats.reviews_due}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
            Review
          </div>
        </div>

        {/* New Available */}
        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--kd-success)' }}>
            {stats.new_available}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
            New
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 mb-4" style={{ borderTop: '1px solid var(--kd-divider)' }}>
        <div className="flex justify-between items-center">
          <span className="font-medium" style={{ color: 'var(--kd-text-secondary)' }}>
            Total Due
          </span>
          <span className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            {stats.total_due}
          </span>
        </div>
      </div>

      {/* Start Review Button */}
      <button
        onClick={onStartReview}
        disabled={!hasCards || isLoading}
        className="w-full py-3 px-6 rounded-lg font-medium transition-all focus:outline-none"
        style={{
          backgroundColor: hasCards && !isLoading ? 'var(--kd-primary)' : 'var(--kd-disabled)',
          color: 'var(--kd-text-inverse)',
          cursor: hasCards && !isLoading ? 'pointer' : 'not-allowed',
          opacity: hasCards && !isLoading ? 1 : 0.6,
        }}
        onMouseEnter={(e) => hasCards && !isLoading && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => hasCards && !isLoading && (e.currentTarget.style.opacity = '1')}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
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
        <p className="text-center mt-4 text-sm" style={{ color: 'var(--kd-text-muted)' }}>
          🎉 All caught up! Check back later or add more cards.
        </p>
      )}
    </div>
  );
}
