import type { Metadata } from "next";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata: Metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return (
    <ComingSoon title="Explore">
      Browsing by hobby is on its way. For now, your curiosity will have to sit tight.
    </ComingSoon>
  );
}
