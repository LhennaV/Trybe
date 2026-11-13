"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { clampCrop, cropScale, cropToBlob, MAX_ZOOM, MIN_ZOOM, type Crop } from "./cropPhoto";

// The square the person sees, in px. Fits a 390px phone inside a sheet.
const VIEW = 264;
const KEY_STEP = 10;

type PhotoCropperProps = {
  // Object URL of the already shrunk photo.
  src: string;
  onCancel: () => void;
  onConfirm: (photo: Blob) => void;
};

// Move and zoom a photo inside a circle (PROF-06). Drag or use the arrow keys
// to move, the slider (or mouse wheel) to zoom.
export default function PhotoCropper({ src, onCancel, onConfirm }: PhotoCropperProps) {
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState<Crop>({ zoom: 1, x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const zoomId = useId();

  function update(next: Crop) {
    if (size) setCrop(clampCrop(next, size.width, size.height, VIEW));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerX: event.clientX, pointerY: event.clientY, x: crop.x, y: crop.y };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start) return;
    update({ ...crop, x: start.x + event.clientX - start.pointerX, y: start.y + event.clientY - start.pointerY });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    update({ ...crop, x: crop.x + move[0], y: crop.y + move[1] });
  }

  async function confirm() {
    if (!image.current || !size) return;
    setBusy(true);
    try {
      onConfirm(await cropToBlob(image.current, crop, VIEW));
    } finally {
      setBusy(false);
    }
  }

  const scale = size ? cropScale(size.width, size.height, VIEW, crop.zoom) : 0;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-display-m text-ink-900">Adjust your photo</h2>
        <p className="text-body-s text-ink-600">Drag to move it, slide to zoom. What&apos;s in the circle is what people see.</p>
      </div>

      <div
        role="group"
        tabIndex={0}
        aria-label="Photo position. Use the arrow keys to move it."
        className="relative mx-auto cursor-grab touch-none overflow-hidden rounded-card bg-brand-box-soft select-none active:cursor-grabbing"
        style={{ width: VIEW, height: VIEW }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onWheel={(event) => update({ ...crop, zoom: crop.zoom - event.deltaY * 0.002 })}
        onKeyDown={onKeyDown}
      >
        {/* A plain img: it's a local preview, and the canvas crop needs the element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={image}
          src={src}
          alt=""
          draggable={false}
          onLoad={(event) => {
            const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
            setSize({ width, height });
          }}
          className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
          style={
            size
              ? {
                  width: size.width * scale,
                  height: size.height * scale,
                  transform: `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px))`,
                }
              : { opacity: 0 }
          }
        />
        {/* Dims everything outside the circle. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-chip ring-2 ring-surface-white/80"
          style={{ boxShadow: "0 0 0 9999px color-mix(in srgb, var(--overlay-scrim) 45%, transparent)" }}
        />
      </div>

      <div className="flex items-center gap-3 text-ink-600">
        <MagnifyingGlassMinus size={20} weight="bold" aria-hidden />
        <label htmlFor={zoomId} className="sr-only">
          Zoom
        </label>
        <input
          id={zoomId}
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={crop.zoom}
          onChange={(event) => update({ ...crop, zoom: Number(event.target.value) })}
          className="h-11 flex-1 accent-brand-plum"
        />
        <MagnifyingGlassPlus size={20} weight="bold" aria-hidden />
      </div>

      <div className="flex flex-col gap-2.5">
        <Button fullWidth onClick={() => void confirm()} disabled={!size || busy}>
          Use this photo
        </Button>
        <Button fullWidth variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
