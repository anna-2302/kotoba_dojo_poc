import axios from 'axios';
import type { Deck, CreateDeckRequest, UpdateDeckRequest, DeckStats } from '../types/deck';

const API_BASE_URL = 'http://localhost:8000';

export const deckApi = {
  // Get all decks
  getDecks: async (): Promise<Deck[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/decks`);
    // Backend returns { decks: [...], total: ... }
    return response.data.decks || [];
  },

  // Get a single deck by ID
  getDeck: async (id: number): Promise<Deck> => {
    const response = await axios.get(`${API_BASE_URL}/api/decks/${id}`);
    return response.data;
  },

  // Create a new deck
  createDeck: async (data: CreateDeckRequest): Promise<Deck> => {
    const response = await axios.post(`${API_BASE_URL}/api/decks`, data);
    return response.data;
  },

  // Update an existing deck
  updateDeck: async (id: number, data: UpdateDeckRequest): Promise<Deck> => {
    const response = await axios.put(`${API_BASE_URL}/api/decks/${id}`, data);
    return response.data;
  },

  // Delete a deck
  deleteDeck: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/decks/${id}`);
  },

  // Get deck statistics
  getDeckStats: async (id: number): Promise<DeckStats> => {
    const response = await axios.get(`${API_BASE_URL}/api/decks/${id}/stats`);
    return response.data;
  },
};
