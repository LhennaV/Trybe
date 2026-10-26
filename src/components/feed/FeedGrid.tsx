import PostCard from "./PostCard";
import type { FeedPost } from "./samplePosts";

// Masonry: posts are dealt into columns left to right, so tall and short
// photos stagger like the Figma feed. Mobile is 2 columns.
export default function FeedGrid({ posts }: { posts: FeedPost[] }) {
  const columns: FeedPost[][] = [[], []];
  posts.forEach((post, index) => columns[index % columns.length].push(post));

  return (
    <div className="flex items-start gap-2.5">
      {columns.map((column, index) => (
        <div key={index} className="flex min-w-0 flex-1 flex-col gap-3.5">
          {column.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}
    </div>
  );
}
