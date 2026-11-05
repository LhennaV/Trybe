import Skeleton from "@/components/ui/Skeleton";

// A post while it loads: photo, author, title, caption, then the tools list.
export default function PostDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading post"
      className="mx-auto flex w-full max-w-md flex-1 flex-col lg:grid lg:max-w-[1144px] lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8 lg:px-10 lg:pt-7 lg:pb-10"
    >
      <div className="flex flex-col lg:gap-3">
        <Skeleton className="hidden h-10 w-36 rounded-xl lg:block" />
        <Skeleton tone="photo" className="h-[290px] w-full lg:aspect-[4/3] lg:h-auto lg:rounded-[24px]" />
      </div>
      <div className="flex flex-col gap-3.5 p-4 lg:p-0">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-10 rounded-chip" />
          <Skeleton className="h-4 w-32 rounded-chip" />
        </div>
        <Skeleton className="h-6 w-4/5 rounded-chip" />
        <Skeleton className="h-4 w-full rounded-chip" />
        <Skeleton className="h-4 w-2/3 rounded-chip" />
        {[0, 1].map((tool) => (
          <Skeleton key={tool} className="h-[78px] w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}
