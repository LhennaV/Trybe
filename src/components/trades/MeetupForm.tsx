"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";
import { CalendarBlank, ShieldCheck } from "@phosphor-icons/react";
import type { MeetupSpot } from "@/shared/contracts/trades";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import ChoiceList from "@/components/ui/ChoiceList";
import Skeleton from "@/components/ui/Skeleton";
import TopBar from "@/components/ui/TopBar";
import TradeProgress from "./TradeProgress";

// Leaflet needs `window`, so the map only loads in the browser.
const MeetupMap = dynamic(() => import("./MeetupMap"), {
  ssr: false,
  loading: () => <Skeleton tone="photo" className="h-full w-full" />,
});

// Sample safe spots in the contract's shape. They'll come from
// GET /api/meetup-spots?city= (MEET-02).
const SPOTS: MeetupSpot[] = [
  {
    id: "5b0d6c1e-3f7a-4c2e-9a51-0e8f4d2b7c01",
    city: "Quezon City",
    name: "Trinoma Mall · main entrance",
    description: "Suggested safe spot · public, CCTV, guards",
    lat: 14.6535,
    lng: 121.0335,
  },
  {
    id: "5b0d6c1e-3f7a-4c2e-9a51-0e8f4d2b7c02",
    city: "Quezon City",
    name: "Quezon Memorial Circle · park gate",
    description: "Suggested safe spot · open area, daylight only",
    lat: 14.6517,
    lng: 121.0494,
  },
];

const SPOT_OPTIONS = SPOTS.map((spot) => ({ value: spot.id, title: spot.name, description: spot.description }));

const CHECKLIST = [
  "Meet at the public spot above, not at home",
  "Inspect the gear in person before you swap",
  "Hand over cash only at the swap, never before",
  "Tell a friend where and when you're meeting",
];

// Set up the meetup (MEET-01, MEET-03, MEET-04). Both people confirm the same
// spot and time; that part waits for the meetup endpoints.
export default function MeetupForm({ tradeId, otherHandle }: { tradeId: string; otherHandle: string }) {
  const [spot, setSpot] = useState<string | null>(SPOTS[0].id);
  const [notice, setNotice] = useState("");
  const whenId = useId();

  return (
    <form
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col lg:my-8 lg:min-h-0 lg:max-w-[560px] lg:rounded-sheet lg:border-[1.5px] lg:border-line lg:bg-surface-white lg:p-3 lg:shadow-modal"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(`Saved here for now. @${otherHandle} confirms it once meetups are connected to the API.`);
      }}
    >
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-[calc(100px+max(30px,env(safe-area-inset-bottom)))] lg:pb-2">
        <TopBar title="Set up the meetup" backHref={`/trades/${tradeId}`} />
        <TradeProgress current={1} />

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display-m text-brand-plum">Trade accepted! 🎉</h1>
          <p className="text-body-s text-ink-600">Pick a public spot and run through the checklist before you swap.</p>
        </div>

        {/* The list below is the accessible way to pick; the map shows where each spot is.
            isolate keeps Leaflet's high z-indexes under the fixed footer. */}
        <div
          role="group"
          aria-label="Map of the suggested meetup spots"
          className="relative isolate h-[180px] overflow-hidden rounded-card border-[1.5px] border-line lg:h-[220px]"
        >
          <MeetupMap spots={SPOTS} selectedId={spot} onSelect={setSpot} />
        </div>

        <ChoiceList label="Meetup spot" options={SPOT_OPTIONS} value={spot} onChange={setSpot} />

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

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white lg:static lg:border-0 lg:bg-transparent">
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
