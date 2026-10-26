import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Trade the gear you've outgrown for the hobby you're curious about.",
};

export default function WelcomePage() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-brand-lavender">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pt-2 pb-[max(40px,env(safe-area-inset-bottom))]">
        <div className="flex-1" />
        {/* The logo bleeds past the side padding, like in Figma. */}
        <Image
          src="/brand/storm-logo.png"
          alt="Trybe. Curiosity killed the cat. Trybe brought it back."
          width={390}
          height={378}
          priority
          className="-mx-4 h-auto w-[calc(100%+32px)] max-w-none"
        />
        <p className="mt-7 w-[300px] text-center text-title-m text-brand-plum-dark">
          Trade the gear you&apos;ve outgrown for the hobby you&apos;re curious about.
        </p>
        <div className="flex-1" />
        <div className="flex w-full flex-col items-center gap-3">
          <Link href="/signup" className={buttonClassName({ fullWidth: true })}>
            Create an account
          </Link>
          <Link href="/login" className={buttonClassName({ variant: "ghost", fullWidth: true })}>
            I already have an account
          </Link>
          <p className="w-[300px] text-center text-caption text-brand-plum-dark opacity-75">
            By continuing you agree to Trybe&apos;s Terms and Community Guidelines.
          </p>
        </div>
      </main>
    </div>
  );
}
