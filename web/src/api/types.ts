// ============================================================================
// CORE TYPES - All API response and request types
// ============================================================================

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  notes: string | null;
  tags: Tag[];
  suspended: boolean;
  state: 'new' | 'learning' | 'review';
  created_at: string;
  updated_at: string;
}

export interface QueueStats {
  learning_due: number;
  reviews_due: number;
  new_available: number;
  total_due: number;
}

export interface ReviewCard {
  card: Card;
  due_at: string;
  interval_days: number;
  ease_factor: number;
}

export interface RatingResponse {
  next_card: ReviewCard | null;
  remaining: number;
  session_complete: boolean;
}

export interface Deck {
  id: number;
  name: string;
  description: string | null;
  new_limit: number | null;
  review_limit: number | null;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface CardListResponse {
  cards: Card[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CardFilters {
  deck_id?: number;
  state?: 'new' | 'learning' | 'review' | 'suspended';
  tags?: string[];
  q?: string;
  page?: number;
  page_size?: number;
}

export interface CardCreateRequest {
  deck_id: number;
  front: string;
  back: string;
  notes?: string;
  tag_ids?: number[];
}

export interface CardUpdateRequest {
  front?: string;
  back?: string;
  notes?: string;
  tag_ids?: number[];
  deck_id?: number;
  suspended?: boolean;
}

export interface Tag {
  id: number;
  name: string;
  user_id?: number;
  created_at?: string;
}

// ============================================================================
// SETTINGS TYPES - User settings and preferences
// ============================================================================

export interface UserSettings {
  learning_steps: string;
  dark_mode: boolean;
  music_enabled: boolean;
  music_volume: number;
}

export interface UserSettingsUpdate {
  learning_steps?: string;
  dark_mode?: boolean;
  music_enabled?: boolean;
  music_volume?: number;
}

// ============================================================================
// IMPORT TYPES - Prebuilt deck imports
// ============================================================================

export interface DeckInfo {
  name: string;
  id?: number;
  cards?: number;
  exists?: boolean;
  card_count?: number;
}

export interface ImportResponse {
  status: string;
  message: string;
  decks: DeckInfo[];
  total_cards: number;
  cards_imported?: number;
}

export interface ImportStatus {
  imported: boolean;
  imported_count: number;
  total_decks: number;
  decks: DeckInfo[];
  total_cards: number;
}

// ============================================================================
// STATS TYPES - Daily statistics and retention
// ============================================================================

export interface TodayStats {
  reviewed_today: number;
  new_cards_today: number;
  retention_rate: number;
  study_streak: number;
  total_reviews: number;
}
