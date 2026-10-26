"use client";

import { useState } from "react";
import { Heart } from "@phosphor-icons/react";

type LikeButtonProps = {
  postTitle: string;
  // Shown next to the heart when given (post detail). Feed cards hide it.
  initialCount?: number;
  size?: number;
};

// Like a post (POST-06). Local only until the like endpoint exists.
// The ::before keeps the tap target at least 44px even for the 16px heart.
export default function LikeButton({ postTitle, initialCount, size = 16 }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const count = initialCount === undefined ? undefined : initialCount + (liked ? 1 : 0);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={`Like ${postTitle}`}
      onClick={() => setLiked((value) => !value)}
      className="relative flex items-center gap-1.5 text-body-s font-bold text-ink-600 before:absolute before:-inset-3.5"
    >
      <Heart
        size={size}
        weight={liked ? "fill" : "bold"}
        className={liked || count !== undefined ? "text-status-danger" : "text-ink-400"}
        aria-hidden
      />
      {count !== undefined && <span aria-live="polite">{count}</span>}
    </button>
  );
}
