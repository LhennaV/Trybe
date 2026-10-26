"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, X } from "@phosphor-icons/react";
import type { ToolItem } from "@/components/posts/samplePostDetails";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { DESKTOP_QUERY, useMediaQuery } from "@/components/ui/useMediaQuery";
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
  const desktop = useMediaQuery(DESKTOP_QUERY);

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
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col lg:min-h-0 lg:max-w-[1144px] lg:px-6 lg:pt-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 1 && !desktop) {
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
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-[calc(76px+max(30px,env(safe-area-inset-bottom)))] lg:pb-2">
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
          <p className="ml-auto text-body-s font-bold text-ink-400 lg:hidden">Step {step} of 2</p>
        </div>

        {/* Mobile: one step at a time. Desktop: photos and details side by side. */}
        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-8">
          {(desktop || step === 1) && (
            <div className="flex flex-col gap-3.5">
              <PhotoStep photos={photos} error={photoError} onAdd={handleAddPhotos} onRemove={handleRemovePhoto} />
            </div>
          )}
          {(desktop || step === 2) && (
            <div className="flex flex-col gap-3.5">
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
            </div>
          )}
        </div>

        {notice && (
          <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
            {notice}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white lg:static lg:border-0 lg:bg-transparent">
        <div className="mx-auto max-w-md px-4 pt-3 pb-[max(30px,env(safe-area-inset-bottom))] lg:mr-4 lg:ml-auto lg:w-[420px] lg:max-w-none lg:px-0 lg:pb-8">
          <Button type="submit" fullWidth disabled={photos.length === 0}>
            {photos.length === 0
              ? "Add at least one photo"
              : step === 1 && !desktop
                ? "Next: add details"
                : "Share post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
