import Link from "next/link";
import AuthTagline from "@/components/auth/AuthTagline";

const FOOTER_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/guidelines", label: "Guidelines" },
];

// Welcome, sign up, log in, password reset, and onboarding. After the HomeSure
// sign-in page: a drifting brand gradient fills the screen, the tagline sits on
// the left on desktop, and each screen is a frosted card in the middle. The
// footer wraps under the card so it never lands on top of a tall form.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 px-3 py-5 sm:px-6 lg:flex-row lg:flex-wrap lg:content-center lg:gap-x-20 lg:gap-y-6 lg:px-16 lg:py-10">
      <div aria-hidden className="auth-backdrop" />
      <AuthTagline />
      <div className="w-full max-w-[460px] animate-pop-in rounded-[24px] border border-ink-900/[0.08] bg-surface-white/80 shadow-modal backdrop-blur-[20px] backdrop-saturate-[1.6] motion-reduce:bg-surface-white/95">
        {children}
      </div>
      <footer className="flex flex-col items-center gap-2 text-caption text-ink-600 sm:flex-row sm:gap-5 lg:basis-full lg:justify-center">
        <span>© 2026 Trybe</span>
        <nav aria-label="Legal" className="flex gap-5">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-11 items-center font-bold text-ink-600">
              {link.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
