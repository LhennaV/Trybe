import type { Metadata } from "next";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <ComingSoon title="Profile">
      Your gear, your makes, and your trade history will live here. Still setting up the shelves.
    </ComingSoon>
  );
}
