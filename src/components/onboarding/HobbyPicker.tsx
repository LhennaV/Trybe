"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

// Sample list from the Figma prototype. Replaced by GET /api/hobbies later.
const HAVE_OPTIONS = ["Crochet", "Film photography", "Watercolor", "Baking", "Cross-stitch", "Guitar", "Gardening"];
const TRY_OPTIONS = [
  "Pottery",
  "Calligraphy",
  "Bookbinding",
  "Candle making",
  "Woodworking",
  "Bouldering",
  "Resin art",
  "Embroidery",
];

function toggle(list: string[], hobby: string) {
  return list.includes(hobby) ? list.filter((h) => h !== hobby) : [...list, hobby];
}

function HobbyGroup({
  title,
  hint,
  options,
  selected,
  onToggle,
}: {
  title: string;
  hint: string;
  options: string[];
  selected: string[];
  onToggle: (hobby: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="flex items-baseline gap-2">
        <span className="text-title-m text-ink-900">{title}</span>
        <span className="text-caption text-ink-400">{hint}</span>
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {options.map((hobby) => (
          <Chip key={hobby} selected={selected.includes(hobby)} onClick={() => onToggle(hobby)}>
            {hobby}
          </Chip>
        ))}
      </div>
    </section>
  );
}

export default function HobbyPicker() {
  const router = useRouter();
  const [have, setHave] = useState<string[]>([]);
  const [wantToTry, setWantToTry] = useState<string[]>([]);
  const picked = have.length + wantToTry.length;

  return (
    <>
      <HobbyGroup
        title="I already do"
        hint="gear I might trade away"
        options={HAVE_OPTIONS}
        selected={have}
        onToggle={(hobby) => setHave((list) => toggle(list, hobby))}
      />
      <HobbyGroup
        title="I want to try"
        hint="gear I'm looking for"
        options={TRY_OPTIONS}
        selected={wantToTry}
        onToggle={(hobby) => setWantToTry((list) => toggle(list, hobby))}
      />

      <div className="flex-1" />

      {/* Picks aren't saved yet. They go to PATCH /api/me once accounts exist. */}
      <Button fullWidth disabled={picked === 0} onClick={() => router.push("/onboarding/area")}>
        {picked === 0 ? "Pick at least one" : `Continue · ${picked} picked`}
      </Button>
    </>
  );
}
