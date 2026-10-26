import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSampleTrade, SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import TradeChat from "@/components/trades/TradeChat";

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

async function Trade({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = getSampleTrade(id);
  if (!trade) notFound();
  return <TradeChat trade={trade} />;
}
