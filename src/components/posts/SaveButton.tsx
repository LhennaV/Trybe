"use client";

import { useState } from "react";
import { BookmarkSimple } from "@phosphor-icons/react";
import IconButton from "@/components/ui/IconButton";

// Save a post (POST-07). A simple save for now; boards are an open decision.
export default function SaveButton({ postTitle }: { postTitle: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <IconButton
      label={saved ? `Unsave ${postTitle}` : `Save ${postTitle}`}
      aria-pressed={saved}
      className={`ml-auto ${saved ? "text-brand-plum" : ""}`}
      onClick={() => setSaved((value) => !value)}
    >
      <BookmarkSimple size={20} weight={saved ? "fill" : "bold"} aria-hidden />
    </IconButton>
  );
}
