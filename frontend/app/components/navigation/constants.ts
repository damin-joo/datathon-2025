import { LucideIcon, Home, Medal, ListOrdered, BarChart3, Target } from "lucide-react";

export type SubNavItem = {
  name: string;
  href: string;
  description: string;
};

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  submenu?: SubNavItem[];
};

export type SimpleNavItem = {
  name: string;
  href: string;
};

export type LanguageOption = {
  code: string;
  label: string;
};

export const navItems: NavItem[] = [
  {
    name: "Accounts",
    href: "/accounts",
    icon: Home,
    submenu: [
      { name: "Overview", href: "/", description: "Snapshot of spend, carbon, and goals" },
      { name: "Eco Coach", href: "/coaching", description: "Weekly coaching insights" },
      { name: "Alerts", href: "/alerts", description: "Notices about spikes and savings" },
      { name: "Insights", href: "/insights", description: "Energy, food, travel analysis" },
      { name: "Lifestyle", href: "/lifestyle", description: "Compare routines and footprints" },
      { name: "Rewards", href: "/rewards", description: "Redeem planet-friendly perks" },
      { name: "Communities", href: "/communities", description: "Clubs, campuses, workplaces" },
      { name: "Resources", href: "/resources", description: "Guides, calculators, FAQs" },
      { name: "Stories", href: "/stories", description: "Member highlights and wins" },
    ],
  },
  {
    name: "Credit Cards",
    href: "/credit-cards",
    icon: Medal,
    submenu: [
      { name: "Community League", href: "/ranking", description: "See how all users compare" },
      { name: "Team Standings", href: "/ranking?view=teams", description: "Stack up your office or club" },
      { name: "Persona Stories", href: "/ranking/personas", description: "Success stories by persona" },
      { name: "Regional", href: "/ranking/regions", description: "Top provinces and cities" },
      { name: "Champions", href: "/ranking/champions", description: "Past winners and streaks" },
      { name: "Challenges", href: "/ranking/challenges", description: "Weekly eco duels" },
      { name: "Badges", href: "/ranking/badges", description: "See every tier and perks" },
      { name: "Events", href: "/ranking/events", description: "Meetups and livestreams" },
      { name: "Hall of Fame", href: "/ranking/hall-of-fame", description: "Lifetime achievers" },
    ],
  },
  {
    name: "Borrowing",
    href: "/borrowing",
    icon: Medal,
    submenu: [
      { name: "Community League", href: "/ranking", description: "See how all users compare" },
      { name: "Team Standings", href: "/ranking?view=teams", description: "Stack up your office or club" },
      { name: "Persona Stories", href: "/ranking/personas", description: "Success stories by persona" },
      { name: "Regional", href: "/ranking/regions", description: "Top provinces and cities" },
      { name: "Champions", href: "/ranking/champions", description: "Past winners and streaks" },
      { name: "Challenges", href: "/ranking/challenges", description: "Weekly eco duels" },
      { name: "Badges", href: "/ranking/badges", description: "See every tier and perks" },
      { name: "Events", href: "/ranking/events", description: "Meetups and livestreams" },
      { name: "Hall of Fame", href: "/ranking/hall-of-fame", description: "Lifetime achievers" },
    ],
  },
  {
    name: "Personal Investing",
    href: "/investing",
    icon: BarChart3,
    submenu: [
      { name: "Monthly Score", href: "/scoring", description: "Drill into impact drivers" },
      { name: "Benchmarks", href: "/scoring/benchmarks", description: "Compare against peers" },
      { name: "Methodology", href: "/scoring/methodology", description: "Understand the math" },
      { name: "Forecast", href: "/scoring/forecast", description: "Predict future footprints" },
      { name: "Offsets", href: "/scoring/offsets", description: "Plan offsets and credits" },
      { name: "Data Room", href: "/scoring/data", description: "Downloadable scoring data" },
      { name: "Heatmap", href: "/scoring/heatmap", description: "Category-level intensity" },
      { name: "Anomalies", href: "/scoring/anomalies", description: "Detect unusual weeks" },
      { name: "API", href: "/scoring/api", description: "Integrate scoring via API" },
    ],
  },
  {
    name: "Insurance",
    href: "/insurance",
    icon: BarChart3,
    submenu: [
      { name: "Monthly Score", href: "/scoring", description: "Drill into impact drivers" },
      { name: "Benchmarks", href: "/scoring/benchmarks", description: "Compare against peers" },
      { name: "Methodology", href: "/scoring/methodology", description: "Understand the math" },
      { name: "Forecast", href: "/scoring/forecast", description: "Predict future footprints" },
      { name: "Offsets", href: "/scoring/offsets", description: "Plan offsets and credits" },
      { name: "Data Room", href: "/scoring/data", description: "Downloadable scoring data" },
      { name: "Heatmap", href: "/scoring/heatmap", description: "Category-level intensity" },
      { name: "Anomalies", href: "/scoring/anomalies", description: "Detect unusual weeks" },
      { name: "API", href: "/scoring/api", description: "Integrate scoring via API" },
    ],
  },
  {
    name: "Advice",
    href: "/advice",
    icon: Target,
    submenu: [
      { name: "Active Goals", href: "/goals", description: "Track current commitments" },
      { name: "Rewards", href: "/goals/rewards", description: "Redeem eco incentives" },
      { name: "History", href: "/goals/history", description: "Celebrate past milestones" },
      { name: "Coaching", href: "/goals/coaching", description: "Link goals with tips" },
      { name: "Partners", href: "/goals/partners", description: "Connect with local groups" },
      { name: "Blueprints", href: "/goals/blueprints", description: "Preset reduction plans" },
      { name: "Trackers", href: "/goals/trackers", description: "Log progress by habit" },
      { name: "Milestones", href: "/goals/milestones", description: "Unlock extra rewards" },
      { name: "Shared Goals", href: "/goals/shared", description: "Plan with friends and family" },
    ],
  },
];

export const topNavItems: SimpleNavItem[] = [
  { name: "Personal", href: "/personal" },
  { name: "Business", href: "/business" },
  { name: "About Us", href: "/about" },
];

export const languages: LanguageOption[] = [
  { code: "EN", label: "English" },
  { code: "FR", label: "French" },
];