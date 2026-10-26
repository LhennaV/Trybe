"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { LockSimple, MapPin, X } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Sheet from "@/components/ui/Sheet";

type Show = "all" | "trade" | "inspo";
type Sort = "for_you" | "newest" | "nearest";

const HOBBIES = ["Pottery", "Bookbinding", "Film photo", "Crochet", "Calligraphy", "Baking", "Watercolor"];
const CONDITIONS = ["Like new", "Good", "Fair", "Worn"];
const DISTANCES = [1, 5, 10, 25];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

// Explore filters (EXP-02). Applying them opens search results with the
// filters in the URL, so results can be shared and the back button works.
export default function FiltersSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label="Filters">
      {open && <FiltersForm onClose={onClose} />}
    </Sheet>
  );
}

function FiltersForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [show, setShow] = useState<Show>("all");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [distanceIndex, setDistanceIndex] = useState(2);
  const [swaps, setSwaps] = useState(true);
  const [cash, setCash] = useState(true);
  const [sort, setSort] = useState<Sort>("for_you");
  const distanceId = useId();

  function reset() {
    setShow("all");
    setHobbies([]);
    setConditions([]);
    setDistanceIndex(2);
    setSwaps(true);
    setCash(true);
    setSort("for_you");
  }

  function apply() {
    const params = new URLSearchParams();
    if (show !== "all") params.set("show", show);
    hobbies.forEach((h) => params.append("hobby", h));
    conditions.forEach((c) => params.append("condition", c));
    params.set("within", String(DISTANCES[distanceIndex]));
    if (sort !== "for_you") params.set("sort", sort);
    onClose();
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <IconButton label="Close filters" onClick={onClose}>
          <X size={20} weight="bold" aria-hidden />
        </IconButton>
        <h2 className="font-display text-display-m text-brand-plum">Filters</h2>
        <button type="button" onClick={reset} className="ml-auto min-h-11 text-body-s font-bold text-ink-600">
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-s text-ink-600">Show</p>
        <SegmentedControl
          label="Show"
          value={show}
          onChange={setShow}
          options={[
            { value: "all", label: "Everything" },
            { value: "trade", label: "Up for trade" },
            { value: "inspo", label: "Inspiration" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-s text-ink-600">Hobbies</p>
        <div className="flex flex-wrap gap-2">
          {HOBBIES.map((hobby) => (
            <Chip key={hobby} selected={hobbies.includes(hobby)} onClick={() => setHobbies((l) => toggle(l, hobby))}>
              {hobby}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-s text-ink-600">Condition</p>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((condition) => (
            <Chip
              key={condition}
              selected={conditions.includes(condition)}
              onClick={() => setConditions((l) => toggle(l, condition))}
            >
              {condition}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={distanceId} className="text-label-s text-ink-600">
          Distance
        </label>
        <p className="flex items-center gap-2 text-title-m text-ink-900">
          <MapPin size={18} weight="bold" className="text-brand-plum" aria-hidden />
          Within {DISTANCES[distanceIndex]} km
          <span className="ml-auto text-caption font-normal text-ink-400">{DISTANCES.join(" · ")} km</span>
        </p>
        <input
          id={distanceId}
          type="range"
          min={0}
          max={DISTANCES.length - 1}
          step={1}
          value={distanceIndex}
          onChange={(event) => setDistanceIndex(Number(event.target.value))}
          aria-valuetext={`Within ${DISTANCES[distanceIndex]} km`}
          className="h-11 w-full accent-brand-plum"
        />
        <p className="flex items-center gap-1.5 text-caption text-ink-600">
          <LockSimple size={12} weight="bold" aria-hidden />
          Distance is from your city, never your exact spot.
        </p>
      </div>

      <div className="flex flex-col">
        <p className="text-label-s text-ink-600">Trade terms</p>
        <Checkbox label="Item-for-item swaps" checked={swaps} onChange={(e) => setSwaps(e.target.checked)} />
        <Checkbox label="Open to cash top-ups" checked={cash} onChange={(e) => setCash(e.target.checked)} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-s text-ink-600">Sort by</p>
        <SegmentedControl
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={[
            { value: "for_you", label: "For you" },
            { value: "newest", label: "Newest" },
            { value: "nearest", label: "Nearest" },
          ]}
        />
      </div>

      <Button fullWidth onClick={apply}>
        Show results
      </Button>
    </div>
  );
}
