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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--kd-bg)' }}>
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
                Browse Cards
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
                Search, filter, and manage your flashcards
              </p>
            </div>
            <button
              onClick={() => navigate('/cards?create=true')}
              className="px-4 py-2 font-medium rounded-md transition-all flex items-center gap-2"
              style={{
                backgroundColor: 'var(--kd-accent)',
                color: 'var(--kd-text-inverse)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>+</span>
              Create Card
            </button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="space-y-4" style={{ position: 'sticky', top: '5rem', zIndex: 40, maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
              <CardFiltersComponent
              filters={filters}
              decks={decks}
              tags={tags}
              onChange={handleFiltersChange}
              onReset={handleFiltersReset}
              totalCards={cardsData?.total}
            />
            </div>
          </div>

          {/* Main Content - Cards List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Loading State */}
            {cardsLoading && (
              <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
                <div className="text-4xl mb-4" style={{ color: 'var(--kd-primary)' }}>⏳</div>
                <p style={{ color: 'var(--kd-text-secondary)' }}>Loading cards...</p>
              </div>
            )}

            {/* Error State */}
            {cardsError && (
              <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
                <div className="text-4xl mb-4" style={{ color: 'var(--kd-danger)' }}>⚠️</div>
                <p className="mb-2" style={{ color: 'var(--kd-danger)' }}>Failed to load cards</p>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['cards'] })}
                  style={{ color: 'var(--kd-link)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-link-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-link)')}
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
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm" style={{ color: 'var(--kd-text-secondary)' }}>
                        Page {cardsData.page} of {cardsData.total_pages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePreviousPage}
                          disabled={cardsData.page === 1}
                          className="px-4 py-2 font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: 'var(--kd-surface-2)',
                            color: 'var(--kd-text-primary)',
                          }}
                          onMouseEnter={(e) => {
                            if (cardsData.page !== 1) {
                              e.currentTarget.style.backgroundColor = 'var(--kd-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)';
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                            e.currentTarget.style.outlineOffset = '2px';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = 'none';
                          }}
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={cardsData.page >= cardsData.total_pages}
                          className="px-4 py-2 font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: 'var(--kd-surface-2)',
                            color: 'var(--kd-text-primary)',
                          }}
                          onMouseEnter={(e) => {
                            if (cardsData.page < cardsData.total_pages) {
                              e.currentTarget.style.backgroundColor = 'var(--kd-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--kd-surface-2)';
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
                            e.currentTarget.style.outlineOffset = '2px';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = 'none';
                          }}
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
