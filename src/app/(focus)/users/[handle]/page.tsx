import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import FeedGrid from "@/components/feed/FeedGrid";
import PastTradeRow from "@/components/profile/PastTradeRow";
import ProfileHeader, { type HeaderProfile } from "@/components/profile/ProfileHeader";
import ProfileSafetyMenu from "@/components/profile/ProfileSafetyMenu";
import ProfileTabs, { EmptyTab } from "@/components/profile/ProfileTabs";
import RedirectIfMe from "@/components/profile/RedirectIfMe";
import { getSampleProfile, SAMPLE_PROFILE_HANDLES, type PastTrade } from "@/components/profile/sampleProfiles";
import { timeOnTrybe } from "@/components/profile/timeOnTrybe";
import TrustStats, { type TrustProfile } from "@/components/profile/TrustStats";
import type { FeedPost } from "@/components/feed/samplePosts";
import IconButton from "@/components/ui/IconButton";
import { AppError } from "@/server/errors";
import { getPublicProfile } from "@/server/users/profile";

type ViewProfile = {
  header: HeaderProfile;
  trust: TrustProfile;
  hobbies: string[];
  pastTrades: PastTrade[];
  posts: FeedPost[];
};

// Someone else's profile (PROF-03), from getPublicProfile (the same data as
// GET /api/users/:handle). Cached per request, so the metadata and the page
// share one database read. Past trades and posts have no API yet.
//
// The sample feed still links to sample people (@kiln.and.co...). Until the
// feed is real, those handles fall back to their sample profile instead of 404.
const loadProfile = cache(async (handle: string): Promise<ViewProfile | null> => {
  // Read at request time, never while building (the build has no database).
  await connection();
  try {
    const profile = await getPublicProfile(handle);
    return {
      // Email verification isn't part of the public profile, so it isn't shown.
      header: { ...profile, emailVerified: false, completedTrades: profile.tradeCount },
      trust: { ...profile, timeOnTrybe: timeOnTrybe(profile.memberSince) },
      hobbies: profile.hobbies.map((hobby) => hobby.name),
      pastTrades: [],
      posts: [],
    };
  } catch (error) {
    if (!(error instanceof AppError && error.code === "NOT_FOUND")) throw error;
  }

  const sample = getSampleProfile(handle);
  return sample ? { header: sample, trust: sample, hobbies: sample.hobbies, pastTrades: sample.pastTrades, posts: sample.posts } : null;
});

// Next needs at least one known handle to build the page shell. Real handles
// still render on request.
export function generateStaticParams() {
  return SAMPLE_PROFILE_HANDLES.map((handle) => ({ handle }));
}

export async function generateMetadata(props: PageProps<"/users/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const profile = await loadProfile(handle);
  if (!profile) return { title: "Profile not found" };
  const { displayName, handle: realHandle, bio } = profile.header;
  return {
    title: `${displayName} (@${realHandle})`,
    description: bio || `@${realHandle} trades hobby gear on Trybe.`,
  };
}

// Not async, so the page shell shows instantly and the profile streams in.
export default function UserProfilePage(props: PageProps<"/users/[handle]">) {
  return (
    <Suspense fallback={<ProfileSkeleton className="mx-auto w-full max-w-md pb-8 lg:max-w-[1144px] lg:px-10 lg:pt-7" />}>
      <UserProfile params={props.params} />
    </Suspense>
  );
}

async function UserProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await loadProfile(handle);
  if (!profile) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 pb-8 lg:max-w-[1144px] lg:gap-5 lg:px-10 lg:pt-7">
      <RedirectIfMe handle={profile.header.handle} />
      <ProfileHeader
        profile={profile.header}
        coverHeight={150}
        coverActions={
          <>
            <IconButton href="/feed" label="Back">
              <CaretLeft size={20} weight="bold" aria-hidden />
            </IconButton>
            <ProfileSafetyMenu handle={profile.header.handle} />
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

      {/* Desktop: trust info on the left, tabs on the right. */}
      <div className="flex flex-col gap-3 px-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-0">
        <div className="flex flex-col gap-3">
          <TrustStats profile={profile.trust} />

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
        </div>

        <ProfileTabs
          tabs={[
            {
              id: "trades",
              label: `Trades · ${profile.trust.tradeCount}`,
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
