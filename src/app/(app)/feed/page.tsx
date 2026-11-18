import type { Metadata } from "next";
import AuthSwitch from "@/components/auth/AuthSwitch";
import FeedHeader from "@/components/feed/FeedHeader";
import HobbyFilter from "@/components/feed/HobbyFilter";
import MatchBanner from "@/components/feed/MatchBanner";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";
import NotificationBell from "@/components/notifications/NotificationBell";

export const metadata: Metadata = {
  title: "Feed",
};

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-3.5 lg:gap-5">
      <FeedHeader />
      {/* Search lives in Explore only (decided 2026-11-18), so the feed is just browsing. */}
      <div className="lg:flex lg:items-center lg:gap-6">
        <div className="sr-only lg:not-sr-only lg:flex lg:flex-1 lg:flex-col lg:gap-1">
          <h1 className="font-display text-display-l text-brand-plum">Find your next hobby</h1>
          <p className="text-body-s text-ink-600">Gear from people near you, picked from what you want to try</p>
        </div>
        <NotificationBell className="hidden lg:block" />
      </div>
      <HobbyFilter posts={SAMPLE_POSTS}>
        <AuthSwitch
          signedIn={
            <MatchBanner
              title="3 pottery setups up for trade near you"
              subtitle='Matches "Pottery", a hobby you want to try'
              href="/search?hobby=Pottery&show=trade"
            />
          }
          signedOut={
            <MatchBanner
              title="Spot something you'd swap for?"
              subtitle="Join free to make offers, save posts, and post your own gear."
              href="/signup"
              action="Sign up"
            />
          }
        />
      </HobbyFilter>
    </div>
  );
}
