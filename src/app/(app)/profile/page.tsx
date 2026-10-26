import type { Metadata } from "next";
import Link from "next/link";
import { GearSix } from "@phosphor-icons/react/dist/ssr";
import FeedGrid from "@/components/feed/FeedGrid";
import ActiveTradesCard from "@/components/profile/ActiveTradesCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs, { EmptyTab } from "@/components/profile/ProfileTabs";
import { MY_PROFILE } from "@/components/profile/sampleProfiles";
import ShareProfileButton from "@/components/profile/ShareProfileButton";
import TrustStats from "@/components/profile/TrustStats";
import IconButton from "@/components/ui/IconButton";
import ToolRow from "@/components/ui/ToolRow";

export const metadata: Metadata = {
  title: "Profile",
};

export default function MyProfilePage() {
  const profile = MY_PROFILE;

  return (
    // Cancel the shell's padding so the cover runs edge to edge on mobile.
    <div className="-mx-4 -mt-1.5 flex flex-col gap-3 lg:mx-0 lg:mt-0">
      <ProfileHeader
        profile={profile}
        coverActions={
          <>
            <ShareProfileButton handle={profile.handle} />
            <IconButton href="/settings" label="Settings">
              <GearSix size={20} weight="bold" aria-hidden />
            </IconButton>
          </>
        }
        actions={
          <Link
            href="/profile/edit"
            className="flex min-h-11 items-center rounded-button bg-brand-lavender-soft px-[22px] text-body-m font-bold text-brand-plum"
          >
            Edit profile
          </Link>
        }
      />

      <div className="flex flex-col gap-3 px-4">
        <TrustStats profile={profile} />
        <ActiveTradesCard trades={profile.activeTrades} />
        <ProfileTabs
          tabs={[
            {
              id: "posts",
              label: `Posts · ${profile.posts.length}`,
              content:
                profile.posts.length > 0 ? (
                  <FeedGrid posts={profile.posts} />
                ) : (
                  <EmptyTab>Nothing posted yet. Show off something you made!</EmptyTab>
                ),
            },
            {
              id: "for-trade",
              label: `For trade · ${profile.forTrade.length}`,
              content:
                profile.forTrade.length > 0 ? (
                  profile.forTrade.map((tool) => <ToolRow key={tool.id} tool={tool} />)
                ) : (
                  <EmptyTab>No gear up for trade yet.</EmptyTab>
                ),
            },
            {
              id: "reviews",
              label: `Reviews · ${profile.reviewCount}`,
              content: <EmptyTab>Reviews show up here after your trades are rated.</EmptyTab>,
            },
          ]}
        />
      </div>
    </div>
  );
}
