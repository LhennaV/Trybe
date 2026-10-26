import { SAMPLE_POSTS } from "@/components/feed/samplePosts";

export type ToolItem = {
  id: string;
  name: string;
  condition: string;
  category: string;
  upForTrade: boolean;
  lookingFor?: string;
};

export type PostDetail = {
  id: string;
  title: string;
  caption: string;
  photoCount: number;
  author: {
    handle: string;
    city: string;
    rating: number;
    tradeCount: number;
  };
  hobbies: string[];
  tools: ToolItem[];
  likeCount: number;
};

// The one fully written-out post from the Figma prototype.
const MUG_SET: PostDetail = {
  id: "speckled-mug-set",
  title: "My first mug set off the wheel (finally centered the clay!)",
  caption:
    "Took 3 weekends at a community studio before these came out round. Moving to film photography now, so the wheel and my trimming tools need a new home.",
  photoCount: 3,
  author: { handle: "kiln.and.co", city: "Quezon City", rating: 4.9, tradeCount: 23 },
  hobbies: ["Pottery", "Ceramics"],
  tools: [
    {
      id: "shimpo-aspire",
      name: "Shimpo Aspire pottery wheel",
      condition: "Good condition",
      category: "Wheels & kilns",
      upForTrade: true,
      lookingFor: "film camera, or trade +PHP 1,500",
    },
    {
      id: "trimming-tools",
      name: "Trimming tool set (8 pcs)",
      condition: "Like new",
      category: "Hand tools",
      upForTrade: true,
      lookingFor: "crochet hooks or yarn",
    },
    {
      id: "glaze-kit",
      name: "Speckled glaze sample kit",
      condition: "Used",
      category: "Glazes",
      upForTrade: false,
    },
  ],
  likeCount: 128,
};

// Stand-in for the post API. Other feed posts get a bare-bones detail page.
export function getSamplePost(id: string): PostDetail | null {
  if (id === MUG_SET.id) return MUG_SET;

  const post = SAMPLE_POSTS.find((p) => p.id === id);
  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    caption: "",
    photoCount: 1,
    author: { handle: post.authorHandle, city: "Quezon City", rating: 0, tradeCount: 0 },
    hobbies: [post.hobby],
    tools: [],
    likeCount: 0,
  };
}
