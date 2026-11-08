import type { CSSProperties } from "react";
import {
  Axe,
  Bread,
  BookBookmark,
  FilmStrip,
  FlowerTulip,
  Jar,
  Needle,
  PaintBrush,
  PenNib,
  Scissors,
  Sneaker,
  Yarn,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import RevealText from "@/components/ui/RevealText";
import LandingSection from "./LandingSection";
import SectionLabel from "./SectionLabel";

// The last two only fit on desktop, like in Figma.
const HOBBIES: { name: string; icon: Icon }[] = [
  { name: "Pottery", icon: Jar },
  { name: "Film photography", icon: FilmStrip },
  { name: "Crochet", icon: Yarn },
  { name: "Calligraphy", icon: PenNib },
  { name: "Bookbinding", icon: BookBookmark },
  { name: "Sewing", icon: Scissors },
  { name: "Bread baking", icon: Bread },
  { name: "Woodcarving", icon: Axe },
  { name: "Embroidery", icon: FlowerTulip },
  { name: "Knitting", icon: Needle },
  { name: "Watercolor", icon: PaintBrush },
  { name: "Running", icon: Sneaker },
];
const MOBILE_COUNT = 10;

export default function HobbiesSection() {
  return (
    <LandingSection className="bg-brand-lavender-soft" innerClassName="flex flex-col gap-4 lg:items-center lg:gap-7">
      <div className="flex flex-col gap-4 lg:items-center lg:gap-3 lg:text-center">
        <SectionLabel>Hobbies on Trybe</SectionLabel>
        <RevealText
          text="Whatever you're curious about next."
          className="font-display text-display-section-m text-ink-900 lg:max-w-[760px] lg:text-display-section"
        />
        <p className="hidden text-lead text-ink-600 lg:block">Start with the ones people try and drop the most.</p>
      </div>

      {/* Shown like chips, but not buttons: there's nothing to filter here.
          They pop in one after another. */}
      <ul className="flex flex-wrap gap-2 lg:max-w-[920px] lg:justify-center lg:gap-2.5">
        {HOBBIES.map(({ name, icon: Icon }, index) => (
          <li
            key={name}
            style={{ "--i": index * 0.4 } as CSSProperties}
            className={[
              "reveal-item card-lift flex items-center gap-1.5 rounded-chip border-[1.5px] py-2 pr-3.5 pl-2.5 text-body-s font-bold",
              index === 0
                ? "border-brand-plum bg-brand-plum text-surface-white"
                : "border-line bg-surface-white text-ink-600",
              index >= MOBILE_COUNT && "hidden lg:flex",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon size={18} weight={index === 0 ? "fill" : "bold"} aria-hidden className={index === 0 ? "" : "text-brand-plum"} />
            {name}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
