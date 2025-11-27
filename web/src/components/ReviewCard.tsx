import { useState } from 'react';

interface ReviewCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function ReviewCard({ front, back, isFlipped, onFlip }: ReviewCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="min-h-[300px] rounded-lg p-8 cursor-pointer transition-all"
        onClick={onFlip}
        style={{
          backgroundColor: 'var(--kd-surface)',
          boxShadow: 'var(--kd-shadow-elevation-1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--kd-shadow-elevation-2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--kd-shadow-elevation-1)';
        }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {!isFlipped ? (
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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
