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
      <div className="lg:w-[360px]">
        <SegmentedControl
          label="Saved"
          value={tab}
          onChange={setTab}
          options={[
            { value: "posts", label: `Posts · ${posts.length}` },
            { value: "tools", label: `Tools · ${tools.length}` },
          ]}
        />
      </div>
      {tab === "posts" ? (
        <>
          <div className="flex items-center">
            <h2 className="text-title-m text-ink-900">All saved posts</h2>
            <p className="ml-auto text-caption text-ink-400">Newest first</p>
          </div>
          <FeedGrid posts={posts} />
        </>
      ) : (
        // Two columns of tool rows on desktop so they don't stretch across the screen.
        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-2 lg:gap-4">
          {tools.map((tool) => (
            <ToolRow key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </>
  );
}
