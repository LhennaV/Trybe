"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";

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

const OTHER_MAX = 40;

// "Other" lets people name a hobby that isn't on the list yet.
type OtherState = { open: boolean; text: string };

function toggle(list: string[], hobby: string) {
  return list.includes(hobby) ? list.filter((h) => h !== hobby) : [...list, hobby];
}

function HobbyGroup({
  title,
  hint,
  options,
  selected,
  onToggle,
  other,
  onOtherChange,
  otherPlaceholder,
}: {
  title: string;
  hint: string;
  options: string[];
  selected: string[];
  onToggle: (hobby: string) => void;
  other: OtherState;
  onOtherChange: (other: OtherState) => void;
  otherPlaceholder: string;
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
        <Chip
          selected={other.open}
          aria-expanded={other.open}
          onClick={() => onOtherChange({ ...other, open: !other.open })}
          className="inline-flex items-center gap-1"
        >
          <Plus size={14} weight="bold" aria-hidden />
          Other
        </Chip>
      </div>
      {other.open && (
        <Input
          label="Which one?"
          placeholder={otherPlaceholder}
          value={other.text}
          maxLength={OTHER_MAX}
          autoFocus
          onChange={(event) => onOtherChange({ ...other, text: event.target.value })}
        />
      )}
    </section>
  );
}

export default function HobbyPicker() {
  const router = useRouter();
  const [have, setHave] = useState<string[]>([]);
  const [wantToTry, setWantToTry] = useState<string[]>([]);
  const [haveOther, setHaveOther] = useState<OtherState>({ open: false, text: "" });
  const [tryOther, setTryOther] = useState<OtherState>({ open: false, text: "" });
  const countOther = (other: OtherState) => (other.open && other.text.trim() ? 1 : 0);
  const picked = have.length + wantToTry.length + countOther(haveOther) + countOther(tryOther);

  return (
    <>
      <HobbyGroup
        title="I already do"
        hint="gear I might trade away"
        options={HAVE_OPTIONS}
        selected={have}
        onToggle={(hobby) => setHave((list) => toggle(list, hobby))}
        other={haveOther}
        onOtherChange={setHaveOther}
        otherPlaceholder="e.g. Knitting"
      />
      <HobbyGroup
        title="I want to try"
        hint="gear I'm looking for"
        options={TRY_OPTIONS}
        selected={wantToTry}
        onToggle={(hobby) => setWantToTry((list) => toggle(list, hobby))}
        other={tryOther}
        onOtherChange={setTryOther}
        otherPlaceholder="e.g. Leathercraft"
      />

      <div className="flex-1" />

      {/* Picks aren't saved yet. They go to PATCH /api/me, which only takes hobby
          ids, so "Other" needs a backend field before it can be saved. */}
      <Button fullWidth disabled={picked === 0} onClick={() => router.push("/onboarding/area")}>
        {picked === 0 ? "Pick at least one" : `Continue · ${picked} picked`}
      </Button>
    </>
  );
}
