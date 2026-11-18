import Skeleton from "@/components/ui/Skeleton";
import FeedGridSkeleton from "./FeedGridSkeleton";

// Feed while it loads: header (title on desktop), hobby chips, then the grid.
export default function FeedSkeleton() {
  return (
    <div role="status" aria-label="Loading feed" className="flex flex-col gap-3.5 lg:gap-5">
      <div className="flex items-center gap-2 lg:hidden">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-6 w-24 rounded-chip" />
      </div>
      <div className="hidden lg:flex lg:flex-col lg:gap-2">
        <Skeleton className="h-8 w-64 rounded-chip" />
        <Skeleton className="h-4 w-80 rounded-chip" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {[72, 96, 84, 110, 76, 92].map((width) => (
          <Skeleton key={width} className="h-[34px] rounded-chip" style={{ width }} />
        ))}
      </div>
      <FeedGridSkeleton />
    </div>
  );
}
