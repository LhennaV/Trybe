import type { Metadata } from "next";
import FeedHeader from "@/components/feed/FeedHeader";
import FeedSearch from "@/components/feed/FeedSearch";
import HobbyFilter from "@/components/feed/HobbyFilter";
import MatchBanner from "@/components/feed/MatchBanner";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";
import NotificationBell from "@/components/notifications/NotificationBell";

export const metadata: Metadata = {
  title: { absolute: "Trybe" },
};

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-3.5 lg:gap-5">
      <FeedHeader />
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:gap-6">
        <div className="sr-only lg:not-sr-only lg:flex lg:flex-1 lg:flex-col lg:gap-1">
          <h1 className="font-display text-display-l text-brand-plum">Find your next hobby</h1>
          <p className="text-body-s text-ink-600">Gear from people near you, picked from what you want to try</p>
        </div>
        <div className="flex items-center gap-3 lg:w-[496px]">
          <div className="min-w-0 flex-1">
            <FeedSearch />
          </div>
          <NotificationBell className="hidden lg:block" />
        </div>
      </div>
      <HobbyFilter posts={SAMPLE_POSTS}>
        <MatchBanner
          title="3 pottery setups up for trade near you"
          subtitle='Matches "Pottery", a hobby you want to try'
          href="/search?hobby=Pottery&show=trade"
        />
      </HobbyFilter>
    </div>
  );
}
