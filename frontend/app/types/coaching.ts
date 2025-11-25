export type CoachingAckAction = "accepted" | "dismissed";

export type CoachingSuggestion = {
  suggestion_id: string;
  title: string;
  description: string;
  category_id: string | null;
  category_name: string | null;
  estimated_savings_kg: number;
  env_label: "good" | "neutral" | "bad" | string;
  status?: string;
};

export type CoachingCategoryImpact = {
  category_id: string;
  category_name: string;
  total_co2: number;
  env_score: number;
  env_label: string;
};

export type CoachingWeekProfile = {
  year: number;
  week: number;
  week_start?: string | null;
  total_spend: number;
  total_co2: number;
  top_categories: CoachingCategoryImpact[];
};

export type CoachingPayload = {
  user_id: string;
  generated_at: string;
  profiles: CoachingWeekProfile[];
  suggestions: CoachingSuggestion[];
};
