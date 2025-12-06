
export interface Harbour {
  id: string;
  name: string;
  state: string;
  last_updated_timestamp: number;
}

export interface Species {
  id: string;
  name_en: string;
  name_local: string;
  image_url: string;
}

export type VerificationLevel = 'Verified' | 'Phone Call' | 'Unconfirmed';

export interface Rate {
  id: string;
  harbour_id: string;
  species_id: string;
  price_per_kg: number;
  date: string; // ISO Date String YYYY-MM-DD
  source_admin_id: string;
  verification_level?: VerificationLevel;
  rate_confidence_score?: number; // 0-100
  lots_checked?: number;
}

export interface RateChangeResult {
  status: 'UP' | 'DOWN' | 'SAME';
  percentDiff: number;
  description: string;
}

export interface Subscriber {
  id: string;
  phone_number: string;
  harbour_id_subscribed: string;
  opt_in_date: string;
}

export interface DailyRateSummary {
  species: Species;
  todayRate: Rate | null;
  yesterdayRate: Rate | null;
  change: RateChangeResult;
  history: Rate[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface OracleSummary {
  trend: string;
  health: string;
  insight: string;
}

export interface PredictionPoint {
  date: string;
  price: number;
}
