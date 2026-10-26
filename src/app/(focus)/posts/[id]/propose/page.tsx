import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SAMPLE_POSTS } from "@/components/feed/samplePosts";
import { getSamplePost } from "@/components/posts/samplePostDetails";
import { MY_PROFILE } from "@/components/profile/sampleProfiles";
import ProposeForm from "@/components/trades/ProposeForm";

export function generateStaticParams() {
  return SAMPLE_POSTS.map((post) => ({ id: post.id }));
}

export const metadata: Metadata = {
  title: "Propose a trade",
  robots: { index: false },
};

export default function ProposePage(props: PageProps<"/posts/[id]/propose">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md" aria-busy="true" />}>
      <Propose params={props.params} />
    </Suspense>
  );
}

async function Propose({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getSamplePost(id);
  const theirItems = post?.tools.filter((tool) => tool.upForTrade) ?? [];
  // Inspiration-only posts can't be traded on (POST-04).
  if (!post || theirItems.length === 0) notFound();

  return (
    <ProposeForm
      mode="propose"
      backHref={`/posts/${post.id}`}
      theirHandle={post.author.handle}
      theirItems={theirItems}
      myItems={MY_PROFILE.forTrade}
    />
  );
}
