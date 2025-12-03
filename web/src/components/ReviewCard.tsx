// Card component for displaying front/back content with 3D flip animation

interface ReviewCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function ReviewCard({ front, back, isFlipped, onFlip }: ReviewCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      {/* Flip container with 3D transform */}
      <div
        className="relative min-h-[240px] cursor-pointer"
        onClick={onFlip}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 min-h-[240px] rounded-lg p-6 backface-hidden"
          style={{
            backgroundColor: 'var(--kd-surface)',
            boxShadow: 'var(--kd-shadow-elevation-1)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="flex flex-col items-center justify-center w-full">
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: 'var(--kd-text-secondary)' }}>
                Front
              </p>
              <p className="text-3xl font-medium" style={{ color: 'var(--kd-text-primary)' }}>
                {front}
              </p>
              <p className="text-sm mt-8" style={{ color: 'var(--kd-text-muted)' }}>
                Press Space to flip
              </p>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 min-h-[240px] rounded-lg p-6 backface-hidden"
          style={{
            backgroundColor: 'var(--kd-surface)',
            boxShadow: 'var(--kd-shadow-elevation-1)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="flex flex-col items-center justify-center w-full">
            <div className="text-center w-full">
              <p className="text-sm mb-4" style={{ color: 'var(--kd-text-secondary)' }}>
                Back
              </p>
              <p className="text-2xl font-medium mb-8" style={{ color: 'var(--kd-text-primary)' }}>
                {back}
              </p>
              <div className="pt-4" style={{ borderTop: '1px solid var(--kd-divider)' }}>
                <p className="text-sm" style={{ color: 'var(--kd-text-muted)' }}>
                  Rate your answer below
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
