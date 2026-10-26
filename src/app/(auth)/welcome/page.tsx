import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/auth/BrandLogo";
import { buttonClassName } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Trade the gear you've outgrown for the hobby you're curious about.",
};

export default function WelcomePage() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-brand-lavender lg:bg-brand-cream">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pt-2 pb-[max(40px,env(safe-area-inset-bottom))] lg:max-w-[360px] lg:flex-none lg:py-0 lg:my-auto">
        <div className="flex-1 lg:hidden" />
        {/* Desktop shows the logo in the brand panel. */}
        <BrandLogo className="lg:hidden" />
        <h1 className="mt-7 w-[300px] text-center text-title-m text-brand-plum-dark lg:mt-0 lg:mb-8 lg:w-auto lg:font-display lg:text-display-l lg:font-normal lg:text-brand-plum">
          Trade the gear you&apos;ve outgrown for the hobby you&apos;re curious about.
        </h1>
        <div className="flex-1 lg:hidden" />
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
