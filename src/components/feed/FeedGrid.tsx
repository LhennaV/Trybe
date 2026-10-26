import PostCard from "./PostCard";
import type { FeedPost } from "./samplePosts";

// Masonry with CSS columns: 2 on mobile (10px gap), 5 from lg up (16px gap).
// Tall and short photos stagger like the Figma feed.
export default function FeedGrid({ posts }: { posts: FeedPost[] }) {
  return (
    <div className="columns-2 gap-2.5 lg:columns-5 lg:gap-4">
      {posts.map((post) => (
        <div key={post.id} className="mb-3.5 break-inside-avoid">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}
