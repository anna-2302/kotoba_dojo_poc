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
        className="min-h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 cursor-pointer transition-all hover:shadow-xl"
        onClick={onFlip}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {!isFlipped ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Front
              </p>
              <p className="text-3xl font-medium text-gray-900 dark:text-gray-100">
                {front}
              </p>
              <p className="text-sm text-gray-400 mt-8">
                Press Space to flip
              </p>
            </div>
          ) : (
            <div className="text-center w-full">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Back
              </p>
              <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-8">
                {back}
              </p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-400">
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
