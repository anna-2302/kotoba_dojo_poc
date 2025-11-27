import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { cardsApi, decksApi, tagsApi } from '../api';
import type { CardCreateRequest, Card } from '../api';
import { CardForm } from '../components/CardForm';
import { CardList } from '../components/CardList';
import { CardFilters as CardFiltersComponent } from '../components/CardFilters';
import { EditCardModal } from '../components/EditCardModal';
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [filters, setFilters] = useState<CardFilters>({
    page: 1,
    page_size: 50,
  });

  // Check for create param on mount
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateForm(true);
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
      setShowCreateForm(false);
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

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspended }: { id: number; suspended: boolean }) =>
      cardsApi.suspend(id, suspended),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      showSuccessNotification('Card status updated');
    },
    onError: (error: any) => {
      console.error('Suspend card error:', error);
      showErrorNotification(error.response?.data?.detail || 'Failed to update card');
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, deckId }: { id: number; deckId: number }) =>
      cardsApi.move(id, deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      showSuccessNotification('Card moved to new deck');
    },
    onError: (error: any) => {
      console.error('Move card error:', error);
      showErrorNotification(error.response?.data?.detail || 'Failed to move card');
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
    if (confirm(`Delete card "${card.front}"? This cannot be undone.`)) {
      deleteMutation.mutate(card.id);
    }
  };

  const handleSuspendToggle = (card: Card) => {
    suspendMutation.mutate({ id: card.id, suspended: !card.suspended });
  };

  const handleMoveCard = (card: Card, deckId: number) => {
    if (card.deck_id === deckId) return;
    moveMutation.mutate({ id: card.id, deckId });
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Card Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, edit, and organize your flashcards
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
        >
          {showCreateForm ? 'Hide Form' : '+ Create Card'}
        </button>
      </div>

      {/* Create Form Section */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Create New Card
          </h2>
          <CardForm
            decks={deckList}
            availableTags={tagList}
            onSubmit={handleCreateCard}
            isLoading={createMutation.isPending}
            error={createMutation.isError ? 'Failed to create card' : undefined}
          />
        </div>
      )}

      {/* Filters and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
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

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Loading State */}
          {cardsLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading cards...</p>
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
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
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
          className={`p-4 rounded-lg shadow-lg text-white font-medium ${
            item.type === 'success'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
};
