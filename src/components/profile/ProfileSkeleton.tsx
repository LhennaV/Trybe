import FeedGridSkeleton from "@/components/feed/FeedGridSkeleton";
import Skeleton from "@/components/ui/Skeleton";

// Your profile or someone else's while it loads: cover, avatar, name, stats, then posts.
// Pass the page's own wrapper classes so nothing jumps when it loads.
export default function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Loading profile" className={["flex flex-col gap-3 lg:gap-5", className].filter(Boolean).join(" ")}>
      <Skeleton tone="cover" className="h-[150px] w-full lg:h-[160px] lg:rounded-[24px]" />
      <div className="flex flex-col gap-3 px-4 lg:px-6">
        <Skeleton className="-mt-[42px] size-[84px] rounded-chip ring-4 ring-brand-cream" />
        <Skeleton className="h-6 w-40 rounded-chip" />
        <Skeleton className="h-4 w-56 rounded-chip" />
      </div>
      <div className="flex flex-col gap-3 px-4 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-0">
        <Skeleton className="h-[120px] w-full rounded-card" />
        <div className="flex flex-col gap-3.5">
          <Skeleton className="h-11 w-full rounded-xl" />
          <FeedGridSkeleton />
        </div>
      </div>
    </div>
  );
}
