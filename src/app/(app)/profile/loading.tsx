import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

// Same edge-to-edge cover as the profile page on mobile.
export default function Loading() {
  return <ProfileSkeleton className="-mx-4 -mt-1.5 lg:mx-0 lg:mt-0" />;
}
