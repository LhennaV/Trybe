"use client";

import { useState } from "react";
import { useMe } from "@/components/profile/useMe";
import Chip from "@/components/ui/Chip";
import FeedEmpty from "./FeedEmpty";
import FeedGrid from "./FeedGrid";
import type { FeedPost } from "./samplePosts";

// The first chip shows everything. It's "For you" when logged in (picked from
// your hobbies) and "All" when logged out, since there are no hobbies yet.
const ALL = "all";
const HOBBIES = [ALL, "Pottery", "Film photo", "Crochet", "Watercolor", "Baking"];

type HobbyFilterProps = {
  posts: FeedPost[];
  // Rendered between the chips and the grid (the match banner).
  children?: React.ReactNode;
};

// Hobby chips plus the grid they filter (POST-05). Filters the posts already
// on the page for now; the feed endpoint will filter on the server later.
export default function HobbyFilter({ posts, children }: HobbyFilterProps) {
  const [selected, setSelected] = useState(ALL);
  const allLabel = useMe().status === "ready" ? "For you" : "All";
  const visible = selected === ALL ? posts : posts.filter((post) => post.hobby === selected);

  return (
    <>
      <div
        role="group"
        aria-label="Filter by hobby"
        // The vertical padding keeps the chips' enlarged tap targets from being clipped
        // by the scroll container. The negative margin cancels it out visually.
        className="-mx-4 -my-1.5 flex gap-2 overflow-x-auto px-4 py-1.5 [scrollbar-width:none]"
      >
        {HOBBIES.map((hobby) => (
          <Chip
            key={hobby}
            selected={selected === hobby}
            onClick={() => setSelected(hobby)}
            className="shrink-0 whitespace-nowrap"
          >
            {hobby === ALL ? allLabel : hobby}
          </Chip>
        ))}
      </div>

      {children}

      {visible.length > 0 ? <FeedGrid posts={visible} /> : <FeedEmpty hobby={selected} />}
    </>
  );
}
