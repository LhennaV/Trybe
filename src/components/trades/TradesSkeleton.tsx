import Skeleton from "@/components/ui/Skeleton";
import TradesInboxSkeleton from "./TradesInboxSkeleton";

// Trades tab while it loads. Desktop keeps the empty chat area on the right.
export default function TradesSkeleton() {
  return (
    <div role="status" aria-label="Loading trades" className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-8 w-28 rounded-chip" />
        <TradesInboxSkeleton />
      </div>
      <div className="hidden min-h-[520px] rounded-card border-[1.5px] border-dashed border-line lg:block" />
    </div>
  );
}
