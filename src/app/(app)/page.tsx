import type { Metadata } from "next";
import FeedHeader from "@/components/feed/FeedHeader";
import FeedSearch from "@/components/feed/FeedSearch";
import HobbyFilter from "@/components/feed/HobbyFilter";
import MatchBanner from "@/components/feed/MatchBanner";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";

export const metadata: Metadata = {
  title: { absolute: "Trybe" },
};

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-3.5">
      <h1 className="sr-only">Feed</h1>
      <FeedHeader />
      <FeedSearch />
      <HobbyFilter posts={SAMPLE_POSTS}>
        <MatchBanner
          title="3 pottery setups up for trade near you"
          subtitle="Matches the hobby you want to try"
          href="/explore"
        />
      </HobbyFilter>
    </div>
  );
}
