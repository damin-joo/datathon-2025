import { FillerContent, FillerSection } from "@/app/components/marketing/FillerPage";

const CTA_DEFAULT = [
  { label: "Book a banker", href: "/goals" },
  { label: "Open an EcoCard", href: "/transactions" },
];

const defaultSections = (topic: string): FillerSection[] => [
  {
    title: "Advisors who know your story",
    body: `Dedicated EcoBank specialists translate your ${topic.toLowerCase()} goals into weekly action plans.`,
    bullets: ["Personalized onboarding call", "Quarterly portfolio reviews", "Secure document vault"],
  },
  {
    title: "Digital tools that feel human",
    body: `Blend real-time alerts, guided recommendations, and ready-made templates inside EcoCard to keep ${topic.toLowerCase()} moving.`,
    bullets: ["Unified dashboard across web + mobile", "Scenario planning for everyday purchases", "Instant collaboration with teammates or family"],
  },
  {
    title: "Ways to get started",
    body: "Choose self-serve playbooks or schedule a conversation with our climate banking team. Either way, you'll see the path forward before opening an account.",
    bullets: ["Same-day welcome checklist", "Sample statements and scorecards", "Secure messaging with EcoBank"],
  },
];

const buildContent = (title: string, description: string, options?: Partial<FillerContent>): FillerContent => ({
  eyebrow: options?.eyebrow ?? "EcoBank experience",
  title,
  description,
  sections: options?.sections ?? defaultSections(title),
  actions: options?.actions ?? CTA_DEFAULT,
});

export const fillerContent: Record<string, FillerContent> = {
  accounts: buildContent("Accounts & Everyday Banking", "Bundle chequing, savings, and carbon analytics the way modern households and teams expect."),
  "credit-cards": buildContent("Credit Cards", "Pick from travel, cash back, and carbon-optimized cards that all feed data into your EcoCard footprint."),
  borrowing: buildContent("Borrowing", "From green mortgages to low-emission auto loans, our borrowing centre keeps rates transparent and goals accountable."),
  "personal-investing": buildContent("Personal Investing", "Pair traditional wealth strategies with impact metrics so you always see the emissions tied to your capital."),
  insurance: buildContent("Insurance", "Protect what matters with coverage that rewards low-impact habits and keeps claims simple."),
  advice: buildContent("Advice Centre", "Tap EcoBank coaches, webinars, and curated playbooks built for households—and teams—who want greener finances."),
  about: buildContent("About EcoBank", "We are a Canadian climate-first bank helping every purchase, policy, and plan lower emissions."),
  personal: buildContent("Personal Banking", "Lifestyle bundles that make budgeting, rewards, and eco scores feel cohesive."),
  business: buildContent("Business Banking", "Cash management, employee engagement, and emissions reporting under one secure login."),
  coaching: buildContent("Eco Coaching", "Weekly nudges, seasonal goals, and playbooks curated by advisors who understand behavioural science."),
  alerts: buildContent("Carbon & Spend Alerts", "Choose the thresholds that matter—category spikes, carbon surges, or low-balance warnings."),
  insights: buildContent("Impact Insights", "Benchmark your household or workplace against similar peers with curated narratives, not spreadsheets."),
  lifestyle: buildContent("Lifestyle Plans", "See the carbon ripple of travel, food, and wellness choices before you tap the card."),
  rewards: buildContent("Rewards Studio", "Redeem perks for transit, home retrofits, or local eco brands—plus classic cash back."),
  communities: buildContent("Communities", "Launch mini-leagues for campuses, clubs, or teams with zero IT lift."),
  resources: buildContent("Resource Library", "Printable guides, calculators, and videos that translate ESG jargon into plain language."),
  stories: buildContent("Member Stories", "Browse how families, students, and businesses cut emissions without losing joy."),
  "ranking/personas": buildContent("Persona Stories", "Understand archetypes inside the Eco Ranking League and borrow their best habits."),
  "ranking/regions": buildContent("Regional Leaders", "See which provinces and cities are trending toward net-zero—and how they got there."),
  "ranking/champions": buildContent("Champions", "Celebrate the households and teams topping the Eco Ranking leaderboard."),
  "ranking/challenges": buildContent("Challenges", "Weekly and seasonal eco missions with rewards for participation, not perfection."),
  "ranking/badges": buildContent("Badge Guide", "Decode every EcoBank badge plus tips to level up."),
  "ranking/events": buildContent("Events", "Town halls, livestreams, and in-branch labs focused on greener finances."),
  "ranking/hall-of-fame": buildContent("Hall of Fame", "A living archive of the most impactful EcoBank members."),
  "scoring/benchmarks": buildContent("Benchmarks", "Compare your eco score against similar spenders and teams."),
  "scoring/methodology": buildContent("Methodology", "Transparent math showing how EcoBank calculates scores and points."),
  "scoring/forecast": buildContent("Forecast", "Project how upcoming trips, renovations, or events will shift your score."),
  "scoring/offsets": buildContent("Offsets & Credits", "Curated partners plus reporting that proves where your dollars go."),
  "scoring/data": buildContent("Data Room", "Download CSVs and ready-made dashboards for your sustainability report."),
  "scoring/heatmap": buildContent("Heatmap", "Visualize category intensity to decide where to focus next."),
  "scoring/anomalies": buildContent("Anomaly Detection", "Catch outlier purchases or carbon spikes in minutes."),
  "scoring/api": buildContent("Scoring API", "Embed Eco scores directly into your internal tools."),
  "goals/rewards": buildContent("Goal Rewards", "Earn boosts, fee rebates, and partner perks whenever you hit milestones."),
  "goals/history": buildContent("Goal History", "An interactive log of every challenge you've completed."),
  "goals/coaching": buildContent("Goal Coaching", "Pair each target with advisor check-ins and nudges."),
  "goals/partners": buildContent("Partner Network", "Local installers, nonprofits, and vendors vetted by EcoBank."),
  "goals/blueprints": buildContent("Blueprint Library", "Preset plans for EV adoption, retrofits, and low-waste living."),
  "goals/trackers": buildContent("Habit Trackers", "Micro-metrics that keep big goals realistic."),
  "goals/milestones": buildContent("Milestones", "Celebrate progress with digital badges and real rewards."),
  "goals/shared": buildContent("Shared Goals", "Invite family, roommates, or coworkers to co-own a target."),
};

export const allFillerSlugs = Object.keys(fillerContent);

export function getFillerContent(slug: string) {
  return fillerContent[slug];
}
