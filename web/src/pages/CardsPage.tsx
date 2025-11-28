import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { cardsApi, decksApi, tagsApi } from '../api';
import type { CardCreateRequest, Card } from '../api';
import { CreateCardModal } from '../components/CreateCardModal';
import { CardList } from '../components/CardList';
import { CardFilters as CardFiltersComponent } from '../components/CardFilters';
import { EditCardModal } from '../components/EditCardModal';
import { SuspendModal } from '../components/SuspendModal';
import { DeleteCardModal } from '../components/DeleteCardModal';
import { AppHeader } from '../components/AppHeader';

interface CardFilters {
  deck_id?: number;
  state?: 'new' | 'learning' | 'review' | 'suspended';
  tags?: number[];
  q?: string;
  page?: number;
  page_size?: number;
}

export const CardsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [filters, setFilters] = useState<CardFilters>({
    page: 1,
    page_size: 50,
  });

  // Check for create param on mount
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
      // Clean up URL parameter
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Data Queries
  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', filters],
    queryFn: () =>
      cardsApi.list({
        deck_id: filters.deck_id,
        state: filters.state as any,
        tags: filters.tags?.map(id => id.toString()),
        q: filters.q,
        page: filters.page,
        page_size: filters.page_size,
      }),
    staleTime: 30000,
  });

  const { data: decks = [] } = useQuery({
    queryKey: ['decks'],
    queryFn: decksApi.list,
    staleTime: 60000,
  });

  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
    staleTime: 60000,
  });

  // Ensure arrays are always arrays
  const deckList = Array.isArray(decks) ? decks : [];
  const tagList = Array.isArray(tagsData) ? tagsData : [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CardCreateRequest) => cardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      setShowCreateModal(false);
      showSuccessNotification('Card created successfully');
    },
    onError: (error: any) => {
      console.error('Create card error:', error);
      showErrorNotification(error.response?.data?.detail || 'Failed to create card');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      cardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setEditingCard(null);
      showSuccessNotification('Card updated successfully');
    },
    onError: (error: any) => {
      console.error('Update card error:', error);
      showErrorNotification(error.response?.data?.detail || 'Failed to update card');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      showSuccessNotification('Card deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete card error:', error);
      showErrorNotification(error.response?.data?.detail || 'Failed to delete card');
    },
  });

  // Handlers
  const handleCreateCard = (data: CardCreateRequest) => {
    createMutation.mutate(data);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
  };

  const handleSaveCard = (id: number, data: any) => {
    updateMutation.mutate({ id, data });
  };

  const handleDeleteCard = (card: Card) => {
    setCardToDelete(card);
  };

  const confirmDeleteCard = () => {
    if (cardToDelete) {
      deleteMutation.mutate(cardToDelete.id);
      setCardToDelete(null);
    }
  };

  const handleSuspendToggle = () => {
    // Show sensei modal instead of suspending
    setShowSuspendModal(true);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, page_size: 50 });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const cards = cardsData?.cards || [];
  const totalPages = cardsData?.total_pages || 1;
  const currentPage = filters.page || 1;

  return (
    <>
      <AppHeader />
      <div className="min-h-screen py-6" style={{ backgroundColor: 'var(--kd-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
            Card Management
          </h1>
          <p className="mt-1" style={{ color: 'var(--kd-text-secondary)' }}>
            Create, edit, and organize your flashcards
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 font-semibold rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--kd-primary)',
            color: 'var(--kd-text-inverse)',
            boxShadow: 'var(--kd-shadow-md)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.boxShadow = 'var(--kd-shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          + Create Card
        </button>
      </div>

      {/* Filters and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CardFiltersComponent
            filters={{
              deck_id: filters.deck_id,
              state: filters.state,
              tags: filters.tags?.map(id => tagList.find(t => t.id === id)?.name).filter(Boolean) as string[] | undefined,
              q: filters.q,
              page: filters.page,
              page_size: filters.page_size,
            }}
            decks={deckList}
            tags={tagList.map(t => t.name)}
            onChange={(newFilters: any) => {
              const tagIds = newFilters.tags
                ? tagList
                    .filter(t => newFilters.tags.includes(t.name))
                    .map(t => t.id)
                : undefined;
              handleFilterChange({
                deck_id: newFilters.deck_id,
                state: newFilters.state,
                tags: tagIds,
                q: newFilters.q,
                page: 1,
                page_size: filters.page_size,
              });
            }}
            onReset={handleResetFilters}
          />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Loading State */}
          {cardsLoading && (
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-md)' }}>
              <p style={{ color: 'var(--kd-text-secondary)' }}>Loading cards...</p>
            </div>
          )}

          {/* Card List */}
          {!cardsLoading && (
            <>
              <CardList
                cards={cards}
                selectedId={selectedCardId}
                onSelect={setSelectedCardId}
                onEdit={handleEditCard}
                onSuspendToggle={handleSuspendToggle}
                onDelete={handleDeleteCard}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{
                      backgroundColor: 'var(--kd-surface)',
                      color: 'var(--kd-text-primary)',
                      border: '1px solid var(--kd-border)'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = 'var(--kd-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--kd-surface)';
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ color: 'var(--kd-text-secondary)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{
                      backgroundColor: 'var(--kd-surface)',
                      color: 'var(--kd-text-primary)',
                      border: '1px solid var(--kd-border)'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = 'var(--kd-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--kd-surface)';
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditCardModal
        card={editingCard}
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveCard}
        availableTags={tagList.map(t => t.name)}
      />

      {/* Create Modal */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCard}
        decks={deckList}
        availableTags={tagList}
        isLoading={createMutation.isPending}
        error={createMutation.isError ? 'Failed to create card' : undefined}
      />

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
      />

      {/* Delete Modal */}
      <DeleteCardModal
        card={cardToDelete}
        isOpen={!!cardToDelete}
        onClose={() => setCardToDelete(null)}
        onConfirm={confirmDeleteCard}
      />

      {/* Notifications */}
      <Notifications />
        </div>
      </div>
    </>
  );
};

// Simple notification system (store in context/state for production)
const notifications: Array<{ id: string; type: 'success' | 'error'; message: string }> = [];
const notificationListeners: Array<(n: typeof notifications) => void> = [];

const showSuccessNotification = (message: string) => {
  const id = Math.random().toString();
  notifications.push({ id, type: 'success', message });
  notificationListeners.forEach(listener => listener([...notifications]));
  setTimeout(() => {
    notifications.splice(notifications.findIndex(n => n.id === id), 1);
    notificationListeners.forEach(listener => listener([...notifications]));
  }, 3000);
};

const showErrorNotification = (message: string) => {
  const id = Math.random().toString();
  notifications.push({ id, type: 'error', message });
  notificationListeners.forEach(listener => listener([...notifications]));
  setTimeout(() => {
    notifications.splice(notifications.findIndex(n => n.id === id), 1);
    notificationListeners.forEach(listener => listener([...notifications]));
  }, 5000);
};

const Notifications: React.FC = () => {
  const [items, setItems] = React.useState(notifications);

  React.useEffect(() => {
    notificationListeners.push(setItems);
    return () => {
      notificationListeners.splice(notificationListeners.indexOf(setItems), 1);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 w-96 max-w-[calc(100vw-2rem)]">
      {items.map(item => (
        <div
          key={item.id}
          className="p-4 rounded-lg font-medium"
          style={{
            backgroundColor: item.type === 'success' ? 'var(--kd-success)' : 'var(--kd-danger)',
            color: 'var(--kd-text-inverse)',
            boxShadow: 'var(--kd-shadow-lg)'
          }}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
};
