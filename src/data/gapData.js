// Olympic medals won by Indian athletes, by gender, per Games.
// Source: Olympics.com / Wikipedia Indian Olympic medal records.
export const medalData = [
  { games: "Athens 2004", women: 0, men: 1 },
  { games: "Beijing 2008", women: 0, men: 3 },
  { games: "London 2012", women: 2, men: 4 },
  { games: "Rio 2016", women: 2, men: 0 },
  { games: "Tokyo 2020", women: 3, men: 4 },
  { games: "Paris 2024", women: 2, men: 4 },
];

// Global sports media coverage split.
// Source: 2023 industry study widely cited (women's sports ~15% of total coverage).
export const coverageData = [
  { name: "Men's Sports Coverage", value: 85, color: "#6366f1" },
  { name: "Women's Sports Coverage", value: 15, color: "#e11d85" },
];

export const coverageNote =
  "In India specifically, the gap is narrowing fastest in cricket: 34% of fans watch the men's IPL vs 28% who now watch the Women's Premier League — a 6-point gap, down sharply since the WPL launched in 2023.";

// Estimated annual brand endorsements, in INR crore.
// Illustrative — based on public reporting on athlete brand valuations, not audited figures.
export const sponsorData = [
  { athlete: "Virat Kohli", gender: "M", sponsorship: 227 },
  { athlete: "MS Dhoni", gender: "M", sponsorship: 156 },
  { athlete: "Rohit Sharma", gender: "M", sponsorship: 98 },
  { athlete: "PV Sindhu", gender: "F", sponsorship: 50 },
  { athlete: "Mary Kom", gender: "F", sponsorship: 12 },
  { athlete: "Mithali Raj", gender: "F", sponsorship: 8 },
  { athlete: "Mirabai Chanu", gender: "F", sponsorship: 5 },
];

// Indexed participation growth by sport (2000 = baseline). Illustrative trend,
// modeled to reflect widely reported growth in women's grassroots participation.
export const participationData = [
  { year: 2000, cricket: 12, badminton: 8, boxing: 3, athletics: 15, wrestling: 2 },
  { year: 2005, cricket: 18, badminton: 12, boxing: 8, athletics: 20, wrestling: 6 },
  { year: 2010, cricket: 25, badminton: 18, boxing: 15, athletics: 28, wrestling: 12 },
  { year: 2015, cricket: 40, badminton: 30, boxing: 22, athletics: 38, wrestling: 20 },
  { year: 2020, cricket: 60, badminton: 50, boxing: 35, athletics: 52, wrestling: 30 },
];

// India's "leaky pipeline" in STEM — women present at each stage of the pipeline.
// Sources: AISHE / DST data via IMPRI policy update; ThePrint (2019 faculty study);
// UNESCO 2022 report on female principal investigators.
export const stemPipelineData = [
  { stage: "STEM Graduates", women: 43, men: 57 },
  { stage: "R&D Workforce", women: 18.6, men: 81.4 },
  { stage: "STEM Faculty", women: 14, men: 86 },
  { stage: "IIT / IISc Faculty", women: 10, men: 90 },
];

// Women-led startup funding in India.
// Sources: Inc42 / Tracxn / YourStory 2024-25 reporting.
export const startupStats = [
  {
    value: "7.5%",
    label: "of all active Indian startups are women-led — over 7,000 companies",
  },
  {
    value: "$930M",
    label: "raised by women-led startups in 2024, up 94% year-on-year",
  },
  {
    value: "3.96%",
    label: "share of 2024 global startup funding captured by Indian women-led startups (still #2 worldwide)",
  },
  {
    value: "-25%",
    label: "year-on-year funding decline specifically for women-co-led tech startups in 2024",
  },
];

// Structural / support gaps — qualitative, not precise percentages, because
// hard national statistics on this aren't consistently published.
export const supportGaps = [
  {
    factor: "Domestic professional leagues",
    men: "Long-running leagues in nearly every major sport (IPL since 2008, ISL, PKL, etc.)",
    women: "Few dedicated leagues; most only launched in the last 5 years (WPL started 2023)",
  },
  {
    factor: "Coaching pipeline",
    men: "Established ex-player-to-coach pathway with senior roles across federations",
    women: "Fewer women retained as head coaches or in federation leadership after playing careers",
  },
  {
    factor: "Career continuity",
    men: "Career breaks are rare and rarely career-ending",
    women: "Pregnancy and caregiving breaks routinely end careers; few federations have return-to-play support",
  },
  {
    factor: "STEM research funding & mentorship",
    men: "Established senior-researcher networks and unbroken pipeline into leadership",
    women: "43% of STEM graduates, but only 18.6% of the R&D workforce — most attrition happens early-career",
  },
];

// Concrete, actionable ways to close the gap.
export const gapSolutions = [
  {
    title: "Pay & prize-money parity",
    description:
      "Mandate equal prize money across national federations — cricket, badminton, and a few others already have; most sports still don't.",
  },
  {
    title: "Guaranteed media windows",
    description:
      "Prime-time broadcast slots and minimum coverage quotas for women's leagues and events, not just when a team is winning.",
  },
  {
    title: "More domestic leagues",
    description:
      "Extend the WPL model — a fully professional, well-funded domestic league — to badminton, boxing, athletics, and wrestling.",
  },
  {
    title: "Women in coaching & leadership",
    description:
      "Active pathways and quotas for retired women athletes to move into head coach, selector, and federation leadership roles.",
  },
  {
    title: "Return-to-play support",
    description:
      "Federation-backed maternity leave, training stipends, and ranking protection so a career break doesn't mean a career end.",
  },
  {
    title: "Safe, funded infrastructure",
    description:
      "Dedicated women's hostels, physiotherapy, and security at every SAI and state academy — not an afterthought bolted onto men's facilities.",
  },
  {
    title: "Fix the STEM leaky pipeline",
    description:
      "Ring-fenced early-career research grants and re-entry fellowships for women after PhD/postdoc, where most attrition happens.",
  },
  {
    title: "Gender-lens investing",
    description:
      "More VC funds and accelerator programs with explicit mandates and cap-table diversity requirements for women-led startups.",
  },
];
