"use client";

import { useState } from "react";
import FeedGrid from "@/components/feed/FeedGrid";
import type { FeedPost } from "@/components/feed/samplePosts";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ToolRow from "@/components/ui/ToolRow";
import type { ToolItem } from "./samplePostDetails";

export default function SavedTabs({ posts, tools }: { posts: FeedPost[]; tools: ToolItem[] }) {
  const [tab, setTab] = useState<"posts" | "tools">("posts");

  return (
    <>
      <SegmentedControl
        label="Saved"
        value={tab}
        onChange={setTab}
        options={[
          { value: "posts", label: `Posts · ${posts.length}` },
          { value: "tools", label: `Tools · ${tools.length}` },
        ]}
      />
      {tab === "posts" ? (
        <>
          <div className="flex items-center">
            <h2 className="text-title-m text-ink-900">All saved posts</h2>
            <p className="ml-auto text-caption text-ink-400">Newest first</p>
          </div>
          <FeedGrid posts={posts} />
        </>
      ) : (
        tools.map((tool) => <ToolRow key={tool.id} tool={tool} />)
      )}
    </>
  );
}
