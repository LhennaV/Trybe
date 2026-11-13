import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND, brandSize } from "@/shared/brand";

// Inside the frosted card: the Trybe logo on top, which is also the way back
// home (no separate back button, as on the HomeSure sign-in page), then the
// screen's own content.
export default function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-col gap-4 px-5 pt-6 pb-7 sm:px-8 sm:pt-8 sm:pb-8">
      <AuthBrand />
      {children}
    </main>
  );
}

// Logo and wordmark, centred. A small press animation shows it's clickable.
export function AuthBrand() {
  return (
    <Link
      href="/"
      aria-label="Trybe home"
      className="group mx-auto flex min-h-11 items-center gap-2 rounded-chip px-2 transition-transform duration-150 active:scale-95"
    >
      <Image
        {...BRAND.icon}
        {...brandSize(BRAND.icon, 40)}
        alt=""
        priority
        className="h-9 w-auto transition-transform duration-150 group-hover:scale-105 group-active:-rotate-6"
      />
      <span className="font-display text-display-m text-brand-plum">TRYBE</span>
    </Link>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 pb-1 text-center">
      <h1 className="font-display text-display-l text-ink-900">{title}</h1>
      <p className="text-body-m text-ink-600">{subtitle}</p>
    </div>
  );
}
