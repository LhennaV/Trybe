import { Plus } from "@phosphor-icons/react/dist/ssr";
import LandingSection from "./LandingSection";
import SectionLabel from "./SectionLabel";

// Figma only writes out the first answer. The rest follow the product rules in AGENTS.md.
const QUESTIONS = [
  {
    question: "Is Trybe free?",
    answer: "Yes. Posting, browsing and trading on Trybe don't cost anything.",
  },
  {
    question: "What if a trade isn't even?",
    answer:
      "Add some cash or another item to balance it out. You agree on it in the chat, and any cash is paid in person at the meetup. Trybe never handles your money.",
  },
  {
    question: "Can I ship items instead of meeting up?",
    answer:
      "Not on Trybe. Every trade happens in person, so you can check the item before you swap. Pick a public spot, and bring a friend if you like.",
  },
  {
    question: "Who will I be trading with?",
    answer:
      "Hobbyists in your city. Profiles show their badges, ratings and finished trades. Those help you decide, but they can't guarantee anything, so always meet somewhere public.",
  },
  {
    question: "When can I use it?",
    answer: "We're testing Trybe now. Join the beta and you'll be one of the first in.",
  },
];

export default function FaqSection() {
  return (
    <LandingSection
      id="faq"
      className="bg-surface-white"
      innerClassName="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-16"
    >
      <div className="flex flex-col gap-3 lg:w-[360px] lg:shrink-0">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="font-display text-display-section-m text-ink-900 lg:text-display-section">
          Questions people ask us.
        </h2>
      </div>

      <div className="flex flex-col gap-3 lg:flex-1">
        {QUESTIONS.map(({ question, answer }, index) => (
          <details key={question} open={index === 0} className="group rounded-card bg-brand-cream lg:rounded-[18px]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 px-[18px] py-4 group-open:pb-0 lg:px-6 lg:py-5 lg:group-open:pb-0 [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-body-s font-bold text-ink-900 lg:text-title-m">{question}</span>
              <Plus
                size={20}
                weight="bold"
                className="size-[18px] shrink-0 text-brand-plum transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none lg:size-5"
                aria-hidden
              />
            </summary>
            <p className="animate-fade-in px-[18px] pt-1.5 pb-4 text-body-s text-ink-600 lg:px-6 lg:pt-2 lg:pb-5 lg:text-body-m">{answer}</p>
          </details>
        ))}
      </div>
    </LandingSection>
  );
}
