export interface Deck {
  id: number;
  name: string;
  description?: string;
  card_count: number;
  due_count: number;
  new_count: number;
  created_at: string;
  updated_at: string;
  new_per_day?: number;
  review_per_day?: number;
}

export interface CreateDeckRequest {
  name: string;
  description?: string;
  new_per_day?: number;
  review_per_day?: number;
}

export interface UpdateDeckRequest {
  name?: string;
  description?: string;
  new_per_day?: number;
  review_per_day?: number;
}

export interface DeckStats {
  deck_id: number;
  deck_name: string;
  total_cards: number;
  new_cards: number;
  learning_cards: number;
  review_cards: number;
  suspended_cards: number;
  due_today: number;
  average_ease: number;
  retention_rate: number;
}
