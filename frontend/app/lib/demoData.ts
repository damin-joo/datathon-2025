export type LeaderboardDemoEntry = {
  user_id: string;
  display_name: string;
  eco_points: number;
  total_co2: number;
  total_spend: number;
  tx_count: number;
  eco_score_percentile: number;
  badge: "Sprout" | "Earth Ally" | "Trailblazer" | "Guardian" | string;
};

export const DEMO_LEADERBOARD: LeaderboardDemoEntry[] = [
  {
    user_id: "guest",
    display_name: "Guest",
    eco_points: 815,
    total_co2: 128,
    total_spend: 8920,
    tx_count: 122,
    eco_score_percentile: 78,
    badge: "Earth Ally",
  },
  {
    user_id: "river.runner",
    display_name: "River Runner",
    eco_points: 790,
    total_co2: 135,
    total_spend: 9025,
    tx_count: 117,
    eco_score_percentile: 75,
    badge: "Trailblazer",
  },
  {
    user_id: "luna.green",
    display_name: "Luna Green",
    eco_points: 760,
    total_co2: 150,
    total_spend: 9730,
    tx_count: 140,
    eco_score_percentile: 71,
    badge: "Earth Ally",
  },
  {
    user_id: "solarpunk",
    display_name: "Solar Punk",
    eco_points: 722,
    total_co2: 166,
    total_spend: 11050,
    tx_count: 154,
    eco_score_percentile: 66,
    badge: "Guardian",
  },
  {
    user_id: "urbancomposter",
    display_name: "Urban Composter",
    eco_points: 701,
    total_co2: 172,
    total_spend: 10442,
    tx_count: 139,
    eco_score_percentile: 63,
    badge: "Trailblazer",
  },
  {
    user_id: "freshroots",
    display_name: "Fresh Roots",
    eco_points: 664,
    total_co2: 190,
    total_spend: 11885,
    tx_count: 168,
    eco_score_percentile: 58,
    badge: "Sprout",
  },
  {
    user_id: "northcoast",
    display_name: "North Coast",
    eco_points: 642,
    total_co2: 205,
    total_spend: 12390,
    tx_count: 174,
    eco_score_percentile: 55,
    badge: "Sprout",
  },
];

export const GUEST_ACCOUNTS = [
  {
    username: "guest",
    password: "guest123",
    persona: "Default dashboard view",
  },
  {
    username: "river.runner",
    password: "guest123",
    persona: "Outdoor commuter with lower transport emissions",
  },
  {
    username: "urbancomposter",
    password: "guest123",
    persona: "City dweller experimenting with low-waste goals",
  },
];

export const BADGE_DESCRIPTIONS: Record<string, string> = {
  Sprout: "Just getting started—every mindful purchase counts",
  "Earth Ally": "Consistent eco choices across food, transit, and goods",
  Trailblazer: "Actively experimenting with new low-carbon habits",
  Guardian: "Driving community impact through major lifestyle shifts",
};
