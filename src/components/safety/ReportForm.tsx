"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CheckCircle, LockSimple } from "@phosphor-icons/react";
import Button, { buttonClassName } from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import ChoiceList from "@/components/ui/ChoiceList";
import TopBar from "@/components/ui/TopBar";

export type ReportTarget = "user" | "post" | "trade" | "review" | "message";

const REASONS = [
  { value: "pay_first", title: "Asked me to pay before meeting" },
  { value: "not_as_described", title: "Item wasn't as described" },
  { value: "no_show", title: "Didn't show up to the meetup" },
  { value: "harassment", title: "Harassment or creepy messages" },
  { value: "unsafe_item", title: "Fake, stolen, or unsafe item" },
  { value: "other", title: "Something else" },
];

const TARGET_LABELS: Record<ReportTarget, string> = {
  user: "",
  post: "this post by ",
  trade: "this trade with ",
  review: "a review by ",
  message: "a message from ",
};

// Report a user, post, trade, review, or message (SAFE-01). Reports are
// private; the person reported never sees who sent it, and report counts are
// never shown publicly (PROF-07).
export default function ReportForm({
  target,
  handle,
  backHref,
}: {
  target: ReportTarget;
  handle: string;
  backHref: string;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [sent, setSent] = useState(false);
  const detailsId = useId();

  if (sent) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <CheckCircle size={56} weight="fill" className="text-status-success" aria-hidden />
        <h1 className="font-display text-display-m text-ink-900">Thanks for telling us</h1>
        <p className="max-w-[310px] text-body-s text-ink-600">
          The Trybe team will look into it.
          {alsoBlock && ` @${handle} is blocked, so they can't message you or propose trades.`}
        </p>
        <Link href={backHref} className={buttonClassName({ fullWidth: true, className: "mt-2" })}>
          Done
        </Link>
      </main>
    );
  }

  return (
    <form
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        // Sent to POST /api/reports once it exists.
        setSent(true);
      }}
    >
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-[calc(90px+max(30px,env(safe-area-inset-bottom)))]">
        <TopBar title={`Report ${TARGET_LABELS[target]}@${handle}`} backHref={backHref} />

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display-m text-brand-plum">What&apos;s going on?</h1>
          <p className="text-body-s text-ink-600">Pick the closest match. The Trybe team reviews every report.</p>
        </div>

        <ChoiceList label="Reason" look="list" options={REASONS} value={reason} onChange={setReason} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor={detailsId} className="text-label-s text-ink-600">
            Tell us more (optional)
          </label>
          <textarea
            id={detailsId}
            rows={3}
            maxLength={1000}
            placeholder="What happened? Dates and amounts help."
            className="resize-none rounded-input border-[1.5px] border-line bg-surface-white px-3.5 py-3 text-body-s text-ink-900 placeholder:text-ink-400"
          />
        </div>

        <Checkbox
          label={<span className="font-bold">Also block @{handle}</span>}
          checked={alsoBlock}
          onChange={(event) => setAlsoBlock(event.target.checked)}
        />

        <p className="flex items-start gap-2 rounded-xl bg-brand-lavender-soft px-3 py-2.5 text-caption text-ink-900">
          <LockSimple size={16} weight="bold" className="shrink-0 text-brand-plum" aria-hidden />
          Reports are private. @{handle} won&apos;t see who reported them.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white">
        <div className="mx-auto max-w-md px-4 pt-3 pb-[max(30px,env(safe-area-inset-bottom))]">
          <Button type="submit" variant="danger" fullWidth disabled={!reason}>
            {reason ? "Submit report" : "Pick a reason"}
          </Button>
        </div>
      </div>
    </form>
  );
}
