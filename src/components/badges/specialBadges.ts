export type SpecialBadgeId = "founding-paw" | "og-box-cat" | "first-litter";

export type SpecialBadgeInfo = {
  id: SpecialBadgeId;
  name: string;
  // Who gets it, as a short label ("Alpha testers").
  audience: string;
  // Short explanation for the badge info sheet or profile.
  meaning: string;
  // Paw is our custom icon. Package and cat are Phosphor.
  icon: "paw" | "package" | "cat";
};

// Earned once, never lost, and closed for good after their window. Unlike
// level badges, they don't come from trade counts. The backend decides who has one.
export const SPECIAL_BADGES: SpecialBadgeInfo[] = [
  {
    id: "founding-paw",
    name: "Founding Paw",
    audience: "Founders",
    meaning: "Started Trybe. Given by hand to the founders only.",
    icon: "paw",
  },
  {
    id: "og-box-cat",
    name: "OG Box Cat",
    audience: "Alpha testers",
    meaning: "You tried the prototype before Trybe was even built.",
    icon: "package",
  },
  {
    id: "first-litter",
    name: "First Litter",
    audience: "Beta testers",
    meaning: "You signed up before launch and made your first post or trade.",
    icon: "cat",
  },
];

export function getSpecialBadge(id: SpecialBadgeId): SpecialBadgeInfo {
  return SPECIAL_BADGES.find((badge) => badge.id === id) ?? SPECIAL_BADGES[0];
}
