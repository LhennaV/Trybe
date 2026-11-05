import Image from "next/image";
import Link from "next/link";

// Instagram and Contact are in Figma but have no address yet. Add the href
// and they show up.
const LINKS: { label: string; href: string | null }[] = [
  { label: "Instagram", href: null },
  { label: "Contact", href: null },
  { label: "Privacy", href: "/privacy" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t-[1.5px] border-line">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-3.5 px-4 pt-6 pb-8 lg:flex-row lg:justify-between lg:px-10 lg:pt-8 lg:pb-10">
        <div className="flex flex-col items-center gap-3.5 lg:flex-row lg:gap-2.5">
          <span className="flex items-center gap-2 lg:gap-2.5">
            <Image src="/brand/storm-icon.png" alt="" width={33} height={32} className="h-7 w-auto lg:h-8" />
            <span className="text-title-m text-brand-plum lg:font-display lg:text-display-m lg:font-normal">TRYBE</span>
          </span>
          {/* On phones the copyright line moves below the links. */}
          <span className="hidden text-body-s text-ink-600 lg:inline">© 2026 Trybe. Made with a lot of curiosity.</span>
        </div>

        <ul className="flex gap-6 lg:gap-7">
          {LINKS.filter((link) => link.href).map((link) => (
            <li key={link.label}>
              <Link href={link.href!} className="flex min-h-11 items-center text-body-s font-bold text-ink-600">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-caption text-ink-600 lg:hidden">© 2026 Trybe. Made with a lot of curiosity.</p>
      </div>
    </footer>
  );
}
