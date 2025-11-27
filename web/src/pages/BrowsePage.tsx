import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cardsApi, decksApi, tagsApi } from '../api';
import type { Card, CardFilters } from '../api';
import { CardList } from '../components/CardList';
import { CardFilters as CardFiltersComponent } from '../components/CardFilters';
import { EditCardModal } from '../components/EditCardModal';
import { AppHeader } from '../components/AppHeader';
import { SuspendModal } from '../components/SuspendModal';

export const BrowsePage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // State
  const [filters, setFilters] = useState<CardFilters>({
    page: 1,
    page_size: 50,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  // Queries
  const { data: cardsData, isLoading: cardsLoading, error: cardsError } = useQuery({
    queryKey: ['cards', filters],
    queryFn: () => cardsApi.list(filters),
    staleTime: 30000,
  });

  const { data: decks = [] } = useQuery({
    queryKey: ['decks'],
    queryFn: decksApi.list,
    staleTime: 60000,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
    staleTime: 60000,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Card> }) =>
      cardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setEditingCard(null);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspended }: { id: number; suspended: boolean }) =>
      cardsApi.suspend(id, suspended),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if modal is open or user is typing
      if (editingCard || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const cards = cardsData?.cards || [];
      if (cards.length === 0) return;

      const currentIndex = selectedId ? cards.findIndex(c => c.id === selectedId) : -1;

      switch (e.key.toLowerCase()) {
        case 'j': // Next card
          e.preventDefault();
          if (currentIndex < cards.length - 1) {
            setSelectedId(cards[currentIndex + 1].id);
          } else if (selectedId === null && cards.length > 0) {
            setSelectedId(cards[0].id);
          }
          break;

        case 'k': // Previous card
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedId(cards[currentIndex - 1].id);
          } else if (selectedId === null && cards.length > 0) {
            setSelectedId(cards[0].id);
          }
          break;

        case 'enter': // Edit
          if (selectedId) {
            e.preventDefault();
            const card = cards.find(c => c.id === selectedId);
            if (card) setEditingCard(card);
          }
          break;

        case 's': // Suspend toggle
          if (selectedId) {
            e.preventDefault();
            const card = cards.find(c => c.id === selectedId);
            if (card) {
              suspendMutation.mutate({
                id: card.id,
                suspended: !card.suspended,
              });
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardsData, selectedId, editingCard, suspendMutation]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: CardFilters) => {
    setFilters(newFilters);
    setSelectedId(null); // Reset selection
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({ page: 1, page_size: 50 });
    setSelectedId(null);
  }, []);

  const handleSave = useCallback((id: number, data: Partial<Card>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const handleSuspendToggle = useCallback((card: Card) => {
    // Show sensei modal instead of suspending
    setShowSuspendModal(true);
  }, []);


  // Pagination
  const handlePreviousPage = () => {
    setFilters(prev => ({
      ...prev,
      page: Math.max(1, (prev.page || 1) - 1),
    }));
  };

  const handleNextPage = () => {
    if (cardsData && cardsData.page < cardsData.total_pages) {
      setFilters(prev => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Browse Cards
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Search, filter, and manage your flashcards
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/cards?create=true')}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-md transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Create Card
              </button>
              {cardsData && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {cardsData.total} card{cardsData.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <CardFiltersComponent
              filters={filters}
              decks={decks}
              tags={tags}
              onChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />

            {/* Keyboard shortcuts help */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Next card</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">J</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Previous card</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">K</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Edit</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Suspend</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">S</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Cards List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Loading State */}
            {cardsLoading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <div className="text-blue-500 text-4xl mb-4">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">Loading cards...</p>
              </div>
            )}

            {/* Error State */}
            {cardsError && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 dark:text-red-400 mb-2">Failed to load cards</p>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['cards'] })}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Cards List */}
            {cardsData && (
              <>
                <CardList
                  cards={cardsData.cards}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onEdit={setEditingCard}
                  onSuspendToggle={handleSuspendToggle}
                />

                {/* Pagination */}
                {cardsData.total_pages > 1 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {cardsData.page} of {cardsData.total_pages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePreviousPage}
                          disabled={cardsData.page === 1}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={cardsData.page >= cardsData.total_pages}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCardModal
        card={editingCard}
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleSave}
        availableTags={tags}
      />

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
      />
    </>
  );
};
