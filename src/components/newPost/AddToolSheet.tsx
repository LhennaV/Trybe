"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ArrowsLeftRight, Plus, X } from "@phosphor-icons/react";
import type { ToolItem } from "@/components/posts/samplePostDetails";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Sheet from "@/components/ui/Sheet";
import Toggle from "@/components/ui/Toggle";
import { ACCEPTED_PHOTO_TYPES } from "./photos";

// Sample categories. They'll come from the hobby picked for the post (GET /api/hobbies).
const CATEGORIES = ["Wheels & kilns", "Hand tools", "Clay & glaze", "Other"];

type Condition = "like_new" | "good" | "fair" | "worn";
const CONDITIONS: { value: Condition; label: string; meta: string }[] = [
  { value: "like_new", label: "Like new", meta: "Like new" },
  { value: "good", label: "Good", meta: "Good condition" },
  { value: "fair", label: "Fair", meta: "Fair condition" },
  { value: "worn", label: "Worn", meta: "Worn" },
];

type AddToolSheetProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (tool: ToolItem) => void;
};

// "Add a tool" sheet (ITEM-01, ITEM-02). Rendered only while open, so each
// time it opens the form starts empty. It sits inside the new post <form>,
// and forms can't nest, so this one is a plain group with its own validation.
export default function AddToolSheet({ open, onClose, onAdd }: AddToolSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} label="Add a tool">
      {open && <AddToolForm onClose={onClose} onAdd={onAdd} />}
    </Sheet>
  );
}

function AddToolForm({ onClose, onAdd }: Omit<AddToolSheetProps, "open">) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState<Condition>("good");
  const [upForTrade, setUpForTrade] = useState(true);
  const [name, setName] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [nameError, setNameError] = useState("");
  const photoInputId = useId();

  function addTool() {
    if (!name.trim()) {
      setNameError("Give the tool a name so people know what it is.");
      return;
    }
    onAdd({
      id: `tool-${Date.now()}`,
      name: name.trim(),
      category,
      condition: CONDITIONS.find((c) => c.value === condition)?.meta ?? "",
      upForTrade,
      lookingFor: upForTrade && lookingFor.trim() ? lookingFor.trim() : undefined,
    });
    onClose();
  }

  return (
    <div
      role="group"
      aria-label="Add a tool"
      className="flex flex-col gap-3.5"
      // Enter in a field adds the tool instead of submitting the whole post.
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
          event.preventDefault();
          addTool();
        }
      }}
    >
      <div className="flex items-center">
        <h2 className="font-display text-display-m text-brand-plum">Add a tool</h2>
        <IconButton label="Close" className="ml-auto" onClick={onClose}>
          <X size={20} weight="bold" aria-hidden />
        </IconButton>
      </div>

      <div className="flex items-center gap-3">
        <label
          htmlFor={photoInputId}
          className="relative flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-[1.5px] border-dashed border-brand-plum bg-brand-lavender-soft text-brand-plum"
        >
          {photoUrl ? (
            <Image src={photoUrl} alt="Tool photo preview" fill sizes="56px" className="object-cover" />
          ) : (
            <Plus size={20} weight="bold" aria-hidden />
          )}
          <span className="sr-only">Add a photo of the tool</span>
        </label>
        <input
          id={photoInputId}
          type="file"
          accept={ACCEPTED_PHOTO_TYPES}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPhotoUrl(URL.createObjectURL(file));
          }}
        />
        <p className="text-caption text-ink-600">Add a clear photo of the tool itself, not just what you made with it.</p>
      </div>

      <Input
        label="Tool name"
        placeholder="e.g. Shimpo Aspire pottery wheel"
        value={name}
        error={nameError}
        onChange={(event) => {
          setName(event.target.value);
          setNameError("");
        }}
      />

      <div className="flex flex-col gap-2">
        <p id="category-label" className="text-label-s text-ink-600">
          Category
        </p>
        <div role="group" aria-labelledby="category-label" className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Chip key={item} selected={category === item} onClick={() => setCategory(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-s text-ink-600">Condition</p>
        <SegmentedControl label="Condition" options={CONDITIONS} value={condition} onChange={setCondition} />
      </div>

      <div className="flex items-center gap-2.5 rounded-input bg-brand-lavender-soft px-3.5 py-3">
        <ArrowsLeftRight size={18} weight="bold" className="shrink-0 text-brand-plum" aria-hidden />
        <span className="flex flex-1 flex-col gap-px">
          <span id="up-for-trade-label" className="text-body-m font-bold text-ink-900">
            Up for trade
          </span>
          <span className="text-caption text-ink-600">Others can propose a trade for this tool</span>
        </span>
        <Toggle checked={upForTrade} onCheckedChange={setUpForTrade} aria-labelledby="up-for-trade-label" />
      </div>

      {upForTrade && (
        <div className="flex flex-col gap-1.5">
          <Input
            label="Looking for (optional)"
            placeholder="e.g. Film camera, or trade +PHP 1,500"
            value={lookingFor}
            onChange={(event) => setLookingFor(event.target.value)}
          />
          <p className="text-caption text-ink-400">
            Say upfront what you&apos;d take in return so offers start closer to a yes.
          </p>
        </div>
      )}

      <Button fullWidth onClick={addTool}>
        Add tool
      </Button>
    </div>
  );
}
