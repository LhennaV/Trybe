import type { Metadata } from "next";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata: Metadata = {
  title: "New post",
};

export default function NewPostPage() {
  return (
    <ComingSoon title="New post">
      Show off what you made and the tools behind it. Posting is coming soon.
    </ComingSoon>
  );
}
