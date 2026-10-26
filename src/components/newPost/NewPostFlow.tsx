"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, X } from "@phosphor-icons/react";
import type { ToolItem } from "@/components/posts/samplePostDetails";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import DetailsStep from "./DetailsStep";
import PhotoStep from "./PhotoStep";
import { addPhotos, type PickedPhoto } from "./photos";

// Two-step new post flow. Everything stays in the browser until the posts API
// exists; photos will be compressed and uploaded through it (TRD section 13).
export default function NewPostFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [hobby, setHobby] = useState("");
  const [notice, setNotice] = useState("");

  // Free all preview URLs when leaving the screen.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  function handleAddPhotos(files: FileList | null) {
    const result = addPhotos(photos, files);
    setPhotos(result.photos);
    setPhotoError(result.error);
  }

  function handleRemovePhoto(id: string) {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.url);
    setPhotos(photos.filter((p) => p.id !== id));
    setPhotoError("");
  }

  return (
    <form
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 1) {
          setStep(2);
          return;
        }
        if (!hobby) {
          setNotice("Pick a hobby so people browsing it can find your post.");
          return;
        }
        setNotice("Posting isn't connected yet. It goes live once the posts API is ready.");
      }}
    >
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-[calc(76px+max(30px,env(safe-area-inset-bottom)))]">
        <div className="flex items-center gap-3 py-2">
          {step === 1 ? (
            <IconButton href="/" label="Close">
              <X size={20} weight="bold" aria-hidden />
            </IconButton>
          ) : (
            <IconButton label="Back to photos" onClick={() => setStep(1)}>
              <CaretLeft size={20} weight="bold" aria-hidden />
            </IconButton>
          )}
          <p className="text-title-m text-ink-900">New post</p>
          <p className="ml-auto text-body-s font-bold text-ink-400">Step {step} of 2</p>
        </div>

        {step === 1 ? (
          <PhotoStep photos={photos} error={photoError} onAdd={handleAddPhotos} onRemove={handleRemovePhoto} />
        ) : (
          <DetailsStep
            photos={photos}
            onAddPhotos={handleAddPhotos}
            tools={tools}
            onAddTool={(tool) => setTools((list) => [...list, tool])}
            hobby={hobby}
            onHobbyChange={(value) => {
              setHobby(value);
              setNotice("");
            }}
          />
        )}

        {notice && (
          <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
            {notice}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white">
        <div className="mx-auto max-w-md px-4 pt-3 pb-[max(30px,env(safe-area-inset-bottom))]">
          <Button type="submit" fullWidth disabled={photos.length === 0}>
            {photos.length === 0 ? "Add at least one photo" : step === 1 ? "Next: add details" : "Share post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
