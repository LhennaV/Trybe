import Skeleton from "@/components/ui/Skeleton";

// Masonry columns like FeedGrid: 2 on phones, 3 on tablets, 5 from lg up, tall and short photos alternating.
const COLUMN_VISIBILITY = ["", "", "hidden md:flex", "hidden lg:flex", "hidden lg:flex"];

export default function FeedGridSkeleton() {
  return (
    <div className="flex items-start gap-2.5 md:gap-3.5 lg:gap-4">
      {[0, 1, 2, 3, 4].map((column) => (
        <div key={column} className={`flex flex-1 flex-col gap-3.5 ${COLUMN_VISIBILITY[column]}`}>
          {[0, 1].map((row) => (
            <div key={row} className="flex flex-col gap-2">
              <Skeleton
                tone="photo"
                className={`w-full rounded-photo ${(column + row) % 2 === 0 ? "aspect-[174/236]" : "aspect-[174/168]"}`}
              />
              <Skeleton className="h-3.5 w-4/5 rounded-chip" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-5 rounded-chip" />
                <Skeleton className="h-3 w-1/2 rounded-chip" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
