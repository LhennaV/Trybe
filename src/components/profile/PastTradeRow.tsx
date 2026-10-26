import { Camera, Package } from "@phosphor-icons/react/dist/ssr";
import StatusPill from "@/components/ui/StatusPill";
import StarRating from "./StarRating";
import type { PastTrade } from "./sampleProfiles";

export default function PastTradeRow({ trade }: { trade: PastTrade }) {
  const Icon = trade.thumb === "camera" ? Camera : Package;

  return (
    <div className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface-white px-3 py-2.5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-lavender-soft text-brand-plum">
        <Icon size={20} weight="bold" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-body-s font-bold text-ink-900">Got {trade.got}</p>
        <p className="text-caption text-ink-600">
          Gave {trade.gave} · with @{trade.withHandle}
        </p>
        <p className="flex items-center gap-2 text-caption text-ink-400">
          <StarRating value={trade.rating} />
          {trade.month}
        </p>
      </div>
      <StatusPill status="completed" label="Done" />
    </div>
  );
}
