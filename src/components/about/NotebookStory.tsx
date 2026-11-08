import Image from "next/image";
import type { CSSProperties } from "react";
import LandingSection from "@/components/landing/LandingSection";
import SectionLabel from "@/components/landing/SectionLabel";
import Reveal from "@/components/ui/Reveal";
import RevealText from "@/components/ui/RevealText";
import Tilt from "@/components/ui/Tilt";

type Chapter = {
  title: string;
  body: string;
  // A note copied straight from the notebook.
  quote?: string;
  photo?: { src: string; alt: string; caption: string };
};

// From Lhenna's portfolio write-up of Trybe (lhenna-portfolio, projects.ts).
// Storm's story isn't here on purpose: the landing page's "Meet Storm" tells it.
const CHAPTERS: Chapter[] = [
  {
    title: "Naming it",
    body: "The first names were literal: Hobby Trader, Tools Trader, Hobby Trade. Accurate, but easy to forget. Trybe stuck because it's two words in one: try, because the app is about trying new hobbies, and tribe, for the people around them.",
    photo: {
      src: "/about/naming.jpg",
      alt: "Notebook page listing app name ideas, with Trybe circled and annotated as try plus tribe",
      caption: "Name ideas, with Trybe circled",
    },
  },
  {
    title: "Scroll or swipe?",
    quote: "Imagine squishy trade but with hobby tools.",
    body: "It was meant to feel like social media, not a store. Swiping like a dating app was on the table, but scrolling won, so you can stumble onto your next hobby by browsing what other people made.",
  },
  {
    title: "Finding the tagline",
    body: "It comes from the old saying, “curiosity killed the cat, but satisfaction brought it back.” Curiosity is what gets you to try a hobby, and it “kills” your wallet and your storage space when the hobby doesn't stick. Trybe is what brings it back.",
    photo: {
      src: "/about/tagline.jpg",
      alt: "Notebook page mapping the phrase curiosity killed the cat onto Trybe's purpose",
      caption: "Turning the saying into a metaphor",
    },
  },
  {
    title: "One rule from day one",
    quote: "Trybe should be fun in designs. Don't stick to one color, use dopamine colors.",
    body: "That note is why Trybe mixes lavender with warm cardboard and blush instead of sticking to one brand color.",
  },
];

// Photos switch sides down the page on desktop, counting only chapters that have one.
const FLIPPED = CHAPTERS.map(
  (chapter, index) => Boolean(chapter.photo) && CHAPTERS.slice(0, index).filter((c) => c.photo).length % 2 === 1,
);

// A notebook page as a photo print. It drops onto the page when scrolled to,
// settles into its tilt, and leans toward the mouse.
function Polaroid({ photo, flip }: { photo: NonNullable<Chapter["photo"]>; flip: boolean }) {
  return (
    <div className="reveal-drop mx-auto w-full max-w-[320px] shrink-0 lg:mx-0" style={{ "--i": 1 } as CSSProperties}>
      <figure className={flip ? "rotate-2" : "-rotate-2"}>
        <Tilt max={7} className="rounded-card bg-surface-white p-3 pb-2 shadow-dropdown">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={900}
            height={1200}
            sizes="320px"
            className="aspect-[3/4] h-auto w-full rounded-input object-cover"
          />
          <figcaption className="px-1 pt-2 text-caption text-ink-600">{photo.caption}</figcaption>
        </Tilt>
      </figure>
    </div>
  );
}

export default function NotebookStory() {
  return (
    // Each chapter reveals on its own, since the section is taller than the screen.
    <LandingSection id="story" reveal={false} className="bg-surface-white" innerClassName="flex flex-col gap-10 lg:gap-20">
      <div className="flex flex-col gap-3.5 lg:max-w-[760px] lg:gap-3">
        <SectionLabel>How it started</SectionLabel>
        <RevealText
          text="Trybe lived in a notebook long before it reached Figma."
          className="font-display text-display-section-m text-ink-900 lg:text-display-section"
        />
        <p className="text-body-m text-ink-600 lg:text-lead">These are the actual pages.</p>
      </div>

      <ol className="flex flex-col gap-12 lg:gap-20">
        {CHAPTERS.map((chapter, index) => {
          const flip = FLIPPED[index];

          return (
            <li key={chapter.title}>
              <Reveal
                className={[
                  "flex flex-col gap-6",
                  chapter.photo ? "lg:flex-row lg:items-center lg:gap-20" : "lg:max-w-[760px]",
                  flip ? "lg:flex-row-reverse" : "",
                ].join(" ")}
              >
                <div className="reveal-item flex flex-1 flex-col gap-3">
                  <p className="font-display text-display-m text-brand-plum">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="font-display text-display-m text-ink-900 lg:text-display-l">{chapter.title}</h3>
                  {chapter.quote && (
                    <blockquote className="border-l-4 border-brand-box pl-4 text-body-m font-bold text-ink-900 italic lg:text-lead">
                      “{chapter.quote}”
                    </blockquote>
                  )}
                  <p className="text-body-m text-ink-600 lg:text-lead">{chapter.body}</p>
                </div>
                {chapter.photo && <Polaroid photo={chapter.photo} flip={flip} />}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </LandingSection>
  );
}
