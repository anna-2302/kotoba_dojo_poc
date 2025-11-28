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
  dark_mode: boolean; // Deprecated: use theme_mode
  music_enabled: boolean;
  music_volume: number;
  visual_theme: string;
  theme_mode?: 'day' | 'night'; // New unified theme mode
  
  // Session configuration (Phase 4)
  max_session_size: number; // Maximum cards per session
  preferred_session_scope: 'all' | 'deck'; // Session scope preference
  preferred_deck_ids: number[]; // Preferred deck IDs for deck sessions
  new_section_limit: number; // Max new cards per session
  learning_section_limit: number; // Max learning cards per session
  review_section_limit: number; // Max review cards per session
  auto_start_sessions: boolean; // Auto-start next session after completion
}

export interface UserSettingsUpdate {
  learning_steps?: string;
  dark_mode?: boolean; // Deprecated: use theme_mode
  music_enabled?: boolean;
  music_volume?: number;
  visual_theme?: string;
  theme_mode?: 'day' | 'night'; // New unified theme mode
  
  // Session configuration (Phase 4)
  max_session_size?: number; // Maximum cards per session
  preferred_session_scope?: 'all' | 'deck'; // Session scope preference
  preferred_deck_ids?: number[]; // Preferred deck IDs for deck sessions
  new_section_limit?: number; // Max new cards per session
  learning_section_limit?: number; // Max learning cards per session
  review_section_limit?: number; // Max review cards per session
  auto_start_sessions?: boolean; // Auto-start next session after completion
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

// ============================================================================
// PHASE 4 SESSION TYPES - Enhanced review sessions
// ============================================================================

export interface CardStub {
  id: number;
  front: string;
  back: string;
  deck_name: string;
  state: 'new' | 'learning' | 'review';
  due_at: string;
}

export interface SessionSections {
  new: CardStub[];
  learning: CardStub[];
  review: CardStub[];
}

export interface SessionMeta {
  total_new: number;
  total_learning: number;
  total_review: number;
  deck_order: string[];
  global_limits: Record<string, number>;
  per_deck_limits: Record<string, any>;
}

export interface SessionBuildRequest {
  scope: 'all' | 'deck';
  deck_ids?: number[];
  max_session_size?: number;
}

export interface SessionBuildResponse {
  sections: SessionSections;
  meta: SessionMeta;
  session_id: string;
}

export interface ReviewAnswerEnhancedRequest {
  session_id: string;
  card_id: number;
  rating: 'again' | 'good' | 'easy';
  section: 'new' | 'learning' | 'review';
}

export interface ReviewAnswerEnhancedResponse {
  success: boolean;
  message: string;
  session_complete: boolean;
  current_position: number;
  total_cards: number;
  section_progress: {
    new_completed: number;
    learning_completed: number;
    review_completed: number;
  };
}

export interface SessionStats {
  sections: {
    new: number;
    learning: number;
    review: number;
  };
  limits: {
    new_per_day: number;
    review_per_day: number;
  };
  today: {
    reviews_done: number;
    introduced_new: number;
    again_count: number;
    good_count: number;
    easy_count: number;
    date: string;
  };
  remaining: {
    reviews: number;
    new: number;
  };
  total_available: number;
  deck_breakdown?: Record<string, {
    new: number;
    learning: number;
    review: number;
  }>;
}

export interface SessionStatsAnalytics {
  total_sessions: number;
  average_completion_rate: number;
  section_completions: {
    new_section_completions: number;
    learning_section_completions: number;
    review_section_completions: number;
    total_section_attempts: number;
  };
  daily_sessions: {
    date: string;
    session_count: number;
    cards_reviewed: number;
    completion_rate: number;
  }[];
  performance_trends: {
    again_percentage: number;
    good_percentage: number;
    easy_percentage: number;
    improvement_trend: 'improving' | 'stable' | 'declining';
  };
}

// ============================================================================
// PHASE 4 SESSION STATS TYPES - Session-based queue statistics
// ============================================================================

export interface SessionStats {
  sections: {
    new: number;
    learning: number;
    review: number;
  };
  limits: {
    new_per_day: number;
    review_per_day: number;
  };
  today: {
    reviews_done: number;
    introduced_new: number;
    again_count: number;
    good_count: number;
    easy_count: number;
    date: string;
  };
  remaining: {
    reviews: number;
    new: number;
  };
  total_available: number;
  deck_breakdown?: Record<string, {
    new: number;
    learning: number;
    review: number;
  }>;
}
