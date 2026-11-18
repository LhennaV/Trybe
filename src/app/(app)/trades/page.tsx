import type { Metadata } from "next";
import { SAMPLE_REQUESTS, SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import TradesInbox from "@/components/trades/TradesInbox";

export const metadata: Metadata = {
  title: "Trades",
};

// Desktop: the list on the left, and on the right either a picked request or
// an empty state until a trade is opened.
export default function TradesPage() {
  return (
    <TradesInbox
      trades={SAMPLE_TRADES}
      requests={SAMPLE_REQUESTS}
      withPanel
      heading={<h1 className="font-display text-display-l text-brand-plum">Trades</h1>}
    />
  );
}
