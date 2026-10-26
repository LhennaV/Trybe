import type { Metadata } from "next";
import SavedTabs from "@/components/posts/SavedTabs";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";
import { getSamplePost } from "@/components/posts/samplePostDetails";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

// Saved posts and tools (POST-07). Simple save only: the boards in the Figma
// are left out while "boards or simple save" is an open decision.
export default function SavedPage() {
  const posts = SAMPLE_POSTS.filter((post) => post.upForTrade);
  const tools = getSamplePost("speckled-mug-set")?.tools ?? [];

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Saved" backHref="/settings" />
      <SavedTabs posts={posts} tools={tools} />
    </main>
  );
}
