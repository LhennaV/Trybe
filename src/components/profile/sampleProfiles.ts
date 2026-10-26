import type { FeedPost } from "@/components/feed/samplePosts";
import type { ToolItem } from "@/components/posts/samplePostDetails";
import type { TradeStatus } from "@/components/ui/StatusPill";

export type PastTrade = {
  id: string;
  got: string;
  gave: string;
  withHandle: string;
  rating: number;
  month: string;
  thumb: "camera" | "package";
};

export type ActiveTrade = {
  id: string;
  title: string;
  withHandle: string;
  note?: string;
  status: TradeStatus;
  statusLabel: string;
};

export type Profile = {
  displayName: string;
  handle: string;
  city: string;
  bio: string;
  rating: number;
  reviewCount: number;
  tradeCount: number;
  // Precomputed for now. Comes from account age once the profile API exists.
  timeOnTrybe: string;
  emailVerified: boolean;
  completedTrades: number;
  hobbies: string[];
  posts: FeedPost[];
  forTrade: ToolItem[];
  pastTrades: PastTrade[];
};

// The signed-in sample user from the prototype.
export const MY_PROFILE: Profile & { activeTrades: ActiveTrade[] } = {
  displayName: "Storm",
  handle: "stormi",
  city: "Quezon City",
  bio: "",
  rating: 5,
  reviewCount: 4,
  tradeCount: 4,
  timeOnTrybe: "3 mo",
  emailVerified: true,
  completedTrades: 4,
  hobbies: ["Crochet", "Film photography"],
  posts: [
    {
      id: "amigurumi-frog",
      title: "Amigurumi frog, free pattern",
      authorHandle: "stormi",
      hobby: "Crochet",
      photoUrl: null,
      photoShape: "short",
      upForTrade: false,
    },
    {
      id: "crochet-hook-set",
      title: "Crochet hook set + 4 skeins",
      authorHandle: "stormi",
      hobby: "Crochet",
      photoUrl: null,
      photoShape: "short",
      upForTrade: true,
    },
  ],
  forTrade: [
    {
      id: "canon-ae1",
      name: "Canon AE-1",
      condition: "Good condition",
      category: "Film cameras",
      upForTrade: true,
      lookingFor: "pottery wheel or kiln time",
    },
    {
      id: "crochet-hooks",
      name: "Crochet hook set (12 pcs)",
      condition: "Like new",
      category: "Hand tools",
      upForTrade: true,
      lookingFor: "bookbinding tools",
    },
  ],
  pastTrades: [],
  activeTrades: [
    {
      id: "ae1-shimpo",
      title: "AE-1 for Shimpo wheel",
      withHandle: "kiln.and.co",
      status: "pending",
      statusLabel: "Counter",
    },
    {
      id: "hooks-lace",
      title: "Hooks for lace kit",
      withHandle: "mika.makes",
      note: "rate now",
      status: "accepted",
      statusLabel: "Rate",
    },
  ],
};

const KILN_AND_CO: Profile = {
  displayName: "Kiln & Co.",
  handle: "kiln.and.co",
  city: "Quezon City",
  bio: "Weekend potter slowly turning into a film nerd. Always down to swap clay tools for cameras.",
  rating: 4.9,
  reviewCount: 23,
  tradeCount: 23,
  timeOnTrybe: "1y 4m",
  emailVerified: true,
  completedTrades: 23,
  hobbies: ["Pottery", "Film photography", "Baking"],
  posts: [
    {
      id: "speckled-mug-set",
      title: "Speckled mug set + my trusty wheel",
      authorHandle: "kiln.and.co",
      hobby: "Pottery",
      photoUrl: null,
      photoShape: "tall",
      upForTrade: true,
    },
  ],
  forTrade: [],
  pastTrades: [
    {
      id: "yashica",
      got: "Yashica Electro 35",
      gave: "wedging board",
      withHandle: "filmbyjo",
      rating: 5,
      month: "Sep 2026",
      thumb: "camera",
    },
    {
      id: "sourdough",
      got: "sourdough starter kit + PHP 300",
      gave: "clay extruder",
      withHandle: "rise.bakes",
      rating: 5,
      month: "Jul 2026",
      thumb: "package",
    },
    {
      id: "macrame",
      got: "macramé cord bundle",
      gave: "10 kg stoneware clay",
      withHandle: "knotsbynina",
      rating: 4,
      month: "May 2026",
      thumb: "package",
    },
  ],
};

const PROFILES = [KILN_AND_CO];

// Stand-in for GET /api/users/:handle.
export function getSampleProfile(handle: string): Profile | null {
  return PROFILES.find((profile) => profile.handle === handle) ?? null;
}

export const SAMPLE_PROFILE_HANDLES = PROFILES.map((profile) => profile.handle);
