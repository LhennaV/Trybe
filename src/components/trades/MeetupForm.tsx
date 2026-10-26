"use client";

import { useId, useState } from "react";
import { CalendarBlank, MapPin, ShieldCheck } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import ChoiceList from "@/components/ui/ChoiceList";
import TopBar from "@/components/ui/TopBar";
import TradeProgress from "./TradeProgress";

// Sample safe spots. They'll come from the meetup_spots table (MEET-02).
const SPOTS = [
  { value: "trinoma", title: "Trinoma Mall · main entrance", description: "Suggested safe spot · public, CCTV, guards" },
  { value: "qmc", title: "Quezon Memorial Circle · park gate", description: "Suggested safe spot · open area, daylight only" },
];

const CHECKLIST = [
  "Meet at the public spot above, not at home",
  "Inspect the gear in person before you swap",
  "Hand over cash only at the swap, never before",
  "Tell a friend where and when you're meeting",
];

// Set up the meetup (MEET-01, MEET-03, MEET-04). Both people confirm the same
// spot and time; that part waits for the meetup endpoints.
export default function MeetupForm({ tradeId, otherHandle }: { tradeId: string; otherHandle: string }) {
  const [spot, setSpot] = useState<string | null>(SPOTS[0].value);
  const [notice, setNotice] = useState("");
  const whenId = useId();

  return (
    <form
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(`Saved here for now. @${otherHandle} confirms it once meetups are connected to the API.`);
      }}
    >
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-[calc(100px+max(30px,env(safe-area-inset-bottom)))]">
        <TopBar title="Set up the meetup" backHref={`/trades/${tradeId}`} />
        <TradeProgress current={1} />

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display-m text-brand-plum">Trade accepted! 🎉</h1>
          <p className="text-body-s text-ink-600">Pick a public spot and run through the checklist before you swap.</p>
        </div>

        {/* Map placeholder in theme colors. Leaflet + OpenStreetMap replaces it with the real spots. */}
        <div className="relative h-[100px] overflow-hidden rounded-card bg-brand-lavender-soft" aria-hidden>
          <span className="absolute inset-x-0 top-[48px] h-2 -rotate-3 bg-surface-white" />
          <span className="absolute inset-x-0 top-[88px] h-1.5 rotate-1 bg-surface-white" />
          <span className="absolute inset-y-0 left-[34%] w-2 rotate-6 bg-surface-white" />
          <span className="absolute inset-y-0 left-[68%] w-1.5 -rotate-3 bg-surface-white" />
          <span
            className={`absolute top-[30px] left-[38%] flex size-[30px] items-center justify-center rounded-chip ${
              spot === "trinoma" ? "bg-brand-plum text-surface-white" : "border-2 border-brand-plum bg-surface-white text-brand-plum"
            }`}
          >
            <MapPin size={16} weight="bold" />
          </span>
          <span
            className={`absolute top-[50px] left-[70%] flex size-[30px] items-center justify-center rounded-chip ${
              spot === "qmc" ? "bg-brand-plum text-surface-white" : "border-2 border-brand-plum bg-surface-white text-brand-plum"
            }`}
          >
            <MapPin size={16} weight="bold" />
          </span>
        </div>

        <ChoiceList label="Meetup spot" options={SPOTS} value={spot} onChange={setSpot} />

        <div className="flex items-center gap-2.5 rounded-input border-[1.5px] border-line bg-surface-white px-3 py-1.5">
          <CalendarBlank size={18} weight="bold" className="shrink-0 text-brand-plum" aria-hidden />
          <label htmlFor={whenId} className="sr-only">
            Date and time
          </label>
          <input
            id={whenId}
            type="datetime-local"
            required
            className="min-h-10 min-w-0 flex-1 bg-transparent text-body-s font-bold text-ink-900 outline-none"
          />
        </div>

        <section className="flex flex-col gap-1 rounded-card bg-status-success-soft px-3.5 py-3">
          <h2 className="flex items-center gap-2 text-body-m font-bold text-ink-900">
            <ShieldCheck size={18} weight="bold" className="text-status-success" aria-hidden />
            Before you swap
          </h2>
          {CHECKLIST.map((item) => (
            <Checkbox key={item} label={item} />
          ))}
        </section>

        {notice && (
          <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
            {notice}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-4 pt-3 pb-[max(30px,env(safe-area-inset-bottom))]">
          <Button type="submit" fullWidth disabled={!spot}>
            Confirm meetup
          </Button>
          <p className="text-caption text-ink-400">After the handoff, you&apos;ll both mark the trade completed.</p>
        </div>
      </div>
    </form>
  );
}
