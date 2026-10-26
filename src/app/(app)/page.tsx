import type { Metadata } from "next";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata: Metadata = {
  title: { absolute: "Trybe" },
};

export default function FeedPage() {
  return (
    <ComingSoon title="Feed">
      Nothing here yet. Once people start posting their makes and the gear behind them, they&apos;ll
      show up right here.
    </ComingSoon>
  );
}
