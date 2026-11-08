import type { ReactNode } from "react";
import Link from "next/link";
import SectionLabel from "@/components/landing/SectionLabel";

export const CONTACT_EMAIL = "trybeapp.team@gmail.com";
// Opens a new Gmail message to us in a new tab. A mailto: link does nothing
// on computers with no mail app set up, which is most of them.
export const CONTACT_HREF = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}`;

export type LegalSection = { id: string; title: string; body: ReactNode };

const DOCS = [
  { href: "/terms", label: "Terms of use" },
  { href: "/privacy", label: "Privacy notice" },
  { href: "/guidelines", label: "Community guidelines" },
];

type LegalDocProps = {
  title: string;
  intro: ReactNode;
  updated: string;
  current: string;
  sections: LegalSection[];
};

// Shared layout for the legal pages: title and summary, then numbered
// sections with a sticky "On this page" list on desktop. Written in plain
// language; the final wording is agreed by both founders before launch (SAFE-07).
export default function LegalDoc({ title, intro, updated, current, sections }: LegalDocProps) {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-16 lg:px-10 lg:pt-14 lg:pb-24">
      <header className="flex animate-fade-up flex-col gap-4 border-b-[1.5px] border-line pb-8 lg:max-w-[720px] lg:pb-10">
        <SectionLabel>Legal</SectionLabel>
        <h1 className="font-display text-display-hero-m text-ink-900 lg:text-display-section">{title}</h1>
        <div className="text-lead-m text-ink-600 lg:text-lead">{intro}</div>
        <p className="text-body-s text-ink-600">
          Last updated {updated} ·{" "}
          <span className="rounded-chip bg-status-warning-soft px-2.5 py-0.5 text-caption font-extrabold text-status-warning">
            Draft before launch
          </span>
        </p>
      </header>

      <div className="flex flex-col gap-10 pt-8 lg:flex-row lg:gap-16 lg:pt-12">
        <aside className="lg:sticky lg:top-28 lg:w-[240px] lg:shrink-0 lg:self-start">
          <nav aria-label="On this page" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-label-s tracking-[0.08em] text-ink-600 uppercase">On this page</p>
              <ol className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex min-h-11 items-center gap-2 rounded-chip border-[1.5px] border-line bg-surface-white px-3 text-body-s font-bold text-ink-600 lg:min-h-9 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0"
                    >
                      <span className="text-brand-plum">{index + 1}.</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div className="hidden flex-col gap-1 border-t-[1.5px] border-line pt-5 lg:flex">
              {DOCS.filter((doc) => doc.href !== current).map((doc) => (
                <Link key={doc.href} href={doc.href} className="flex min-h-9 items-center text-body-s font-bold text-brand-plum">
                  {doc.label}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        <article className="flex min-w-0 flex-1 flex-col gap-10 lg:max-w-[680px]">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="flex flex-col gap-3">
              <h2 className="flex items-baseline gap-3 font-display text-display-m text-ink-900">
                <span className="text-brand-plum">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <div className="flex flex-col gap-3 text-body-m text-ink-600 [&_a]:font-bold [&_a]:text-brand-plum [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-bold [&_strong]:text-ink-900 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
                {section.body}
              </div>
            </section>
          ))}

          <div className="flex flex-col gap-2 rounded-card bg-brand-lavender-soft p-5 lg:p-6">
            <p className="font-display text-display-m text-ink-900">Questions?</p>
            <p className="text-body-m text-ink-600">
              Email us at{" "}
              <a href={CONTACT_HREF} target="_blank" rel="noreferrer" className="font-bold break-all text-brand-plum">
                {CONTACT_EMAIL}
              </a>
              . A real person (one of the two of us) will read it.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
