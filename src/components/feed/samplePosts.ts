export type FeedPost = {
  id: string;
  title: string;
  authorHandle: string;
  hobby: string;
  // Null until real uploads exist. The card shows a placeholder instead.
  photoUrl: string | null;
  // Tall photos are about 3:4, short ones about 1:1. The feed alternates them.
  photoShape: "tall" | "short";
  upForTrade: boolean;
};

// Sample posts from the Figma prototype, used until the feed API exists.
// The prototype photos are AI placeholders, so they're left out on purpose.
export const SAMPLE_POSTS: FeedPost[] = [
  {
    id: "speckled-mug-set",
    title: "Speckled mug set + my trusty wheel",
    authorHandle: "kiln.and.co",
    hobby: "Pottery",
    photoUrl: null,
    photoShape: "tall",
    upForTrade: true,
  },
  {
    id: "pentax-k1000",
    title: "Pentax K1000 with 3 rolls of HP5",
    authorHandle: "filmbyjo",
    hobby: "Film photo",
    photoUrl: null,
    photoShape: "short",
    upForTrade: true,
  },
  {
    id: "amigurumi-cat",
    title: "Amigurumi cat, pattern in caption",
    authorHandle: "hookedonyarn",
    hobby: "Crochet",
    photoUrl: null,
    photoShape: "short",
    upForTrade: false,
  },
  {
    id: "sumi-ink-kit",
    title: "Sumi ink and brush starter kit",
    authorHandle: "papelero",
    hobby: "Calligraphy",
    photoUrl: null,
    photoShape: "tall",
    upForTrade: true,
  },
  {
    id: "coptic-sketchbook",
    title: "Hand-bound coptic sketchbook",
    authorHandle: "foldandstitch",
    hobby: "Bookbinding",
    photoUrl: null,
    photoShape: "tall",
    upForTrade: false,
  },
  {
    id: "banneton-whisk",
    title: "Banneton + dough whisk, barely used",
    authorHandle: "rise.bakes",
    hobby: "Baking",
    photoUrl: null,
    photoShape: "short",
    upForTrade: true,
  },
];
