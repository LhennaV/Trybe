import ScreenSkeleton from "@/components/ui/ScreenSkeleton";

// Fallback for full-screen views that don't have their own skeleton.
export default function Loading() {
  return <ScreenSkeleton label="Loading" />;
}
