import Skeleton from "./Skeleton";

type ScreenSkeletonProps = {
  label: string;
  // How many rows to show. Notifications look better with a few more.
  rows?: number;
};

// Full-screen views (settings, notifications, forms, guides) while they load:
// the back button and title, then a stack of rows.
export default function ScreenSkeleton({ label, rows = 5 }: ScreenSkeletonProps) {
  return (
    <div role="status" aria-label={label} className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2">
      <div className="flex items-center gap-3 py-2">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-5 w-32 rounded-chip" />
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface-white p-3">
          <Skeleton className="size-[38px] rounded-xl" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-3/4 rounded-chip" />
            <Skeleton className="h-3 w-1/3 rounded-chip" />
          </div>
        </div>
      ))}
    </div>
  );
}
