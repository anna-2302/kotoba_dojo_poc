import axios from 'axios';
import type {
  Card,
  QueueStats,
  ReviewCard,
  RatingResponse,
  Deck,
  CardListResponse,
  CardFilters,
  CardCreateRequest,
  CardUpdateRequest,
  Tag,
  UserSettings,
  UserSettingsUpdate,
  ImportResponse,
  ImportStatus,
  DeckInfo,
  TodayStats,
  SessionBuildRequest,
  SessionBuildResponse,
  ReviewAnswerEnhancedRequest,
  ReviewAnswerEnhancedResponse,
  SessionStats,
  SessionStatsAnalytics,
} from './types';

// Re-export all types for convenience
export type {
  Card,
  QueueStats,
  ReviewCard,
  RatingResponse,
  Deck,
  CardListResponse,
  CardFilters,
  CardCreateRequest,
  CardUpdateRequest,
  Tag,
  UserSettings,
  UserSettingsUpdate,
  ImportResponse,
  ImportStatus,
  DeckInfo,
  TodayStats,
  SessionBuildRequest,
  SessionBuildResponse,
  ReviewAnswerEnhancedRequest,
  ReviewAnswerEnhancedResponse,
  SessionStats,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REVIEW API
// ============================================================================

export const reviewApi = {
  getStats: async (): Promise<QueueStats> => {
    const response = await apiClient.get('/review/stats');
    const data = response.data;
    
    // Transform backend response to frontend format
    return {
      learning_due: data.due_counts.learning,
      reviews_due: data.due_counts.review,
      new_available: data.due_counts.new,
      total_due: data.total_due,
      today_stats: {
        total_reviews: data.today.reviews_done,
        again_count: data.today.again_count,
        good_count: data.today.good_count,
        easy_count: data.today.easy_count,
      },
    };
  },

  startSession: async (deckId?: number): Promise<ReviewCard> => {
    const response = await apiClient.post('/review/start', {
      deck_ids: deckId ? [deckId] : null,
    });
    return response.data;
  },

  getNext: async (): Promise<ReviewCard | null> => {
    const response = await apiClient.get('/review/next');
    return response.data;
  },

  submitRating: async (
    cardId: number,
    rating: 'again' | 'good' | 'easy',
    deckId?: number
  ): Promise<RatingResponse> => {
    const response = await apiClient.post('/review/answer', {
      card_id: cardId,
      rating,
      deck_ids: deckId ? [deckId] : null,
    });
    return response.data;
  },

  // Phase 4: Enhanced session endpoints
  buildSession: async (request: SessionBuildRequest): Promise<SessionBuildResponse> => {
    const response = await apiClient.post('/review/session/build', request);
    return response.data;
  },

  submitEnhancedRating: async (request: ReviewAnswerEnhancedRequest): Promise<ReviewAnswerEnhancedResponse> => {
    const response = await apiClient.post('/review/answer/enhanced', request);
    return response.data;
  },

  getSessionStats: async (scope: 'all' | 'deck' = 'all', deckId?: number): Promise<SessionStats> => {
    const params = new URLSearchParams();
    params.append('scope', scope);
    if (scope === 'deck' && deckId) {
      params.append('deck_id', deckId.toString());
    }
    
    const response = await apiClient.get(`/review/stats/session?${params.toString()}`);
    return response.data;
  },
};

// ============================================================================
// CARDS API
// ============================================================================

export const cardsApi = {
  list: async (filters: CardFilters = {}): Promise<CardListResponse> => {
    const params = new URLSearchParams();
    
    // Backend expects 'deck_ids' (plural, can be multiple)
    if (filters.deck_id) {
      params.append('deck_ids', filters.deck_id.toString());
    }
    
    if (filters.state) params.append('state', filters.state);
    
    // For now, skip tag filtering as we'd need to convert tag names to IDs
    // This would require fetching all tags first, which is inefficient
    // TODO: Backend should support filtering by tag names
    if (filters.tags && filters.tags.length > 0) {
      // Backend expects tag_ids, but we have tag names
      // Skip for now - this needs backend support for tag name filtering
      console.warn('Tag filtering by name not yet supported, use tag IDs');
    }
    
    // Backend expects 'search' parameter, not 'q'
    if (filters.q) params.append('search', filters.q);
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size)
      params.append('page_size', filters.page_size.toString());

    const response = await apiClient.get(`/cards?${params.toString()}`);
    return response.data;
  },

  get: async (id: number): Promise<Card> => {
    const response = await apiClient.get(`/cards/${id}`);
    return response.data;
  },

  create: async (data: CardCreateRequest): Promise<Card> => {
    const response = await apiClient.post('/cards', data);
    return response.data;
  },

  update: async (id: number, data: CardUpdateRequest): Promise<Card> => {
    const response = await apiClient.put(`/cards/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/cards/${id}`);
  },

  suspend: async (id: number, suspended: boolean): Promise<Card> => {
    const response = await apiClient.post(`/cards/${id}/suspend`, {
      suspended,
    });
    return response.data;
  },

  move: async (id: number, deckId: number): Promise<Card> => {
    const response = await apiClient.post(`/cards/${id}/move`, {
      deck_id: deckId,
    });
    return response.data;
  },
};

// ============================================================================
// DECKS API
// ============================================================================

export const decksApi = {
  list: async (): Promise<Deck[]> => {
    const response = await apiClient.get('/decks');
    // Backend returns { decks: [...], total: ... }
    return response.data.decks || [];
  },
};

// ============================================================================
// TAGS API
// ============================================================================

export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  create: async (name: string): Promise<Tag> => {
    const response = await apiClient.post('/tags', { name });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tags/${id}`);
  },
};

// ============================================================================
// SETTINGS API
// ============================================================================

export const settingsApi = {
  get: async (): Promise<UserSettings> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  update: async (data: UserSettingsUpdate): Promise<UserSettings> => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },
};

// ============================================================================
// IMPORT API
// ============================================================================

export const importApi = {
  importPrebuilt: async (): Promise<ImportResponse> => {
    const response = await apiClient.post('/import/prebuilt');
    return response.data;
  },

  getStatus: async (): Promise<ImportStatus> => {
    const response = await apiClient.get('/import/status');
    return response.data;
  },
};

// ============================================================================
// STATS API
// ============================================================================

export const statsApi = {
  getToday: async (): Promise<TodayStats> => {
    const response = await apiClient.get('/stats/today');
    return response.data;
  },

  getSessions: async (days: number = 30): Promise<SessionStatsAnalytics> => {
    const response = await apiClient.get(`/stats/sessions?days=${days}`);
    return response.data;
  },

  getRetention: async (days: number = 30): Promise<any> => {
    const response = await apiClient.get(`/stats/retention?days=${days}`);
    return response.data;
  },
};
