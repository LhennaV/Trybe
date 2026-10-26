import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import FeedGrid from "@/components/feed/FeedGrid";
import PastTradeRow from "@/components/profile/PastTradeRow";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSafetyMenu from "@/components/profile/ProfileSafetyMenu";
import ProfileTabs, { EmptyTab } from "@/components/profile/ProfileTabs";
import { getSampleProfile, SAMPLE_PROFILE_HANDLES } from "@/components/profile/sampleProfiles";
import TrustStats from "@/components/profile/TrustStats";
import IconButton from "@/components/ui/IconButton";

export function generateStaticParams() {
  return SAMPLE_PROFILE_HANDLES.map((handle) => ({ handle }));
}

export async function generateMetadata(props: PageProps<"/users/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const profile = getSampleProfile(handle);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.displayName} (@${profile.handle})`,
    description: profile.bio || `@${profile.handle} trades hobby gear on Trybe.`,
  };
}

// Not async, so the page shell shows instantly and the profile streams in.
export default function UserProfilePage(props: PageProps<"/users/[handle]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfile params={props.params} />
    </Suspense>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col" aria-busy="true" aria-label="Loading profile">
      <div className="h-[150px] bg-brand-lavender" />
      <div className="flex flex-col gap-3 px-4">
        <span className="-mt-[42px] size-[84px] rounded-chip bg-line ring-4 ring-brand-cream" />
        <span className="h-6 w-40 rounded-chip bg-line" />
        <span className="h-4 w-56 rounded-chip bg-line" />
      </div>
    </div>
  );
}

async function UserProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = getSampleProfile(handle);
  if (!profile) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 pb-8">
      <ProfileHeader
        profile={profile}
        coverHeight={150}
        coverActions={
          <>
            <IconButton href="/" label="Back">
              <CaretLeft size={20} weight="bold" aria-hidden />
            </IconButton>
            <ProfileSafetyMenu handle={profile.handle} />
          </>
        }
        actions={
          // Follow is an open decision (PROF-08), so only Message for now.
          <button
            type="button"
            className="flex min-h-11 items-center rounded-button border-[1.5px] border-line bg-surface-white px-[22px] text-body-m font-bold text-ink-900"
          >
            Message
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4">
        <TrustStats profile={profile} />

        {profile.hobbies.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Hobbies">
            {profile.hobbies.map((hobby) => (
              <li
                key={hobby}
                className="rounded-chip border-[1.5px] border-line bg-surface-white px-3.5 py-2 text-body-s font-bold text-ink-600"
              >
                {hobby}
              </li>
            ))}
          </ul>
        )}

        <ProfileTabs
          tabs={[
            {
              id: "trades",
              label: `Trades · ${profile.tradeCount}`,
              content:
                profile.pastTrades.length > 0 ? (
                  profile.pastTrades.map((trade) => <PastTradeRow key={trade.id} trade={trade} />)
                ) : (
                  <EmptyTab>No finished trades yet.</EmptyTab>
                ),
            },
            {
              id: "posts",
              label: `Posts · ${profile.posts.length}`,
              content:
                profile.posts.length > 0 ? (
                  <FeedGrid posts={profile.posts} />
                ) : (
                  <EmptyTab>Nothing posted yet.</EmptyTab>
                ),
            },
            {
              id: "reviews",
              label: "Reviews",
              content: <EmptyTab>Reviews show up here once both sides rate a trade.</EmptyTab>,
            },
          ]}
        />
      </div>
    </div>
  );
}
