import Skeleton from "@/components/ui/Skeleton";
import FeedGridSkeleton from "./FeedGridSkeleton";

// Feed while it loads: header, search, hobby chips, then the grid.
export default function FeedSkeleton() {
  return (
    <div role="status" aria-label="Loading feed" className="flex flex-col gap-3.5 lg:gap-5">
      <div className="flex items-center gap-2 lg:hidden">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-6 w-24 rounded-chip" />
      </div>
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="hidden h-8 w-64 rounded-chip lg:block" />
        <Skeleton className="h-[46px] w-full rounded-input lg:w-[496px]" />
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
