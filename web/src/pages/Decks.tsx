import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deckApi } from '../api/decks';
import type { Deck, CreateDeckRequest } from '../types/deck';
import { DeckCard } from '../components/decks/DeckCard';
import { DeckForm } from '../components/decks/DeckForm';
import { DeckStatsModal } from '../components/decks/DeckStatsModal';
import { AppHeader } from '../components/AppHeader';

export const Decks: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

  // Handle Escape key for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreateModalOpen) {
          setIsCreateModalOpen(false);
        } else if (isEditModalOpen) {
          setIsEditModalOpen(false);
          setSelectedDeck(null);
        }
      }
    };

    if (isCreateModalOpen || isEditModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  // Fetch decks
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['decks'],
    queryFn: deckApi.getDecks,
  });

  // Ensure decks is always an array
  const deckList = Array.isArray(decks) ? decks : [];

  // Fetch deck stats
  const { data: deckStats } = useQuery({
    queryKey: ['deck-stats', selectedDeckId],
    queryFn: () => deckApi.getDeckStats(selectedDeckId!),
    enabled: !!selectedDeckId && isStatsModalOpen,
  });

  // Create deck mutation
  const createMutation = useMutation({
    mutationFn: deckApi.createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      setIsCreateModalOpen(false);
    },
  });

  // Update deck mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateDeckRequest }) =>
      deckApi.updateDeck(id, data),
    onSuccess: () => {
      // Invalidate deck list to refresh due counts
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      // Invalidate review stats since deck limits affect available review counts
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
      setIsEditModalOpen(false);
      setSelectedDeck(null);
    },
  });

  // Delete deck mutation
  const deleteMutation = useMutation({
    mutationFn: deckApi.deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    },
  });

  const handleCreateDeck = (data: CreateDeckRequest) => {
    createMutation.mutate(data);
  };

  const handleUpdateDeck = (data: CreateDeckRequest) => {
    if (selectedDeck) {
      updateMutation.mutate({ id: selectedDeck.id, data });
    }
  };

  const handleDeleteDeck = (deckId: number) => {
    if (window.confirm('Are you sure you want to delete this deck? All cards will be deleted.')) {
      deleteMutation.mutate(deckId);
    }
  };

  const handleStudy = (deckId: number) => {
    navigate(`/review?deck=${deckId}`);
  };

  const handleViewStats = (deckId: number) => {
    setSelectedDeckId(deckId);
    setIsStatsModalOpen(true);
  };

  const handleEdit = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading decks...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Decks</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-md"
        >
          + Create New Deck
        </button>
      </div>

      {deckList.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No decks yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first deck to start studying!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            Create Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deckList.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onStudy={handleStudy}
              onEdit={handleEdit}
              onDelete={handleDeleteDeck}
              onViewStats={handleViewStats}
            />
          ))}
        </div>
      )}

      {/* Create Deck Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Deck
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
              <DeckForm
                onSubmit={handleCreateDeck}
                onCancel={() => setIsCreateModalOpen(false)}
                isLoading={createMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Deck Modal */}
      {isEditModalOpen && selectedDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Deck
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedDeck(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
              <DeckForm
                deck={selectedDeck}
                onSubmit={handleUpdateDeck}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setSelectedDeck(null);
                }}
                isLoading={updateMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      <DeckStatsModal
        stats={deckStats || null}
        isOpen={isStatsModalOpen}
        onClose={() => {
          setIsStatsModalOpen(false);
          setSelectedDeckId(null);
        }}
      />
        </div>
      </div>
    </>
  );
};
