import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSampleTrade, SAMPLE_REQUESTS, SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import TradeChat from "@/components/trades/TradeChat";
import TradeDetailsPanel from "@/components/trades/TradeDetailsPanel";
import TradesInbox from "@/components/trades/TradesInbox";

export function generateStaticParams() {
  return SAMPLE_TRADES.map((trade) => ({ id: trade.id }));
}

export async function generateMetadata(props: PageProps<"/trades/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const trade = getSampleTrade(id);
  return { title: trade ? `Trade with @${trade.other.handle}` : "Trade not found", robots: { index: false } };
}

// Not async, so the shell shows instantly and the trade streams in.
export default function TradePage(props: PageProps<"/trades/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-dvh w-full max-w-md" aria-busy="true" aria-label="Loading trade" />}>
      <Trade params={props.params} />
    </Suspense>
  );
}

// Mobile: just the chat. Desktop: list (340px), chat, and trade details (320px).
async function Trade({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = getSampleTrade(id);
  if (!trade) notFound();

  return (
    <div className="lg:grid lg:h-dvh lg:grid-cols-[340px_minmax(0,1fr)_320px]">
      <section className="hidden flex-col gap-3.5 overflow-y-auto border-r border-line bg-surface-white p-4 lg:flex" aria-label="Your trades">
        <h1 className="font-display text-display-l text-brand-plum">Trades</h1>
        <TradesInbox trades={SAMPLE_TRADES} requests={SAMPLE_REQUESTS} activeTradeId={trade.id} />
      </section>
      <TradeChat trade={trade} />
      <div className="hidden border-l border-line bg-surface-white lg:block">
        <TradeDetailsPanel trade={trade} />
      </div>
    </div>
  );
}
