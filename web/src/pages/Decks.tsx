import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deckApi } from '../api/decks';
import type { Deck, CreateDeckRequest } from '../types/deck';
import { DeckCard } from '../components/decks/DeckCard';
import { DeckForm } from '../components/decks/DeckForm';
import { DeckStatsModal } from '../components/decks/DeckStatsModal';
import { DeleteDeckModal } from '../components/decks/DeleteDeckModal';
import { AppHeader } from '../components/AppHeader';

export const Decks: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<{ id: number; name: string } | null>(null);

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
      setIsDeleteModalOpen(false);
      setDeckToDelete(null);
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
    const deck = deckList.find(d => d.id === deckId);
    if (deck) {
      setDeckToDelete({ id: deckId, name: deck.name });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteDeck = () => {
    if (deckToDelete) {
      deleteMutation.mutate(deckToDelete.id);
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
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--kd-bg)' }}>
          <div className="text-xl" style={{ color: 'var(--kd-text-secondary)' }}>Loading decks...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--kd-bg)' }}>
        <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>My Decks</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 text-sm font-medium rounded-md focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--kd-accent)',
            color: 'var(--kd-text-inverse)',
            boxShadow: 'var(--kd-shadow-md)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          + Create New Deck
        </button>
      </div>

      {deckList.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--kd-text-primary)' }}>
            No decks yet
          </h2>
          <p className="mb-6" style={{ color: 'var(--kd-text-secondary)' }}>
            Create your first deck to start studying!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 text-sm font-medium rounded-md focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--kd-accent)',
              color: 'var(--kd-text-inverse)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--kd-focus-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="rounded-lg max-w-lg w-full m-4" 
            style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
                  Create New Deck
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-2xl transition-colors"
                  style={{ color: 'var(--kd-text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-text-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-text-muted)')}
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => {
            setIsEditModalOpen(false);
            setSelectedDeck(null);
          }}
        >
          <div 
            className="rounded-lg max-w-lg w-full m-4" 
            style={{ backgroundColor: 'var(--kd-surface)', boxShadow: 'var(--kd-shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--kd-text-primary)' }}>
                  Edit Deck
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedDeck(null);
                  }}
                  className="text-2xl transition-colors"
                  style={{ color: 'var(--kd-text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--kd-text-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--kd-text-muted)')}
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

      {/* Delete Confirmation Modal */}
      <DeleteDeckModal
        deckName={deckToDelete?.name || ''}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeckToDelete(null);
        }}
        onConfirm={confirmDeleteDeck}
      />
        </div>
      </div>
    </>
  );
};
