import { ArrowsLeftRight, Money, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

const FEATURES = [
  { icon: ArrowsLeftRight, text: "Trade gear you're done with for gear you want" },
  { icon: Money, text: "Even it out with cash or an extra item" },
  { icon: ShieldCheck, text: "Meet in public spots and rate each other" },
];

// The big line to the left of the card on wide screens (Figma "Desktop ·
// Welcome": "Your next hobby is in someone's closet."). Hidden on phones,
// where the card has the whole screen.
export default function AuthTagline() {
  return (
    <div className="hidden max-w-[400px] flex-col gap-6 lg:flex">
      <h2 className="font-display text-display-section text-ink-900">
        Your next hobby is in <span className="text-brand-plum">someone&apos;s closet.</span>
      </h2>
      <p className="text-lead text-ink-600">Curiosity killed the cat. Trybe brought it back.</p>
      <ul className="flex flex-col gap-3.5">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-body-m font-bold text-ink-900">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-white/80 text-brand-plum">
              <Icon size={20} weight="bold" aria-hidden />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
