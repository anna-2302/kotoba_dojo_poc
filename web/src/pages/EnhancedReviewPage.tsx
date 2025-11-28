import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { reviewApi, cardsApi } from '../api';
import type { 
  SessionBuildResponse, 
  ReviewAnswerEnhancedResponse,
  SessionBuildRequest 
} from '../api/types';
import { ReviewCard } from '../components/ReviewCard';
import { RatingButtons } from '../components/RatingButtons';
import { AppHeader } from '../components/AppHeader';

// Phase 4 Components
import { SessionProgressIndicator } from '../components/SessionProgressIndicator';
import { SectionTransition } from '../components/SectionTransition';
import { SessionControls } from '../components/SessionControls';
import { SessionStatsDetails } from '../components/SessionStatsDetails';

export function EnhancedReviewPage() {
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deck') ? parseInt(searchParams.get('deck')!) : undefined;
  
  // Phase 4 session state
  const [sessionData, setSessionData] = useState<SessionBuildResponse | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<'new' | 'learning' | 'review'>('new');
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [againRepeats, setAgainRepeats] = useState<number[]>([]); // Card IDs for in-session repeats
  
  // Derived state
  const allCards = sessionData ? [
    ...sessionData.sections.new,
    ...sessionData.sections.learning, 
    ...sessionData.sections.review
  ] : [];
  
  const currentCard = allCards[currentCardIndex] || null;
  const totalCards = allCards.length + againRepeats.length;
  const completedCards = currentCardIndex;
  
  const queryClient = useQueryClient();

  // Build session mutation
  const buildSessionMutation = useMutation({
    mutationFn: (request: SessionBuildRequest) => reviewApi.buildSession(request),
    onSuccess: (data) => {
      console.log('🎯 Phase 4 session built:', data);
      setSessionData(data);
      setCurrentCardIndex(0);
      setCurrentSection(data.sections.new.length > 0 ? 'new' : 
                     data.sections.learning.length > 0 ? 'learning' : 'review');
      setIsFlipped(false);
      setSessionComplete(false);
      setAgainRepeats([]);
    },
    onError: (error) => {
      console.error('❌ Failed to build session:', error);
    },
  });

  // Submit enhanced rating mutation
  const rateEnhancedMutation = useMutation({
    mutationFn: reviewApi.submitEnhancedRating,
    onSuccess: (data: ReviewAnswerEnhancedResponse) => {
      console.log('✅ Enhanced rating submitted:', data);
      
      if (data.session_complete) {
        setSessionComplete(true);
        // Invalidate queries to refresh dashboard
        queryClient.invalidateQueries({ queryKey: ['review-stats'] });
        queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
        queryClient.invalidateQueries({ queryKey: ['todayStats'] });
        return;
      }
      
      // Move to next card or handle Again repeats
      handleNextCard();
    },
    onError: (error) => {
      console.error('❌ Failed to submit enhanced rating:', error);
    },
  });

  // Initialize session on mount
  useEffect(() => {
    const request: SessionBuildRequest = {
      scope: deckId ? 'deck' : 'all',
      deck_ids: deckId ? [deckId] : undefined,
      max_session_size: 50 // Default session size
    };
    
    buildSessionMutation.mutate(request);
  }, [deckId]);

  // Determine current section based on card index
  useEffect(() => {
    if (!sessionData) return;
    
    const newCount = sessionData.sections.new.length;
    const learningCount = sessionData.sections.learning.length;
    
    if (currentCardIndex < newCount) {
      setCurrentSection('new');
    } else if (currentCardIndex < newCount + learningCount) {
      setCurrentSection('learning');
    } else {
      setCurrentSection('review');
    }
  }, [currentCardIndex, sessionData]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (sessionComplete) return;

      // Global shortcuts (work without current card)
      if (e.code === 'KeyR' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRestartSession();
        return;
      }
      
      if (e.code === 'Escape') {
        e.preventDefault();
        handleFinishSession();
        return;
      }

      // Card-specific shortcuts
      if (!currentCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'KeyI') {
        e.preventDefault();
        // Toggle card info in SessionControls (this will be handled by the component)
        const event = new CustomEvent('toggleCardInfo');
        window.dispatchEvent(event);
      } else if (isFlipped) {
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
          e.preventDefault();
          handleRate('again');
        } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
          e.preventDefault();
          handleRate('good');
        } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
          e.preventDefault();
          handleRate('easy');
        } else if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSuspendCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard, isFlipped, sessionComplete]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleRate = useCallback((rating: 'again' | 'good' | 'easy') => {
    if (!currentCard || !isFlipped || !sessionData) return;
    
    // Handle Again repeats at client-side for immediate feedback
    if (rating === 'again') {
      setAgainRepeats(prev => [...prev, currentCard.id]);
      handleNextCard(); // Move to next card immediately
      return;
    }
    
    // Submit to backend for Good/Easy ratings
    rateEnhancedMutation.mutate({
      session_id: sessionData.session_id,
      card_id: currentCard.id,
      rating,
      section: currentSection,
    });
  }, [currentCard, isFlipped, sessionData, currentSection]);

  const handleNextCard = useCallback(() => {
    setCurrentCardIndex(prev => prev + 1);
    setIsFlipped(false);
    
    // Check if session is complete
    if (currentCardIndex + 1 >= allCards.length) {
      setSessionComplete(true);
    }
  }, [currentCardIndex, allCards.length]);

  const handleFinishSession = useCallback(() => {
    setSessionComplete(true);
    queryClient.invalidateQueries({ queryKey: ['review-stats'] });
  }, [queryClient]);

  const handleRestartSession = useCallback(() => {
    const request: SessionBuildRequest = {
      scope: deckId ? 'deck' : 'all',
      deck_ids: deckId ? [deckId] : undefined,
      max_session_size: 50
    };
    buildSessionMutation.mutate(request);
  }, [deckId]);

  const handleSuspendCard = useCallback(async (cardId?: number) => {
    const targetCardId = cardId || currentCard?.id;
    if (!targetCardId) return;
    
    try {
      await cardsApi.suspend(targetCardId, true);
      
      // If suspending current card, move to next
      if (targetCardId === currentCard?.id) {
        handleNextCard();
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] });
    } catch (error) {
      console.error('Failed to suspend card:', error);
      throw error; // Re-throw for UI feedback
    }
  }, [currentCard, queryClient]);

  // Loading state
  if (buildSessionMutation.isPending || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-400">Building your session...</p>
        </div>
      </div>
    );
  }

  // No cards in session
  if (allCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎉 All caught up!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            No cards available for review right now.
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
  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ✨ Session Complete!
          </h1>
          <div className="text-gray-600 dark:text-gray-400 mb-8 space-y-2">
            <p>Cards completed: {completedCards}</p>
            <p>Again repeats: {againRepeats.length}</p>
            <p>Total reviews: {completedCards + againRepeats.length}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleRestartSession}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
            >
              New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active session with current card
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Phase 4: Enhanced progress indicator */}
          <SessionProgressIndicator
            current={completedCards}
            total={totalCards}
            sections={sessionData.sections}
            currentSection={currentSection}
            againRepeats={againRepeats.length}
          />
          
          {/* Phase 4: Detailed session statistics (expandable) */}
          <SessionStatsDetails
            sections={sessionData.sections}
            meta={sessionData.meta}
            completedCards={completedCards}
            againRepeats={againRepeats.length}
            currentSection={currentSection}
          />
          
          {/* Phase 4: Section transition indicator */}
          <SectionTransition 
            currentSection={currentSection}
            cardPosition={currentCardIndex}
            sectionMeta={sessionData.meta}
          />
          
          {/* Card display */}
          {currentCard && (
            <>
              <ReviewCard
                front={currentCard.front}
                back={currentCard.back}
                isFlipped={isFlipped}
                onFlip={handleFlip}
              />
              
              {/* Deck indicator */}
              <div className="text-center mt-4 mb-6">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  📚 {currentCard.deck_name} • {currentSection.toUpperCase()}
                </span>
              </div>
              
              {isFlipped && (
                <RatingButtons
                  onRate={handleRate}
                  disabled={rateEnhancedMutation.isPending}
                />
              )}
            </>
          )}
          
          {/* Phase 4: Enhanced session controls */}
          <SessionControls
            onFinish={handleFinishSession}
            onRestart={handleRestartSession}
            onSuspendCard={handleSuspendCard}
            currentCard={currentCard}
            disabled={rateEnhancedMutation.isPending}
            sessionStats={{
              completed: completedCards,
              total: totalCards,
              againRepeats: againRepeats.length,
              currentSection: currentSection
            }}
          />
        </div>
      </div>
    </>
  );
}