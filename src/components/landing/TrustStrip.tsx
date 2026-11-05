import { ArrowsLeftRight, MapPin, Money, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Reveal from "@/components/ui/Reveal";

const POINTS = [
  { icon: ArrowsLeftRight, text: "Item for item, or add cash" },
  { icon: MapPin, text: "Only your city is shown" },
  { icon: Money, text: "Cash is paid at the meetup" },
  { icon: ShieldCheck, text: "Safety checklist before you meet" },
];

// The plum band under the hero. The nav's Safety link lands here.
export default function TrustStrip() {
  return (
    <section id="safety" aria-label="How Trybe keeps trades safe" className="bg-brand-plum text-surface-white">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 py-7 lg:px-10">
        <ul className="flex flex-col gap-3.5 lg:flex-row lg:flex-wrap lg:justify-between lg:gap-x-8">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-body-m font-bold">
              <Icon size={20} weight="bold" className="shrink-0" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
