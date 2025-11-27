interface ProgressIndicatorProps {
  current: number;
  total: number;
  remaining: number;
}

export function ProgressIndicator({ current, total, remaining }: ProgressIndicatorProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
        <span>Progress: {current} / {total}</span>
        <span>Remaining: {remaining}</span>
      </div>
      <div
        className="w-full rounded-full h-2"
        style={{ backgroundColor: 'var(--kd-surface-2)' }}
      >
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: 'var(--kd-primary)',
          }}
        />
      </div>
    </div>
  );
}
