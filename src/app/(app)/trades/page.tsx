import type { Metadata } from "next";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata: Metadata = {
  title: "Trades",
};

export default function TradesPage() {
  return (
    <ComingSoon title="Trades">
      No trades yet. When you make an offer, the chat and all the back-and-forth will land here.
    </ComingSoon>
  );
}
