import type { Metadata } from "next";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr";
import { SAMPLE_REQUESTS, SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import TradesInbox from "@/components/trades/TradesInbox";

export const metadata: Metadata = {
  title: "Trades",
};

export default function TradesPage() {
  return (
    <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
      <div className="flex flex-col gap-3.5">
        <h1 className="font-display text-display-l text-brand-plum">Trades</h1>
        <TradesInbox trades={SAMPLE_TRADES} requests={SAMPLE_REQUESTS} />
      </div>
      {/* Desktop: empty chat area until a trade is picked. */}
      <div className="hidden min-h-[520px] flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed border-line text-center lg:flex">
        <ChatCircle size={36} weight="bold" className="text-brand-lavender" aria-hidden />
        <p className="text-body-m font-bold text-ink-900">Pick a trade to open the chat</p>
        <p className="text-body-s text-ink-600">Offers, counters, and messages all live there.</p>
      </div>
    </div>
  );
}
