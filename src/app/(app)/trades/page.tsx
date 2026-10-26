import type { Metadata } from "next";
import { SAMPLE_REQUESTS, SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import TradesInbox from "@/components/trades/TradesInbox";

export const metadata: Metadata = {
  title: "Trades",
};

export default function TradesPage() {
  return (
    <div className="flex flex-col gap-3.5">
      <h1 className="font-display text-display-l text-brand-plum">Trades</h1>
      <TradesInbox trades={SAMPLE_TRADES} requests={SAMPLE_REQUESTS} />
    </div>
  );
}
