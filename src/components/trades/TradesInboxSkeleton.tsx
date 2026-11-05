import Skeleton from "@/components/ui/Skeleton";

// The tab switch and trade rows from TradesInbox.
export default function TradesInboxSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface-white px-3 py-2.5">
            <Skeleton tone="photo" className="size-12 rounded-xl" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-1/3 rounded-chip" />
              <Skeleton className="h-3 w-3/4 rounded-chip" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
