"use client";

import Image from "next/image";
import { useId } from "react";
import { Camera, Images, Sparkle, X } from "@phosphor-icons/react";
import { ACCEPTED_PHOTO_TYPES, MAX_POST_PHOTOS, type PickedPhoto } from "./photos";

type PhotoStepProps = {
  photos: PickedPhoto[];
  error: string;
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
};

// Step 1: pick up to 6 photos. The first one is the cover.
export default function PhotoStep({ photos, error, onAdd, onRemove }: PhotoStepProps) {
  const pickerId = useId();
  const cameraId = useId();
  const full = photos.length >= MAX_POST_PHOTOS;
  const cover = photos[0];

  const tile =
    "flex size-full flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-brand-plum bg-brand-lavender-soft text-caption text-brand-plum";

  return (
    <>
      <h1 className="font-display text-display-l text-brand-plum">What did you make?</h1>

      <div className="relative h-[268px] w-full overflow-hidden rounded-[20px] bg-brand-box-soft">
        {cover ? (
          <Image src={cover.url} alt="Cover photo preview" fill sizes="(min-width: 448px) 416px, 100vw" className="object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-brand-box-dark">
            <Camera size={36} weight="bold" className="opacity-40" aria-hidden />
            <p className="text-body-s font-bold">Your first photo becomes the cover</p>
          </div>
        )}
        {cover && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-chip bg-surface-white px-2.5 py-[5px] text-caption font-extrabold text-brand-plum">
            <Sparkle size={12} weight="bold" aria-hidden />
            Cover photo
          </span>
        )}
      </div>

      <div className="flex items-center">
        <h2 className="text-label-s uppercase text-ink-600">Your photos</h2>
        <p className="ml-auto text-caption text-brand-plum" aria-live="polite">
          {photos.length} of {MAX_POST_PHOTOS} picked
        </p>
      </div>

      {error && (
        <p role="alert" className="text-body-s text-status-danger">
          {error}
        </p>
      )}

      <ul className="grid grid-cols-3 gap-[11px]">
        {!full && (
          <>
            <li className="aspect-square">
              <label htmlFor={cameraId} className={`${tile} cursor-pointer`}>
                <Camera size={24} weight="bold" aria-hidden />
                Take photo
              </label>
              <input
                id={cameraId}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => {
                  onAdd(event.target.files);
                  event.target.value = "";
                }}
              />
            </li>
            <li className="aspect-square">
              <label htmlFor={pickerId} className={`${tile} cursor-pointer`}>
                <Images size={24} weight="bold" aria-hidden />
                Add photos
              </label>
              <input
                id={pickerId}
                type="file"
                accept={ACCEPTED_PHOTO_TYPES}
                multiple
                className="sr-only"
                onChange={(event) => {
                  onAdd(event.target.files);
                  event.target.value = "";
                }}
              />
            </li>
          </>
        )}

        {photos.map((photo, index) => (
          <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl border-[3px] border-brand-plum">
            <Image src={photo.url} alt={`Photo ${index + 1}`} fill sizes="120px" className="object-cover" />
            <span className="absolute top-1 left-1 flex size-6 items-center justify-center rounded-chip bg-brand-plum text-label-s font-extrabold text-surface-white">
              {index + 1}
            </span>
            <button
              type="button"
              aria-label={`Remove photo ${index + 1}`}
              onClick={() => onRemove(photo.id)}
              className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-chip bg-surface-white text-ink-900 before:absolute before:-inset-2.5"
            >
              <X size={14} weight="bold" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
