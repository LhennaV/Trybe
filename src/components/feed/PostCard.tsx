import Image from "next/image";
import { ArrowsLeftRight, Camera, Heart } from "@phosphor-icons/react/dist/ssr";
import type { FeedPost } from "./samplePosts";

// Photo boxes keep the Figma proportions (174px wide, 236px or 168px tall)
// so the layout doesn't jump while images load.
const photoAspect = {
  tall: "aspect-[174/236]",
  short: "aspect-[174/168]",
};

export default function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="flex flex-col gap-2">
      <div
        className={`relative w-full overflow-hidden rounded-photo bg-brand-box-soft ${photoAspect[post.photoShape]}`}
      >
        {post.photoUrl ? (
          <Image
            src={post.photoUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 20vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-brand-box-dark/40">
            <Camera size={32} weight="bold" aria-hidden />
          </div>
        )}

        {/* Inspiration-only posts get no pill, so the two types read differently. */}
        {post.upForTrade && (
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-chip bg-surface-white py-[5px] pr-2.5 pl-2 text-caption font-extrabold text-brand-plum">
            <ArrowsLeftRight size={12} weight="bold" aria-hidden />
            Up for trade
          </span>
        )}
      </div>

      <h3 className="text-body-s font-bold text-ink-900">{post.title}</h3>

      <div className="flex items-center gap-1.5">
        <span className="size-5 shrink-0 rounded-chip bg-brand-blush" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-caption text-ink-600">
          @{post.authorHandle}
        </span>
        {/* Likes aren't wired up yet. The ::before grows the 16px icon to a 44px tap target. */}
        <button
          type="button"
          aria-label={`Like ${post.title}`}
          className="relative text-ink-400 before:absolute before:-inset-3.5"
        >
          <Heart size={16} weight="bold" aria-hidden />
        </button>
      </div>
    </article>
  );
}
