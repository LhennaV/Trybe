import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CheckInForm from "@/components/trades/CheckInForm";
import { getSampleTrade, SAMPLE_TRADES } from "@/components/trades/sampleTrades";

export function generateStaticParams() {
  return SAMPLE_TRADES.map((trade) => ({ id: trade.id }));
}

export const metadata: Metadata = { title: "Meetup check-in", robots: { index: false } };

export default function CheckInPage(props: PageProps<"/trades/[id]/check-in">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md" aria-busy="true" />}>
      <CheckIn params={props.params} />
    </Suspense>
  );
}

async function CheckIn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = getSampleTrade(id);
  if (!trade || trade.status !== "accepted") notFound();
  // Sample meetup until the meetup endpoints exist.
  return (
    <CheckInForm
      tradeId={trade.id}
      otherHandle={trade.other.handle}
      meetup={{ when: "Sat, Oct 24 · 2:00 PM", where: "Trinoma main entrance" }}
    />
  );
}
