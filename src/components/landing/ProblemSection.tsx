import Image from "next/image";
import type { CSSProperties } from "react";
import RevealText from "@/components/ui/RevealText";
import Tilt from "@/components/ui/Tilt";
import LandingSection from "./LandingSection";
import SectionLabel from "./SectionLabel";

type Tile = { illustration: string; backdrop: "tile-wood" | "tile-cloth" | "tile-mat" };

// Figma "Landing · A · Curiosity" > Problem.
const CARDS: { title: string; body: string; tiles: Tile[] }[] = [
  {
    title: "The drawer full of “someday”",
    body: "That film camera. The crochet kit you used twice. The pottery tools from a three-week phase. They still work, they're just not for you anymore.",
    tiles: [
      { illustration: "/illustrations/camera-angled.svg", backdrop: "tile-wood" },
      { illustration: "/illustrations/crochet-front.svg", backdrop: "tile-cloth" },
      { illustration: "/illustrations/pottery-top.svg", backdrop: "tile-mat" },
    ],
  },
  {
    title: "The hobby you keep putting off",
    body: "Starter gear adds up fast, and it's hard to spend on something that might not stick. So the calligraphy set stays in your cart for months.",
    tiles: [
      { illustration: "/illustrations/calligraphy-front.svg", backdrop: "tile-mat" },
      { illustration: "/illustrations/book-front.svg", backdrop: "tile-cloth" },
      { illustration: "/illustrations/carving-front.svg", backdrop: "tile-wood" },
    ],
  },
];

export default function ProblemSection() {
  return (
    <LandingSection className="bg-surface-white" innerClassName="flex flex-col gap-8 lg:gap-10">
      <div className="flex flex-col gap-3.5 lg:max-w-[760px] lg:gap-3">
        <SectionLabel>Sound familiar?</SectionLabel>
        <RevealText
          text="Every hobby leaves something behind."
          className="font-display text-display-section-m text-ink-900 lg:text-display-section"
        />
      </div>

      <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {CARDS.map((card, index) => (
          <li key={card.title} className="reveal-item" style={{ "--i": index } as CSSProperties}>
            <Tilt max={4} className="card-lift flex h-full flex-col gap-4 rounded-3xl bg-brand-cream p-4 lg:p-7">
              <div className="grid grid-cols-3 gap-2 lg:gap-2.5">
                {card.tiles.map((tile) => (
                  <div
                    key={tile.illustration}
                    className={`flex aspect-[168/150] items-center justify-center rounded-[14px] lg:rounded-photo ${tile.backdrop}`}
                  >
                    <Image src={tile.illustration} alt="" width={120} height={120} unoptimized className="h-auto w-3/4" />
                  </div>
                ))}
              </div>
              <h3 className="font-display text-display-m text-ink-900">{card.title}</h3>
              <p className="text-body-s text-ink-600 lg:text-body-m">{card.body}</p>
            </Tilt>
          </li>
        ))}
      </ul>

      <p className="reveal-item text-title-m text-brand-plum lg:max-w-[760px] lg:font-display lg:text-display-m lg:font-normal">
        Trybe puts the two together: your old gear becomes someone&apos;s first try, and theirs becomes yours.
      </p>
    </LandingSection>
  );
}
