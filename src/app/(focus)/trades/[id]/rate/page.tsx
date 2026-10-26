import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import RateForm from "@/components/trades/RateForm";
import { getSampleTrade, SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import { currentOffer, describeOffer } from "@/components/trades/tradeModel";

export function generateStaticParams() {
  return SAMPLE_TRADES.map((trade) => ({ id: trade.id }));
}

export const metadata: Metadata = { title: "Rate your trade", robots: { index: false } };

export default function RatePage(props: PageProps<"/trades/[id]/rate">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md" aria-busy="true" />}>
      <Rate params={props.params} />
    </Suspense>
  );
}

async function Rate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = getSampleTrade(id);
  const offer = trade ? currentOffer(trade) : undefined;
  if (!trade || !offer || (trade.status !== "accepted" && trade.status !== "completed")) notFound();
  return (
    <RateForm
      tradeId={trade.id}
      other={trade.other}
      summary={describeOffer(offer)}
      completedNote="Trade completed · Sat, Oct 24 at Trinoma"
    />
  );
}
