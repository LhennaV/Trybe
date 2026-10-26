import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSamplePost } from "@/components/posts/samplePostDetails";
import { MY_PROFILE } from "@/components/profile/sampleProfiles";
import ProposeForm from "@/components/trades/ProposeForm";
import { getSampleTrade, SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import { canRespond, currentOffer } from "@/components/trades/tradeModel";

export function generateStaticParams() {
  return SAMPLE_TRADES.map((trade) => ({ id: trade.id }));
}

export const metadata: Metadata = {
  title: "Counter offer",
  robots: { index: false },
};

export default function CounterPage(props: PageProps<"/trades/[id]/counter">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md" aria-busy="true" />}>
      <Counter params={props.params} />
    </Suspense>
  );
}

async function Counter({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = getSampleTrade(id);
  // You can only counter an offer the other person made (TRD-05).
  if (!trade || !canRespond(trade)) notFound();

  const offer = currentOffer(trade);
  // Sample stand-in: the other person's tradeable gear comes from their post.
  const theirItems = getSamplePost("speckled-mug-set")?.tools.filter((tool) => tool.upForTrade) ?? [];

  return (
    <ProposeForm
      mode="counter"
      backHref={`/trades/${trade.id}`}
      theirHandle={trade.other.handle}
      theirItems={theirItems}
      myItems={MY_PROFILE.forTrade}
      initialTheirIds={theirItems.slice(0, 1).map((item) => item.id)}
      initialMyIds={MY_PROFILE.forTrade.slice(0, 1).map((item) => item.id)}
      initialCash={offer?.cash}
    />
  );
}
