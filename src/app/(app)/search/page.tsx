import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import FeedGrid from "@/components/feed/FeedGrid";
import FeedSearch from "@/components/feed/FeedSearch";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";
import Avatar from "@/components/ui/Avatar";
import IconButton from "@/components/ui/IconButton";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

type Params = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

// Search results (EXP-02). Filters the sample posts for now; the search
// endpoint handles text, hobby, condition, distance, and sort later.
export default function SearchPage(props: PageProps<"/search">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="h-40" />}>
      <Results searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Results({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const q = list(params.q)[0]?.trim() ?? "";
  const hobbies = list(params.hobby);
  const show = list(params.show)[0];
  const needle = q.toLowerCase();

  const posts = SAMPLE_POSTS.filter(
    (post) =>
      (!needle ||
        post.title.toLowerCase().includes(needle) ||
        post.hobby.toLowerCase().includes(needle) ||
        post.authorHandle.includes(needle)) &&
      (hobbies.length === 0 || hobbies.includes(post.hobby)) &&
      (show !== "trade" || post.upForTrade) &&
      (show !== "inspo" || !post.upForTrade),
  );
  const people = needle
    ? [...new Set(SAMPLE_POSTS.map((post) => post.authorHandle))].filter((handle) => handle.includes(needle))
    : [];

  const label = q ? `"${q}"` : hobbies.length > 0 ? hobbies.join(", ") : "Everything";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <IconButton href="/explore" label="Back to Explore">
          <CaretLeft size={20} weight="bold" aria-hidden />
        </IconButton>
        <h1 className="min-w-0 truncate text-title-m text-ink-900">{label}</h1>
      </div>
      <FeedSearch defaultValue={q} />

      {people.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-label-s uppercase text-ink-400">People</h2>
          <ul className="flex flex-col gap-2">
            {people.map((handle) => (
              <li key={handle}>
                <Link
                  href={`/users/${handle}`}
                  className="flex items-center gap-2.5 rounded-card border-[1.5px] border-line bg-surface-white px-3 py-2.5"
                >
                  <Avatar name={handle} size={36} />
                  <span className="text-body-s font-bold text-ink-900">@{handle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-label-s uppercase text-ink-400">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </h2>
        {posts.length > 0 ? (
          <FeedGrid posts={posts} />
        ) : (
          <p className="rounded-card border-[1.5px] border-dashed border-line px-4 py-8 text-center text-body-s text-ink-600">
            Nothing matches yet. Try another word, or fewer filters.
          </p>
        )}
      </section>
    </div>
  );
}
