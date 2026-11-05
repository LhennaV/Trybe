import FeedGridSkeleton from "@/components/feed/FeedGridSkeleton";
import Skeleton from "@/components/ui/Skeleton";

// Search results while they load: back button and query, search box, then results.
export default function SearchSkeleton() {
  return (
    <div role="status" aria-label="Loading results" className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-5 w-40 rounded-chip" />
      </div>
      <Skeleton className="h-[46px] w-full rounded-input" />
      <FeedGridSkeleton />
    </div>
  );
}
