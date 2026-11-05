import Skeleton from "@/components/ui/Skeleton";
import TradesInboxSkeleton from "./TradesInboxSkeleton";

// One trade while it loads. Mobile: chat only. Desktop: list, chat, and details panel.
export default function TradeChatSkeleton() {
  return (
    <div role="status" aria-label="Loading trade" className="flex h-dvh flex-col lg:grid lg:grid-cols-[340px_minmax(0,1fr)_320px]">
      <div className="hidden flex-col gap-3.5 border-r border-line bg-surface-white p-4 lg:flex">
        <Skeleton className="h-8 w-28 rounded-chip" />
        <TradesInboxSkeleton />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:max-w-none">
        <div className="flex items-center gap-3 border-b border-line bg-surface-white px-4 py-3">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="size-10 rounded-chip" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded-chip" />
            <Skeleton className="h-3 w-20 rounded-chip" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Skeleton className="h-[120px] w-4/5 rounded-card" />
          <Skeleton className="h-10 w-1/2 self-end rounded-card" />
          <Skeleton className="h-10 w-2/3 rounded-card" />
        </div>
        <div className="border-t border-line bg-surface-white p-3">
          <Skeleton className="h-11 w-full rounded-input" />
        </div>
      </div>

      <div className="hidden flex-col gap-3 border-l border-line bg-surface-white p-5 lg:flex">
        <Skeleton className="h-5 w-32 rounded-chip" />
        <Skeleton className="h-24 w-full rounded-card" />
        <Skeleton className="h-24 w-full rounded-card" />
      </div>
    </div>
  );
}
