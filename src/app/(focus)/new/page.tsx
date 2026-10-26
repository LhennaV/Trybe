import type { Metadata } from "next";
import NewPostFlow from "@/components/newPost/NewPostFlow";

export const metadata: Metadata = {
  title: "New post",
};

// Full-screen flow, outside the app shell, so there's no bottom nav while posting.
export default function NewPostPage() {
  return <NewPostFlow />;
}
