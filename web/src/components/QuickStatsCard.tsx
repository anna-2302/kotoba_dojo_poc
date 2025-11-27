interface QuickStatsCardProps {
  reviewedToday: number;
  retention: number;
  streak: number;
}

export function QuickStatsCard({ reviewedToday, retention, streak }: QuickStatsCardProps) {
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
            Quick Stats
          </h2>
          <p className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
            Your performance today
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Reviews Today */}
        <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
          <span style={{ color: 'var(--kd-text-secondary)' }}>
            Reviewed Today
          </span>
          <span className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            {reviewedToday}
          </span>
        </div>

        {/* Retention Rate */}
        <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
          <span style={{ color: 'var(--kd-text-secondary)' }}>
            Retention Rate
          </span>
          <span className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            {retention.toFixed(0)}%
          </span>
        </div>

        {/* Study Streak */}
        <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-surface-2)' }}>
          <span style={{ color: 'var(--kd-text-secondary)' }}>
            Study Streak
          </span>
          <span className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Encouragement Message - Only show if user has reviewed today */}
      {reviewedToday > 0 && retention >= 80 ? (
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-success)', color: 'var(--kd-text-inverse)', opacity: 0.9 }}>
          <p className="text-center text-sm font-medium">
            ⭐ Excellent work! Keep it up!
          </p>
        </div>
      ) : reviewedToday > 0 && retention < 80 ? (
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--kd-warning)', color: 'var(--kd-text-inverse)', opacity: 0.9 }}>
          <p className="text-center text-sm font-medium">
            📚 Keep practicing, you're doing great!
          </p>
        </div>
      ) : null}
    </div>
  );
}
