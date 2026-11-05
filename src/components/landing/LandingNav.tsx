import Image from "next/image";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#safety", label: "Safety" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3.5 lg:px-10 lg:py-5">
      <Link href="/" className="flex items-center gap-2 lg:gap-2.5" aria-label="Trybe home">
        <Image src="/brand/storm-icon.png" alt="" width={41} height={40} priority className="h-8 w-auto lg:h-10" />
        <span className="font-display text-display-m text-brand-plum lg:text-display-l">TRYBE</span>
      </Link>

      <nav aria-label="Landing" className="flex items-center gap-8">
        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="flex min-h-11 items-center text-body-m font-bold text-ink-600">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#join" className={buttonClassName()}>
          Join the beta
        </a>
      </nav>
    </header>
  );
}
