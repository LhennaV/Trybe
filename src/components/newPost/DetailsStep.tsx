"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ArrowsLeftRight, CaretRight, Plus, Sparkle, Tag } from "@phosphor-icons/react";
import type { ToolItem } from "@/components/posts/samplePostDetails";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import Sheet from "@/components/ui/Sheet";
import ToolRow from "@/components/ui/ToolRow";
import AddToolSheet from "./AddToolSheet";
import { ACCEPTED_PHOTO_TYPES, MAX_POST_PHOTOS, type PickedPhoto } from "./photos";

// Sample list. Comes from GET /api/hobbies later.
const HOBBIES = ["Pottery", "Film photography", "Crochet", "Watercolor", "Baking", "Calligraphy", "Bookbinding"];

type DetailsStepProps = {
  photos: PickedPhoto[];
  onAddPhotos: (files: FileList | null) => void;
  tools: ToolItem[];
  onAddTool: (tool: ToolItem) => void;
  hobby: string;
  onHobbyChange: (hobby: string) => void;
};

// Step 2: title, caption, hobby, and the tools used (POST-01).
export default function DetailsStep({ photos, onAddPhotos, tools, onAddTool, hobby, onHobbyChange }: DetailsStepProps) {
  const [toolSheetOpen, setToolSheetOpen] = useState(false);
  const [hobbySheetOpen, setHobbySheetOpen] = useState(false);
  const addPhotoId = useId();
  const captionId = useId();
  // "For trade" is derived from the tools, never picked by hand (POST-02).
  const forTrade = tools.some((tool) => tool.upForTrade);

  return (
    <>
      <ul className="flex gap-2.5 overflow-x-auto lg:hidden" aria-label="Photos">
        {photos.map((photo, index) => (
          <li key={photo.id} className="relative size-[72px] shrink-0 overflow-hidden rounded-xl">
            <Image src={photo.url} alt={`Photo ${index + 1}`} fill sizes="72px" className="object-cover" />
          </li>
        ))}
        {photos.length < MAX_POST_PHOTOS && (
          <li className="size-[72px] shrink-0">
            <label
              htmlFor={addPhotoId}
              className="flex size-full cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-dashed border-brand-plum bg-brand-lavender-soft text-brand-plum"
            >
              <Plus size={26} weight="bold" aria-hidden />
              <span className="sr-only">Add more photos</span>
            </label>
            <input
              id={addPhotoId}
              type="file"
              accept={ACCEPTED_PHOTO_TYPES}
              multiple
              className="sr-only"
              onChange={(event) => {
                onAddPhotos(event.target.files);
                event.target.value = "";
              }}
            />
          </li>
        )}
      </ul>

      <Input label="Title" name="title" placeholder="e.g. Hand-thrown speckled mug set" maxLength={80} required />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={captionId} className="text-label-s text-ink-600">
          Caption
        </label>
        <textarea
          id={captionId}
          name="caption"
          rows={3}
          maxLength={1000}
          placeholder="How did it go? What would you do differently?"
          className="resize-none rounded-input border-[1.5px] border-line bg-surface-white px-4 py-3 text-body-s text-ink-900 placeholder:text-ink-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p id="hobby-label" className="text-label-s text-ink-600">
          Hobby
        </p>
        <button
          type="button"
          aria-labelledby="hobby-label"
          aria-haspopup="dialog"
          onClick={() => setHobbySheetOpen(true)}
          className="flex min-h-[52px] items-center rounded-input border-[1.5px] border-line bg-surface-white px-4 py-3 text-left"
        >
          <span className={`text-body-m font-bold ${hobby ? "text-brand-plum" : "text-ink-400"}`}>
            {hobby || "Pick a hobby"}
          </span>
          <CaretRight size={18} weight="bold" className="ml-auto text-ink-400" aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Tag size={18} weight="bold" className="text-brand-plum" aria-hidden />
        <h2 className="text-title-m text-ink-900">Tools you used</h2>
        <button
          type="button"
          onClick={() => setToolSheetOpen(true)}
          className="ml-auto flex min-h-11 items-center gap-1 text-body-s font-bold text-brand-plum"
        >
          <Plus size={16} weight="bold" aria-hidden />
          Add tool
        </button>
      </div>
      {tools.length === 0 ? (
        <p className="rounded-card border-[1.5px] border-dashed border-line px-4 py-5 text-center text-body-s text-ink-400">
          Tag the gear behind your make. Mark anything you&apos;d swap as up for trade.
        </p>
      ) : (
        tools.map((tool) => <ToolRow key={tool.id} tool={tool} />)
      )}

      <p className="flex items-center gap-2 rounded-input bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
        {forTrade ? (
          <>
            <ArrowsLeftRight size={16} weight="bold" className="shrink-0" aria-hidden />
            Shows as up for trade, with a Propose a trade button.
          </>
        ) : (
          <>
            <Sparkle size={16} weight="bold" className="shrink-0" aria-hidden />
            Shows as inspiration. Mark a tool as up for trade to open it to offers.
          </>
        )}
      </p>

      <AddToolSheet open={toolSheetOpen} onClose={() => setToolSheetOpen(false)} onAdd={onAddTool} />

      <Sheet open={hobbySheetOpen} onClose={() => setHobbySheetOpen(false)} label="Pick a hobby">
        <div className="flex flex-col gap-3.5">
          <h2 className="font-display text-display-m text-brand-plum">Pick a hobby</h2>
          <div className="flex flex-wrap gap-2">
            {HOBBIES.map((item) => (
              <Chip
                key={item}
                selected={hobby === item}
                onClick={() => {
                  onHobbyChange(item);
                  setHobbySheetOpen(false);
                }}
              >
                {item}
              </Chip>
            ))}
          </div>
          <Button variant="ghost" fullWidth onClick={() => setHobbySheetOpen(false)}>
            Close
          </Button>
        </div>
      </Sheet>
    </>
  );
}
