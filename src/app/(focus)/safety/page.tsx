import type { Metadata } from "next";
import { CheckCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = {
  title: "Trade safely",
  description: "Tips for safe, in-person hobby gear trades on Trybe.",
};

const TIPS = [
  { title: "Meet in public", body: "Pick a busy spot with guards or CCTV, like a mall entrance. Never meet at home." },
  { title: "Keep the chat on Trybe", body: "It keeps your offers and messages in one place if anything goes wrong." },
  { title: "Never pay ahead", body: "Cash changes hands at the meetup, in person. Trybe never asks for a reservation fee." },
  { title: "Check the gear first", body: "Look it over, plug it in, try it out. It's fine to walk away if it's not as described." },
  { title: "Tell a friend", body: "Share where and when you're meeting. Go in daylight when you can." },
  { title: "Trust your gut", body: "If something feels off, leave, block them, and report it." },
];

// Safety tips (SAFE-06). Ratings and badges help, but they're not a guarantee,
// and this page says so.
export default function SafetyPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Trade safely" backHref="/" />
      <div className="flex flex-col items-start gap-2 rounded-card bg-status-success-soft p-3.5">
        <ShieldCheck size={24} weight="bold" className="text-status-success" aria-hidden />
        <p className="text-body-s text-ink-900">
          Ratings, trade history, and badges help you decide who to trade with. They lower the risk, but they
          can&apos;t guarantee a trade goes well. Trybe doesn&apos;t hold payments or ship items, so these habits matter.
        </p>
      </div>
      <ul className="flex flex-col gap-2.5">
        {TIPS.map((tip) => (
          <li key={tip.title} className="flex gap-3 rounded-card border-[1.5px] border-line bg-surface-white p-3.5">
            <CheckCircle size={20} weight="fill" className="shrink-0 text-brand-plum" aria-hidden />
            <span className="flex flex-col gap-0.5">
              <span className="text-body-m font-bold text-ink-900">{tip.title}</span>
              <span className="text-body-s text-ink-600">{tip.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
