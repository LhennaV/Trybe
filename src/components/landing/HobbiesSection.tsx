import RevealText from "@/components/ui/RevealText";
import LandingSection from "./LandingSection";
import SectionLabel from "./SectionLabel";

// The last two only fit on desktop, like in Figma.
const HOBBIES = [
  "Pottery",
  "Film photography",
  "Crochet",
  "Calligraphy",
  "Bookbinding",
  "Sewing",
  "Bread baking",
  "Woodcarving",
  "Embroidery",
  "Knitting",
  "Watercolor",
  "Running",
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

      {/* Shown like chips, but not buttons: there's nothing to filter here. */}
      <ul className="flex flex-wrap gap-2 lg:max-w-[900px] lg:justify-center lg:gap-2.5">
        {HOBBIES.map((hobby, index) => (
          <li
            key={hobby}
            className={[
              "rounded-chip border-[1.5px] px-3.5 py-2 text-body-s font-bold",
              index === 0
                ? "border-brand-plum bg-brand-plum text-surface-white"
                : "border-line bg-surface-white text-ink-600",
              index >= MOBILE_COUNT && "hidden lg:block",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {hobby}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
