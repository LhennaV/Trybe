import type { CSSProperties } from "react";
import { Flag, MapPin, Money, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import RevealText from "@/components/ui/RevealText";
import Tilt from "@/components/ui/Tilt";
import LandingSection from "./LandingSection";
import SectionLabel from "./SectionLabel";

// Figma "Landing · A · Curiosity" > Safety. The nav's Safety link lands here.
// Keep the copy honest: these lower the risk, they don't remove it.
const FEATURES = [
  {
    icon: MapPin,
    title: "Only your city shows",
    body: "Nobody sees your street or exact location. Just the city, like Quezon City.",
  },
  {
    icon: Money,
    title: "Cash stays in person",
    body: "If a trade needs extra cash, it's paid at the meetup. Trybe never handles your money.",
  },
  {
    icon: ShieldCheck,
    title: "A checklist before every meetup",
    body: "Meet somewhere public, check the item, and bring a friend if you like.",
  },
  {
    icon: Flag,
    title: "Report or block anytime",
    body: "From any profile or chat, in two taps. Requests from strangers wait until you accept.",
  },
];

export default function SafetySection() {
  return (
    <LandingSection id="safety" innerClassName="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex flex-col gap-3.5 lg:sticky lg:top-28 lg:w-[440px] lg:shrink-0 lg:gap-3">
        <SectionLabel>Safety first</SectionLabel>
        <RevealText
          text="Trading with strangers, minus the scary part."
          className="font-display text-display-section-m text-ink-900 lg:text-display-section"
        />
        <p className="text-body-m text-ink-600 lg:text-lead">
          Every trade happens in person, so Trybe is built around meeting up safely.
        </p>
      </div>

      <ul className="grid flex-1 gap-3.5 sm:grid-cols-2 lg:gap-4">
        {FEATURES.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="reveal-item" style={{ "--i": index } as CSSProperties}>
            <Tilt
              max={6}
              className="card-lift flex h-full flex-col gap-3 rounded-[20px] border-[1.5px] border-line bg-surface-white p-5 lg:p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-status-success-soft text-status-success">
                <Icon size={22} weight="bold" aria-hidden />
              </span>
              <h3 className="text-title-m text-ink-900">{title}</h3>
              <p className="text-body-s text-ink-600">{body}</p>
            </Tilt>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
