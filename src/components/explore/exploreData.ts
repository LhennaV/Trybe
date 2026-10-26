// Sample Explore data from the Figma prototype. Counts come from the hobby
// counts endpoint later (EXP-01, EXP-03), measured from the user's city.

export type HobbyTile = {
  name: string;
  // Matches the hobby value on posts, so the tile can filter search results.
  hobby: string;
  count: string;
  tone: "box" | "lavender" | "blush" | "success" | "warning";
};

export const HOBBY_TILES: HobbyTile[] = [
  { name: "Pottery", hobby: "Pottery", count: "14 kits near you", tone: "box" },
  { name: "Film photo", hobby: "Film photo", count: "9 cameras", tone: "lavender" },
  { name: "Crochet", hobby: "Crochet", count: "22 hook sets", tone: "blush" },
  { name: "Calligraphy", hobby: "Calligraphy", count: "11 pen kits", tone: "success" },
  { name: "Bookbinding", hobby: "Bookbinding", count: "6 starter sets", tone: "warning" },
  { name: "Bouldering", hobby: "Bouldering", count: "8 shoe pairs", tone: "lavender" },
];

export type StarterKit = {
  id: string;
  title: string;
  authorHandle: string;
  toolCount: number;
};

export const STARTER_KITS: StarterKit[] = [
  { id: "kit-1", title: "Calligraphy starter: nibs, ink, pad", authorHandle: "papelero", toolCount: 4 },
  { id: "kit-2", title: "Beginner loom + 3 skeins", authorHandle: "weftandwarp", toolCount: 3 },
  { id: "kit-3", title: "Bouldering shoes, EU 39 + chalk bag", authorHandle: "crimp.city", toolCount: 2 },
];
