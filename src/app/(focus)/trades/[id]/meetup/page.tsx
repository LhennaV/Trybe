import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MeetupForm from "@/components/trades/MeetupForm";
import { getSampleTrade, SAMPLE_TRADES } from "@/components/trades/sampleTrades";

export function generateStaticParams() {
  return SAMPLE_TRADES.map((trade) => ({ id: trade.id }));
}

export const metadata: Metadata = { title: "Set up the meetup", robots: { index: false } };

export default function MeetupPage(props: PageProps<"/trades/[id]/meetup">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md" aria-busy="true" />}>
      <Meetup params={props.params} />
    </Suspense>
  );
}

async function Meetup({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = getSampleTrade(id);
  // Meetups are set up only after a trade is accepted.
  if (!trade || trade.status !== "accepted") notFound();
  return <MeetupForm tradeId={trade.id} otherHandle={trade.other.handle} />;
}
