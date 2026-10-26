import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  BookmarkSimple,
  Camera,
  CaretLeft,
  DotsThree,
  Heart,
  MapPin,
  Tag,
} from "@phosphor-icons/react/dist/ssr";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";
import { getSamplePost } from "@/components/posts/samplePostDetails";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import ToolRow from "@/components/ui/ToolRow";

// Prerender the sample posts. Needed because cacheComponents is on: params
// that aren't known at build time count as runtime data.
export function generateStaticParams() {
  return SAMPLE_POSTS.map((post) => ({ id: post.id }));
}

export async function generateMetadata(props: PageProps<"/posts/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const post = getSamplePost(id);
  return { title: post?.title ?? "Post not found" };
}

// Not async: the shell (skeleton) renders right away so navigating from the
// feed feels instant, and the post streams in inside the Suspense boundary.
export default function PostDetailPage(props: PageProps<"/posts/[id]">) {
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <PostDetail params={props.params} />
    </Suspense>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col" aria-busy="true" aria-label="Loading post">
      <div className="h-[290px] w-full bg-brand-box-soft" />
      <div className="flex flex-col gap-3.5 p-4">
        <div className="flex items-center gap-2.5">
          <span className="size-10 rounded-chip bg-line" />
          <span className="h-4 w-32 rounded-chip bg-line" />
        </div>
        <span className="h-6 w-4/5 rounded-chip bg-line" />
        <span className="h-4 w-full rounded-chip bg-line" />
        <span className="h-4 w-2/3 rounded-chip bg-line" />
      </div>
    </div>
  );
}

async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getSamplePost(id);
  if (!post) notFound();

  const tradeableCount = post.tools.filter((tool) => tool.upForTrade).length;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      {/* Photo carousel. Placeholder until real photos exist. */}
      <div className="relative h-[290px] w-full bg-brand-box-soft">
        <div className="flex size-full items-center justify-center text-brand-box-dark/40">
          <Camera size={40} weight="bold" aria-hidden />
        </div>

        <div className="absolute inset-x-4 top-[max(8px,env(safe-area-inset-top))] flex gap-2">
          <IconButton href="/" label="Back to feed">
            <CaretLeft size={20} weight="bold" aria-hidden />
          </IconButton>
          <IconButton label="Save post" className="ml-auto">
            <BookmarkSimple size={20} weight="bold" aria-hidden />
          </IconButton>
          <IconButton label="More options">
            <DotsThree size={20} weight="bold" aria-hidden />
          </IconButton>
        </div>

        {post.photoCount > 1 && (
          <div
            className="absolute bottom-3.5 left-1/2 flex h-[18px] -translate-x-1/2 items-center gap-1.5 rounded-chip bg-surface-white px-2.5"
            aria-label={`Photo 1 of ${post.photoCount}`}
          >
            {Array.from({ length: post.photoCount }, (_, index) => (
              <span
                key={index}
                className={
                  index === 0 ? "h-1.5 w-4 rounded-chip bg-brand-plum" : "size-1.5 rounded-chip bg-ink-400"
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3.5 p-4 pb-[calc(76px+max(30px,env(safe-area-inset-bottom)))]">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.author.handle} size={40} />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <p className="text-body-m font-bold text-ink-900">@{post.author.handle}</p>
            <p className="flex items-center gap-1 text-caption text-ink-600">
              <MapPin size={12} weight="bold" aria-hidden />
              {post.author.city}
              {post.author.tradeCount > 0 &&
                ` · ★ ${post.author.rating} (${post.author.tradeCount} trades)`}
            </p>
          </div>
        </div>

        <h1 className="font-display text-display-m text-ink-900">{post.title}</h1>
        {post.caption && <p className="text-body-m text-ink-600">{post.caption}</p>}

        {post.hobbies.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Hobbies">
            {post.hobbies.map((hobby, index) => (
              <li
                key={hobby}
                className={[
                  "rounded-chip border-[1.5px] px-3.5 py-2 text-body-s font-bold",
                  index === 0
                    ? "border-brand-plum bg-brand-plum text-surface-white"
                    : "border-line bg-surface-white text-ink-600",
                ].join(" ")}
              >
                {hobby}
              </li>
            ))}
          </ul>
        )}

        {post.tools.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-1">
              <Tag size={18} weight="bold" className="text-brand-plum" aria-hidden />
              <h2 className="text-title-m text-ink-900">Tools used</h2>
              <p className="ml-auto text-caption text-ink-400">
                {tradeableCount} of {post.tools.length} up for trade
              </p>
            </div>
            {post.tools.map((tool) => (
              <ToolRow key={tool.id} tool={tool} />
            ))}
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 pt-3 pb-[max(30px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            aria-label={`Like this post, ${post.likeCount} likes`}
            className="flex min-h-11 items-center gap-1.5 text-body-s font-bold text-ink-600"
          >
            <Heart size={22} weight="bold" className="text-status-danger" aria-hidden />
            {post.likeCount}
          </button>
          {/* Inspiration-only posts have nothing to trade, so there's no trade button. */}
          {tradeableCount > 0 && (
            <Button className="flex-1">Propose a trade</Button>
          )}
        </div>
      </div>
    </div>
  );
}
