import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { reviewApi, type ReviewCard as ReviewCardType } from '../api';
import { ReviewCard } from '../components/ReviewCard';
import { RatingButtons } from '../components/RatingButtons';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AppHeader } from '../components/AppHeader';

export function ReviewPage() {
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deck') ? parseInt(searchParams.get('deck')!) : undefined;
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState<ReviewCardType | null>(null);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const queryClient = useQueryClient();

  // Get initial stats
  const { data: stats } = useQuery({
    queryKey: ['review-stats'],
    queryFn: reviewApi.getStats,
  });

  // Start session mutation
  const startMutation = useMutation({
    mutationFn: reviewApi.startSession,
    onSuccess: (data) => {
      console.log('📝 Review session started:', data);
      setCurrentCard(data);
      setSessionTotal(stats?.total_due || 0);
      setRemaining((stats?.total_due || 1) - 1);
      setCardsReviewed(0);
      setIsFlipped(false);
    },
    onError: (error) => {
      console.error('❌ Failed to start review session:', error);
    },
  });

  // Submit rating mutation
  const rateMutation = useMutation({
    mutationFn: ({ cardId, rating }: { cardId: number; rating: 'again' | 'good' | 'easy' }) =>
      reviewApi.submitRating(cardId, rating, deckId),
    onSuccess: (data) => {
      setCardsReviewed(prev => prev + 1);
      setRemaining(data.remaining);
      
      if (data.next_card) {
        setCurrentCard(data.next_card);
        setIsFlipped(false);
      } else {
        setCurrentCard(null);
        queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      }
    },
  });

  // Start session on mount
  useEffect(() => {
    if (stats && stats.total_due > 0 && !currentCard) {
      startMutation.mutate(deckId);
    }
  }, [stats, deckId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        // Support both regular number keys and numpad keys
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
          e.preventDefault();
          handleRate('again');
        } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
          e.preventDefault();
          handleRate('good');
        } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
          e.preventDefault();
          handleRate('easy');
        }
      }
      
      if (e.code === 'Escape') {
        window.history.back();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard, isFlipped]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleRate = useCallback((rating: 'again' | 'good' | 'easy') => {
    if (!currentCard || !isFlipped) return;
    rateMutation.mutate({ cardId: currentCard.card.id, rating });
  }, [currentCard, isFlipped, rateMutation]);

  // Loading state
  if (!stats || startMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  // No cards due
  if (!currentCard && stats.total_due === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎉 All done!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            No cards due for review right now.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Session complete
  if (!currentCard && cardsReviewed > 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ✨ Session Complete!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You reviewed {cardsReviewed} card{cardsReviewed !== 1 ? 's' : ''} today.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active review session
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
        <ProgressIndicator
          current={cardsReviewed}
          total={sessionTotal}
          remaining={remaining}
        />
        
        {currentCard && currentCard.card && (
          <>
            <ReviewCard
              front={currentCard.card.front}
              back={currentCard.card.back}
              isFlipped={isFlipped}
              onFlip={handleFlip}
            />
            
            {isFlipped && (
              <RatingButtons
                onRate={handleRate}
                disabled={rateMutation.isPending}
              />
            )}
            
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Keyboard shortcuts: Space (flip) • 1 (Again) • 2 (Good) • 3 (Easy) • Esc (exit)</p>
            </div>
          </>
        )}
        
        {currentCard && !currentCard.card && (
          <div className="text-center text-red-500 dark:text-red-400 mt-8">
            <p>Error: Invalid card data received from server</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
