import type { CSSProperties } from "react";
import LandingSection from "@/components/landing/LandingSection";
import SectionLabel from "@/components/landing/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import Tilt from "@/components/ui/Tilt";

type Stage = "done" | "now" | "next" | "later";

// From docs/implementation-plan.md. Update `stage` as phases finish.
const STEPS: { stage: Stage; title: string; body: string }[] = [
  {
    stage: "done",
    title: "The prototype",
    body: "Every screen designed in Figma first, for phones and computers, from posting gear to rating a trade.",
  },
  {
    stage: "now",
    title: "Building the app",
    body: "Accounts, posts, the feed, trade offers, and chat, built as a web app you can add to your home screen.",
  },
  {
    stage: "next",
    title: "Beta testing",
    body: "A small group tries Trybe for real and tells us what's broken. Testers keep the First Litter badge.",
  },
  {
    stage: "later",
    title: "Launch",
    body: "Trybe opens to everyone on the web and on Google Play.",
  },
];

const STAGE_PILL: Record<Stage, { label: string; className: string }> = {
  done: { label: "Done", className: "bg-status-success-soft text-status-success" },
  now: { label: "Now", className: "bg-brand-plum text-surface-white" },
  next: { label: "Next", className: "bg-brand-lavender-soft text-brand-plum" },
  later: { label: "Later", className: "bg-line text-ink-600" },
};

// Where the app is and what comes next, so beta testers know what they're joining.
export default function RoadmapSection() {
  return (
    <LandingSection className="bg-brand-lavender-soft" innerClassName="flex flex-col gap-8 lg:gap-12">
      <div className="flex flex-col gap-3.5 lg:max-w-[760px] lg:gap-3">
        <SectionLabel>Where Trybe is headed</SectionLabel>
        <RevealText
          text="From notebook to your home screen."
          className="font-display text-display-section-m text-ink-900 lg:text-display-section"
        />
      </div>

      <ol className="grid gap-4 lg:grid-cols-4 lg:gap-5">
        {STEPS.map(({ stage, title, body }, index) => {
          const pill = STAGE_PILL[stage];
          const current = stage === "now";
          return (
            <li key={title} className="reveal-item relative" style={{ "--i": index } as CSSProperties}>
              <Tilt
                max={6}
                className={[
                  "card-lift flex h-full flex-col gap-3 rounded-3xl border-[1.5px] bg-surface-white p-5 lg:p-6",
                  current ? "border-brand-plum" : "border-line",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`flex size-9 items-center justify-center rounded-xl font-display text-display-m ${
                      current ? "bg-brand-plum text-surface-white" : "bg-brand-lavender-soft text-brand-plum"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`rounded-chip px-2.5 py-1 text-caption font-extrabold ${pill.className}`}>
                    {pill.label}
                  </span>
                </div>
                <h3 className="font-display text-display-m text-ink-900">{title}</h3>
                <p className="text-body-s text-ink-600 lg:text-body-m">{body}</p>
              </Tilt>
            </li>
          );
        })}
      </ol>
    </LandingSection>
  );
}
