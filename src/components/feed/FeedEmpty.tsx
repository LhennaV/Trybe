import Image from "next/image";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";

// Shown when the picked hobby has no posts yet. Followers are an open
// decision, so this only points to hobbies and Explore.
export default function FeedEmpty({ hobby }: { hobby: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-[24px] border-[1.5px] border-line bg-surface-white px-5 py-6 text-center">
      <Image src="/brand/storm-icon.png" alt="" width={106} height={103} />
      <h2 className="font-display text-display-m text-ink-900">Your feed is a little quiet</h2>
      <p className="max-w-[310px] text-body-s text-ink-600">
        Nobody near you has posted {hobby.toLowerCase()} gear yet. Add a few more hobbies and this fills up fast.
      </p>
      <Link href="/onboarding/hobbies" className={buttonClassName({ fullWidth: true })}>
        Pick more hobbies
      </Link>
      <Link href="/explore" className={buttonClassName({ variant: "ghost", fullWidth: true })}>
        Browse Explore
      </Link>
    </div>
  );
}
