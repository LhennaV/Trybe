"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";

const HOBBIES = ["For you", "Pottery", "Film photo", "Crochet", "Watercolor", "Baking"];

// Picking a hobby only highlights it for now. Filtering comes with the feed API.
export default function HobbyFilter() {
  const [selected, setSelected] = useState(HOBBIES[0]);

  return (
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
          {hobby}
        </Chip>
      ))}
    </div>
  );
}
