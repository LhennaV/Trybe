export type TraderLevel = {
  level: number;
  name: string;
  minTrades: number;
  // Short explanation for the badge info sheet or profile.
  meaning: string;
  badgeClassName: string;
  pawClassName: string;
};

// Ordered from lowest to highest. A trader's level is the highest one whose
// minTrades they've reached, so badges only ever go up.
export const TRADER_LEVELS: TraderLevel[] = [
  {
    level: 1,
    name: "Curious Mingming",
    minTrades: 0,
    meaning: "New to Trybe and just starting to peek around.",
    // Keep blush at 50%. At full strength the label fails contrast in dark mode.
    badgeClassName: "bg-brand-blush/50 text-ink-900",
    pawClassName: "text-brand-plum",
  },
  {
    level: 2,
    name: "Box Peeker",
    minTrades: 1,
    meaning: "Finished their first trade.",
    badgeClassName: "bg-brand-box-soft text-ink-900",
    pawClassName: "text-brand-box-dark",
  },
  {
    level: 3,
    name: "Alley Cat",
    minTrades: 5,
    meaning: "Knows their way around the neighborhood. 5 or more trades.",
    badgeClassName: "bg-brand-lavender-soft text-ink-900",
    pawClassName: "text-brand-plum",
  },
  {
    level: 4,
    name: "Top Cat",
    minTrades: 15,
    meaning: "A trusted regular. 15 or more trades.",
    badgeClassName: "bg-brand-lavender-soft text-brand-plum ring-[1.5px] ring-inset ring-brand-plum",
    pawClassName: "text-brand-plum",
  },
  {
    level: 5,
    name: "Nine Lives",
    minTrades: 30,
    meaning: "Has traded through it all. 30 or more trades.",
    badgeClassName: "bg-brand-plum text-surface-white",
    pawClassName: "text-surface-white",
  },
];

export function getTraderLevel(completedTrades: number): TraderLevel {
  let current = TRADER_LEVELS[0];
  for (const level of TRADER_LEVELS) {
    if (completedTrades >= level.minTrades) current = level;
  }
  return current;
}

// The next level and how many more trades it takes, or null at the top.
export function getNextTraderLevel(
  completedTrades: number,
): { level: TraderLevel; tradesToGo: number } | null {
  const next = TRADER_LEVELS.find((level) => level.minTrades > completedTrades);
  return next ? { level: next, tradesToGo: next.minTrades - completedTrades } : null;
}
