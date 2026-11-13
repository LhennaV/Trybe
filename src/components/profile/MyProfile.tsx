"use client";

import Link from "next/link";
import { GearSix, Plus, SignIn } from "@phosphor-icons/react";
import { buttonClassName } from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import ProfileHeader from "./ProfileHeader";
import ProfileSkeleton from "./ProfileSkeleton";
import ProfileTabs, { EmptyTab } from "./ProfileTabs";
import ShareProfileButton from "./ShareProfileButton";
import TrustStats from "./TrustStats";
import { loadMe, timeOnTrybe, useMe } from "./useMe";

// Your own profile (PROF-02), from GET /api/me. Posts, gear, and reviews
// have no API yet (Phase 2 and 4), so their tabs show the empty states.
export default function MyProfile() {
  const state = useMe();

  if (state.status === "loading") return <ProfileSkeleton className="-mx-4 -mt-1.5 lg:mx-0 lg:mt-0" />;

  if (state.status !== "ready") {
    const signedOut = state.status === "signed-out";
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="font-display text-display-m text-ink-900">
          {signedOut ? "Log in to see your profile" : "We couldn't load your profile"}
        </h1>
        <p className="max-w-[300px] text-body-s text-ink-600">
          {signedOut ? "Your posts, gear, and trades live here once you're in." : state.message}
        </p>
        {signedOut ? (
          <Link href="/login" className={buttonClassName({ className: "mt-2" })}>
            <SignIn size={20} weight="bold" aria-hidden />
            Log in
          </Link>
        ) : (
          <button type="button" onClick={() => void loadMe(true)} className={buttonClassName({ className: "mt-2" })}>
            Try again
          </button>
        )}
      </div>
    );
  }

  const { me } = state;

  return (
    // Cancel the shell's padding so the cover runs edge to edge on mobile.
    <div className="-mx-4 -mt-1.5 flex flex-col gap-3 lg:mx-0 lg:mt-0 lg:gap-5">
      <ProfileHeader
        profile={{ ...me, completedTrades: me.tradeCount }}
        coverActions={
          <>
            <ShareProfileButton handle={me.handle} />
            <IconButton href="/settings" label="Settings">
              <GearSix size={20} weight="bold" aria-hidden />
            </IconButton>
          </>
        }
        actions={
          <Link
            href="/settings/profile"
            className="flex min-h-11 items-center rounded-button bg-brand-lavender-soft px-[22px] text-body-m font-bold text-brand-plum"
          >
            Edit profile
          </Link>
        }
      />

      {/* Desktop: stats on the left, tabs on the right. */}
      <div className="flex flex-col gap-3 px-4 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-0">
        <TrustStats profile={{ ...me, timeOnTrybe: timeOnTrybe(me.memberSince) }} />
        <ProfileTabs
          tabs={[
            {
              id: "posts",
              label: "Posts",
              content: (
                <EmptyTab>
                  <span className="flex flex-col items-center gap-3">
                    Nothing posted yet. Show off something you made!
                    <Link href="/new" className={buttonClassName({ variant: "secondary" })}>
                      <Plus size={18} weight="bold" aria-hidden />
                      New post
                    </Link>
                  </span>
                </EmptyTab>
              ),
            },
            {
              id: "for-trade",
              label: "For trade",
              content: <EmptyTab>No gear up for trade yet. Tag your tools in a post to list them.</EmptyTab>,
            },
            {
              id: "reviews",
              label: `Reviews · ${me.reviewCount}`,
              content: <EmptyTab>Reviews show up here after your trades are rated.</EmptyTab>,
            },
          ]}
        />
      </div>
    </div>
  );
}
