"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Trash } from "@phosphor-icons/react";
import { PHOTO_PICK_TYPES } from "@/shared/contracts/photos";
import Avatar from "@/components/ui/Avatar";
import Sheet from "@/components/ui/Sheet";
import SheetAction from "@/components/ui/SheetAction";
import { useMediaQuery } from "@/components/ui/useMediaQuery";
import PhotoCropper from "./PhotoCropper";
import { shrinkPhoto } from "./profileApi";
import type { ProfilePhoto } from "./useProfilePhoto";

// Profile photo on Edit profile (PROF-06). Tap the photo to take a new one,
// pick one from the library, or remove it. A picked photo is cropped first,
// shows right away, and is uploaded when the person taps Save.
export default function ProfilePhotoPicker({ name, photo }: { name: string; photo: ProfilePhoto }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  // Phones and tablets can open the camera; on a computer it's just a file picker.
  const hasCamera = useMediaQuery("(pointer: coarse)");

  function pick(input: HTMLInputElement | null) {
    setMenuOpen(false);
    input?.click();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setOpening(true);
    photo.setError("");
    const result = await shrinkPhoto(file);
    setOpening(false);
    if (result.ok) setCropSrc(URL.createObjectURL(result.blob));
    else photo.setError(result.message);
  }

  function closeCropper() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  const label = opening ? "Opening photo…" : photo.shownUrl ? "Change photo" : "Add a photo";

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        disabled={opening}
        aria-label={label}
        className={`relative rounded-chip ${opening ? "animate-shimmer" : ""}`}
      >
        <Avatar name={name} src={photo.shownUrl} size={96} />
        <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-chip border-[3px] border-brand-cream bg-brand-plum text-surface-white">
          <Camera size={16} weight="bold" aria-hidden />
        </span>
      </button>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        disabled={opening}
        className="flex min-h-11 items-center text-body-s font-bold text-brand-plum disabled:text-ink-600"
      >
        {label}
      </button>

      {photo.dirty && !photo.error && (
        <p role="status" className="text-center text-caption text-ink-600">
          Not saved yet. Tap Save to keep it.
        </p>
      )}
      {photo.error && (
        <p role="alert" className="text-center text-body-s font-bold text-status-danger">
          {photo.error}
        </p>
      )}

      {/* capture opens the front camera on phones. */}
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onFile(file);
        }}
      />
      <input
        ref={libraryInput}
        type="file"
        accept={PHOTO_PICK_TYPES}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onFile(file);
        }}
      />

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} label="Profile photo">
        <div className="flex flex-col gap-1 pt-2">
          <h2 className="px-1.5 pb-2 font-display text-display-m text-ink-900">Profile photo</h2>
          {hasCamera && (
            <SheetAction
              icon={<Camera size={20} weight="bold" />}
              title="Take a photo"
              onClick={() => pick(cameraInput.current)}
            />
          )}
          <SheetAction
            icon={<ImageIcon size={20} weight="bold" />}
            title={hasCamera ? "Choose from library" : "Upload a photo"}
            description="Up to 10 MB"
            onClick={() => pick(libraryInput.current)}
          />
          {photo.shownUrl && (
            <SheetAction
              icon={<Trash size={20} weight="bold" />}
              title="Remove photo"
              danger
              onClick={() => {
                photo.remove();
                setMenuOpen(false);
              }}
            />
          )}
        </div>
      </Sheet>

      <Sheet open={cropSrc !== null} onClose={closeCropper} label="Adjust your photo">
        {cropSrc && (
          <PhotoCropper
            src={cropSrc}
            onCancel={closeCropper}
            onConfirm={(blob) => {
              photo.choose(blob);
              closeCropper();
            }}
          />
        )}
      </Sheet>
    </div>
  );
}
