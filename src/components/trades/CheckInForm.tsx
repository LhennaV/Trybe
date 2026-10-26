"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarBlank, Info } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import ChoiceList from "@/components/ui/ChoiceList";
import TopBar from "@/components/ui/TopBar";

type Outcome = "traded" | "no_show" | "no_trade" | "rescheduled";

const OUTCOMES: { value: Outcome; title: string }[] = [
  { value: "traded", title: "We traded! Mark it completed" },
  { value: "no_show", title: "They didn't show up" },
  { value: "no_trade", title: "We met but didn't trade" },
  { value: "rescheduled", title: "We moved it to another day" },
];

const BUTTON_LABELS: Record<Outcome, string> = {
  traded: "Mark completed",
  no_show: "Submit check-in",
  no_trade: "Cancel the trade",
  rescheduled: "Pick a new time",
};

const FOOTNOTES: Record<Outcome, string> = {
  traded: "The trade completes once you both confirm the handoff.",
  no_show: "Your items go back to up for trade automatically.",
  no_trade: "Your items go back to up for trade automatically.",
  rescheduled: "You'll pick a new spot and time together.",
};

// After the meetup (MEET-05, MEET-06). A trade completes only when both
// people confirm. "They didn't show up" cancels it and files a report.
export default function CheckInForm({
  tradeId,
  otherHandle,
  meetup,
}: {
  tradeId: string;
  otherHandle: string;
  meetup: { when: string; where: string };
}) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [messaged, setMessaged] = useState<"yes" | "no" | null>(null);

  return (
    <form
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (outcome === "traded") router.push(`/trades/${tradeId}/rate`);
        else if (outcome === "rescheduled") router.push(`/trades/${tradeId}/meetup`);
        else router.push(`/trades/${tradeId}`);
      }}
    >
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-[calc(100px+max(30px,env(safe-area-inset-bottom)))]">
        <TopBar title="Meetup check-in" backHref={`/trades/${tradeId}`} />

        <div className="flex items-center gap-2.5 rounded-card border-[1.5px] border-line bg-surface-white p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lavender-soft text-brand-plum">
            <CalendarBlank size={18} weight="bold" aria-hidden />
          </span>
          <span className="flex flex-col gap-px">
            <span className="text-body-s font-bold text-ink-900">{meetup.when}</span>
            <span className="text-caption text-ink-600">{meetup.where}</span>
          </span>
        </div>

        <h1 className="font-display text-display-m text-brand-plum">How did it go?</h1>
        <ChoiceList label="How did it go?" look="list" options={OUTCOMES} value={outcome} onChange={setOutcome} />

        {outcome === "no_show" && (
          <div className="flex flex-col gap-2.5 rounded-card border-[1.5px] border-line bg-surface-white p-3.5">
            <p id="messaged-label" className="text-body-s font-bold text-ink-900">
              Did you message them?
            </p>
            <div role="group" aria-labelledby="messaged-label" className="flex gap-2">
              <Chip selected={messaged === "yes"} onClick={() => setMessaged("yes")}>
                Yes, no reply
              </Chip>
              <Chip selected={messaged === "no"} onClick={() => setMessaged("no")}>
                Not yet
              </Chip>
            </div>
            <p className="flex items-start gap-2 rounded-xl bg-status-warning-soft px-3 py-2.5 text-caption text-ink-900">
              <Info size={16} weight="bold" className="shrink-0 text-status-warning" aria-hidden />
              This cancels the trade and sends a no-show report about @{otherHandle} to the Trybe team.
            </p>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-4 pt-3 pb-[max(30px,env(safe-area-inset-bottom))]">
          <Button type="submit" fullWidth disabled={!outcome}>
            {outcome ? BUTTON_LABELS[outcome] : "Pick what happened"}
          </Button>
          {outcome && <p className="text-caption text-ink-400">{FOOTNOTES[outcome]}</p>}
        </div>
      </div>
    </form>
  );
}
