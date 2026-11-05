import Skeleton from "@/components/ui/Skeleton";

// Explore while it loads: title, search, hobby tiles, then a row of starter kits.
export default function ExploreSkeleton() {
  return (
    <div role="status" aria-label="Loading Explore" className="flex flex-col gap-[18px]">
      <Skeleton className="h-8 w-32 rounded-chip" />
      <Skeleton className="h-[46px] w-full rounded-input lg:max-w-[560px]" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40 rounded-chip" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((tile) => (
            <Skeleton key={tile} tone="photo" className="h-[92px] rounded-photo" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-48 rounded-chip" />
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map((kit) => (
            <div key={kit} className="flex w-40 shrink-0 flex-col gap-2">
              <Skeleton tone="photo" className="h-[120px] rounded-card" />
              <Skeleton className="h-3.5 w-4/5 rounded-chip" />
              <Skeleton className="h-3 w-1/2 rounded-chip" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
