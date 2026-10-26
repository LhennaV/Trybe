"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowsLeftRight, Camera, Check, EyeSlash, Package, Star } from "@phosphor-icons/react";
import { reportHref } from "@/components/safety/reportHref";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import TopBar from "@/components/ui/TopBar";

const TAGS = ["Item as described", "On time", "Friendly", "Easy to negotiate", "Good meetup spot"];
const SCORE_LABELS = ["", "Not great", "Could be better", "It was okay", "Great trade!", "Amazing trade!"];

type RateFormProps = {
  tradeId: string;
  other: { handle: string; rating: number; tradeCount: number };
  summary: string;
  completedNote: string;
};

// Rate your trade (RATE-01). One rating per person per trade. Ratings stay
// hidden until both people rate or 7 days pass (RATE-02).
export default function RateForm({ tradeId, other, summary, completedNote }: RateFormProps) {
  const [score, setScore] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const noteId = useId();

  return (
    <form
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("Thanks! Ratings aren't connected yet. They go live once the ratings API is ready.");
      }}
    >
      <div className="flex flex-1 flex-col gap-4 px-4 pt-2 pb-[calc(110px+max(26px,env(safe-area-inset-bottom)))]">
        <TopBar title="Rate your trade" backHref={`/trades/${tradeId}`} />

        <p className="flex items-center gap-2.5 rounded-input bg-status-success-soft px-3 py-2.5 text-body-s font-bold text-ink-900">
          <span className="flex size-[26px] shrink-0 items-center justify-center rounded-chip bg-status-success text-surface-white">
            <Check size={14} weight="bold" aria-hidden />
          </span>
          {completedNote}
        </p>

        <div className="flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-line bg-surface-white px-4 py-[18px]">
          <Avatar name={other.handle} size={72} />
          <p className="text-title-m text-ink-900">@{other.handle}</p>
          <p className="text-caption text-ink-600">
            {other.tradeCount > 0 ? `★ ${other.rating} · ${other.tradeCount} trades` : "New trader"}
          </p>
          <p className="flex w-full items-center gap-2 rounded-xl bg-brand-cream px-3 py-2 text-caption text-ink-900">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-lavender-soft text-brand-plum">
              <Camera size={13} weight="bold" aria-hidden />
            </span>
            <ArrowsLeftRight size={14} weight="bold" className="shrink-0 text-ink-400" aria-hidden />
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-box-soft text-brand-box-dark">
              <Package size={13} weight="bold" aria-hidden />
            </span>
            {summary}
          </p>
        </div>

        <fieldset className="flex flex-col items-center gap-2">
          <legend className="sr-only">Your rating</legend>
          <div role="radiogroup" aria-label="Stars" className="flex gap-2.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={score === value}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                onClick={() => setScore(value)}
                className="flex size-11 items-center justify-center"
              >
                <Star size={40} weight="fill" className={value <= score ? "text-brand-box" : "text-line"} aria-hidden />
              </button>
            ))}
          </div>
          <p className="min-h-[21px] text-body-m font-bold text-brand-plum" aria-live="polite">
            {SCORE_LABELS[score]}
          </p>
        </fieldset>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-body-m font-bold text-ink-900">What went well?</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Chip
                key={tag}
                selected={tags.includes(tag)}
                onClick={() => setTags((list) => (list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]))}
              >
                {tag}
              </Chip>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={noteId} className="text-label-s text-ink-600">
            Leave a note (shows on their profile)
          </label>
          <textarea
            id={noteId}
            rows={3}
            maxLength={300}
            placeholder="How did the swap go?"
            className="resize-none rounded-input border-[1.5px] border-line bg-surface-white px-3.5 py-3 text-body-s text-ink-900 placeholder:text-ink-400"
          />
        </div>

        <p className="flex items-start gap-2 text-caption text-ink-600">
          <EyeSlash size={14} weight="bold" className="mt-px shrink-0" aria-hidden />
          Your rating stays hidden until @{other.handle} rates too, or 7 days pass. That way nobody rates in reply.
        </p>

        {notice && (
          <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
            {notice}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2.5 px-4 pt-3 pb-[max(26px,env(safe-area-inset-bottom))]">
          <Button type="submit" fullWidth disabled={score === 0}>
            {score === 0 ? "Tap the stars to rate" : "Submit rating"}
          </Button>
          <Link
            href={reportHref("trade", other.handle, `/trades/${tradeId}/rate`)}
            className="flex min-h-11 items-center text-label-s font-bold text-status-danger"
          >
            Something went wrong? Report this trade
          </Link>
        </div>
      </div>
    </form>
  );
}
