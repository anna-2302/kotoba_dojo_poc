interface RatingButtonsProps {
  onRate: (rating: 'again' | 'good' | 'easy') => void;
  disabled?: boolean;
}

export function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  return (
    <div className="flex gap-4 justify-center mt-8">
      <button
        onClick={() => onRate('again')}
        disabled={disabled}
        className="px-6 py-3 font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: disabled ? 'var(--kd-disabled)' : 'var(--kd-danger)',
          color: 'var(--kd-text-inverse)',
        }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-label="Rate as Again - resets card progress (keyboard shortcut: 1)"
      >
        <span className="block text-xs mb-1" aria-hidden="true">1</span>
        <span className="block">Again</span>
      </button>
      <button
        onClick={() => onRate('good')}
        disabled={disabled}
        className="px-6 py-3 font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: disabled ? 'var(--kd-disabled)' : 'var(--kd-primary)',
          color: 'var(--kd-text-inverse)',
        }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-label="Rate as Good - standard advancement (keyboard shortcut: 2)"
      >
        <span className="block text-xs mb-1" aria-hidden="true">2</span>
        <span className="block">Good</span>
      </button>
      <button
        onClick={() => onRate('easy')}
        disabled={disabled}
        className="px-6 py-3 font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: disabled ? 'var(--kd-disabled)' : 'var(--kd-success)',
          color: 'var(--kd-text-inverse)',
        }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-label="Rate as Easy - skip ahead (keyboard shortcut: 3)"
      >
        <span className="block text-xs mb-1" aria-hidden="true">3</span>
        <span className="block">Easy</span>
      </button>
    </div>
  );
}
