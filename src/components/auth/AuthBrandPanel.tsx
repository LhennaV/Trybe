import Image from "next/image";
import { ArrowsLeftRight, Money, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

const FEATURES = [
  { icon: ArrowsLeftRight, text: "Trade gear you're done with for gear you want" },
  { icon: Money, text: "Even it out with cash or an extra item" },
  { icon: ShieldCheck, text: "Meet in public spots and rate each other" },
];

// Left half of the desktop auth screens: the logo and what Trybe is about.
// Hidden on mobile, where the form takes the whole screen.
export default function AuthBrandPanel() {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col items-center justify-center gap-16 bg-brand-lavender px-12 lg:flex">
      <Image
        src="/brand/storm-logo.png"
        alt="Trybe. Curiosity killed the cat. Trybe brought it back."
        width={390}
        height={378}
        priority
      />
      <ul className="flex w-full max-w-[380px] flex-col gap-3.5">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-body-s font-bold text-brand-plum-dark">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-white text-brand-plum">
              <Icon size={18} weight="bold" aria-hidden />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
