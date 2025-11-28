import type { SessionStats } from '../api';

interface SessionDueCountsCardProps {
  stats: SessionStats;
  onStartSession: () => void;
  isLoading?: boolean;
}

export function SessionDueCountsCard({ stats, onStartSession, isLoading }: SessionDueCountsCardProps) {
  const hasCards = stats.total_available > 0;
  const { sections } = stats;

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
            Session Ready
          </h2>
          <p className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
            Cards organized in structured sections
          </p>
        </div>
      </div>

      {/* Section Progress Overview */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium" style={{ color: 'var(--kd-text-secondary)' }}>
            Session Structure
          </span>
          <span className="text-sm" style={{ color: 'var(--kd-text-muted)' }}>
            {hasCards ? `${stats.total_available} cards available` : 'No cards available'}
          </span>
        </div>
        
        {/* Section Flow Visualization */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--kd-success)' }}></div>
            <span style={{ color: 'var(--kd-text-secondary)' }}>New</span>
          </div>
          <div className="flex-1 h-0.5" style={{ backgroundColor: 'var(--kd-divider)' }}></div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--kd-warning)' }}></div>
            <span style={{ color: 'var(--kd-text-secondary)' }}>Learning</span>
          </div>
          <div className="flex-1 h-0.5" style={{ backgroundColor: 'var(--kd-divider)' }}></div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--kd-primary)' }}></div>
            <span style={{ color: 'var(--kd-text-secondary)' }}>Review</span>
          </div>
        </div>
        
        {/* Section Counts Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* New Cards */}
          <div className="text-center p-3 rounded-lg border-2" 
               style={{ 
                 backgroundColor: hasCards && sections.new > 0 ? 'rgba(34, 197, 94, 0.1)' : 'var(--kd-surface)',
                 borderColor: hasCards && sections.new > 0 ? 'var(--kd-success)' : 'var(--kd-divider)'
               }}>
            <div className="text-2xl font-bold" style={{ 
              color: hasCards && sections.new > 0 ? 'var(--kd-success)' : 'var(--kd-text-muted)' 
            }}>
              {sections.new}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
              New Cards
            </div>
            {stats.remaining.new < sections.new && (
              <div className="text-xs mt-1" style={{ color: 'var(--kd-warning)' }}>
                (limited to {stats.remaining.new})
              </div>
            )}
          </div>

          {/* Learning Cards */}
          <div className="text-center p-3 rounded-lg border-2" 
               style={{ 
                 backgroundColor: hasCards && sections.learning > 0 ? 'rgba(251, 191, 36, 0.1)' : 'var(--kd-surface)',
                 borderColor: hasCards && sections.learning > 0 ? 'var(--kd-warning)' : 'var(--kd-divider)'
               }}>
            <div className="text-2xl font-bold" style={{ 
              color: hasCards && sections.learning > 0 ? 'var(--kd-warning)' : 'var(--kd-text-muted)' 
            }}>
              {sections.learning}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
              Learning
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--kd-text-muted)' }}>
              (no limit)
            </div>
          </div>

          {/* Review Cards */}
          <div className="text-center p-3 rounded-lg border-2" 
               style={{ 
                 backgroundColor: hasCards && sections.review > 0 ? 'rgba(59, 130, 246, 0.1)' : 'var(--kd-surface)',
                 borderColor: hasCards && sections.review > 0 ? 'var(--kd-primary)' : 'var(--kd-divider)'
               }}>
            <div className="text-2xl font-bold" style={{ 
              color: hasCards && sections.review > 0 ? 'var(--kd-primary)' : 'var(--kd-text-muted)' 
            }}>
              {sections.review}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
              Review
            </div>
            {stats.remaining.reviews < sections.review && (
              <div className="text-xs mt-1" style={{ color: 'var(--kd-warning)' }}>
                (limited to {stats.remaining.reviews})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--kd-text-secondary)' }}>
            Today's Progress
          </span>
          <span className="text-xs" style={{ color: 'var(--kd-text-muted)' }}>
            {stats.today.date}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--kd-text-secondary)' }}>Reviewed:</span>
            <span style={{ color: 'var(--kd-text-primary)' }}>
              {stats.today.reviews_done} / {stats.limits.review_per_day}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--kd-text-secondary)' }}>New Added:</span>
            <span style={{ color: 'var(--kd-text-primary)' }}>
              {stats.today.introduced_new} / {stats.limits.new_per_day}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {hasCards && !isLoading ? (
        <button
          onClick={onStartSession}
          className="w-full py-4 px-6 rounded-lg font-medium transition-all focus:outline-none"
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
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🚀</span>
            <div>
              <div>Start Review Session</div>
              <div className="text-xs opacity-90">
                {stats.total_available} cards • New → Learning → Review
              </div>
            </div>
          </div>
        </button>
      ) : (
        <button
          disabled={true}
          className="w-full py-3 px-6 rounded-lg font-medium"
          style={{
            backgroundColor: 'var(--kd-disabled)',
            color: 'var(--kd-text-inverse)',
            cursor: 'not-allowed',
            opacity: 0.6,
          }}
        >
          {isLoading ? 'Loading review session...' : 'No Cards Available'}
        </button>
      )}

      {!hasCards && !isLoading && (
        <div className="text-center mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-sm mb-2" style={{ color: 'var(--kd-text-primary)' }}>
            All caught up!
          </p>
          <p className="text-xs" style={{ color: 'var(--kd-text-muted)' }}>
            Check back later or add more cards to continue studying.
          </p>
        </div>
      )}
    </div>
  );
}