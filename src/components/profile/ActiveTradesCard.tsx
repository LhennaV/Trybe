import Link from "next/link";
import { ArrowsLeftRight, Camera, Package } from "@phosphor-icons/react/dist/ssr";
import StatusPill from "@/components/ui/StatusPill";
import type { ActiveTrade } from "./sampleProfiles";

// Shown on your own profile only: trades that need something from you.
export default function ActiveTradesCard({ trades }: { trades: ActiveTrade[] }) {
  if (trades.length === 0) return null;

  return (
    <section className="flex flex-col gap-2 rounded-card border-[1.5px] border-line bg-surface-white p-3">
      <div className="flex items-center">
        <h2 className="text-body-m font-bold text-ink-900">Active trades</h2>
        <Link href="/trades" className="ml-auto text-body-s font-bold text-brand-plum">
          See all
        </Link>
      </div>
      {trades.map((trade) => (
        <Link key={trade.id} href="/trades" className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-lavender-soft text-brand-plum">
            <Camera size={14} weight="bold" aria-hidden />
          </span>
          <ArrowsLeftRight size={12} weight="bold" className="shrink-0 text-ink-400" aria-hidden />
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-box-soft text-brand-box-dark">
            <Package size={14} weight="bold" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body-s font-bold text-ink-900">{trade.title}</span>
            <span className="truncate text-caption text-ink-600">
              with @{trade.withHandle}
              {trade.note && ` · ${trade.note}`}
            </span>
          </span>
          <StatusPill status={trade.status} label={trade.statusLabel} />
        </Link>
      ))}
    </section>
  );
}
