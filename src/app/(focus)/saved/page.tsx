import type { Metadata } from "next";
import SavedTabs from "@/components/posts/SavedTabs";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";
import { getSamplePost } from "@/components/posts/samplePostDetails";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

// Saved posts and tools (POST-07). Simple save only: the boards in the Figma
// are left out while "boards or simple save" is an open decision.
// Mobile: a full-screen page with a back button. Desktop: Saved is in the
// sidebar, so it fills the main area like the feed (28px top, 40px sides),
// with no back button and a Lilita title.
export default function SavedPage() {
  const posts = SAMPLE_POSTS.filter((post) => post.upForTrade);
  const tools = getSamplePost("speckled-mug-set")?.tools ?? [];

  return (
    <main
      className={[
        "mx-auto flex w-full max-w-md md:max-w-2xl flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]",
        "lg:mx-0 lg:max-w-none lg:gap-5 lg:px-10 lg:pt-7 lg:pb-10",
        "lg:[&_[data-topbar-back]]:hidden lg:[&_[data-topbar-title]]:font-display lg:[&_[data-topbar-title]]:text-display-l lg:[&_[data-topbar-title]]:text-brand-plum",
      ].join(" ")}
    >
      <TopBar title="Saved" backHref="/settings" />
      <SavedTabs posts={posts} tools={tools} />
    </main>
  );
}
