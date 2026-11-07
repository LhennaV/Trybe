"use client";

import { useEffect, useRef } from "react";

// The hidden layer: a lavender wall of gear people have lying around.
// Illustrations are hand-made and safe to ship (see DESIGN.md › Images).
const ILLUSTRATIONS = ["/illustrations/camera-angled.svg", "/illustrations/pottery-top.svg"];
const BRUSH_RADIUS = 130; // CSS px
const DECAY = 0.016; // How much of the trail fades each frame while moving
const FADE_FRAMES = 120; // Frames after the pointer stops before a hard clear
const TILE = 170; // Spacing between illustrations, CSS px
const ART = 110; // Illustration size, CSS px

type Point = { x: number; y: number };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// Full-bleed canvas behind the hero. Moving a mouse paints a soft brush trail
// that shows the hidden layer, and the trail fades out when the pointer stops.
// Off for touch screens and reduced motion: they just see the plain background.
export default function CursorReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cover = document.createElement("canvas");
    const brush = document.createElement("canvas");
    const coverCtx = cover.getContext("2d");
    const brushCtx = brush.getContext("2d");
    if (!coverCtx || !brushCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const radius = BRUSH_RADIUS * dpr;
    const diameter = Math.ceil(radius * 2);
    const center = diameter / 2;
    brush.width = diameter;
    brush.height = diameter;

    // Soft round brush: solid in the middle, feathered edge.
    const gradient = brushCtx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.55, "rgba(255,255,255,0.82)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    let images: HTMLImageElement[] = [];
    let points: Point[] = [];
    let last: Point | null = null;
    let idle = 0;
    let frame = 0;
    let cancelled = false;

    // Redrawn on resize and theme change so the background color follows the theme.
    const paintCover = () => {
      cover.width = canvas.width;
      cover.height = canvas.height;
      const background = getComputedStyle(document.documentElement).getPropertyValue("--brand-lavender-soft").trim();
      coverCtx.fillStyle = background;
      coverCtx.fillRect(0, 0, cover.width, cover.height);
      if (!images.length) return;

      const tile = TILE * dpr;
      const art = ART * dpr;
      let count = 0;
      for (let row = 0, y = tile / 2; y - art < cover.height; row++, y += tile) {
        for (let x = row % 2 ? tile : tile / 2; x - art < cover.width; x += tile) {
          const image = images[(count + row) % images.length];
          count++;
          coverCtx.save();
          coverCtx.translate(x, y);
          coverCtx.rotate(((count % 3) - 1) * 0.14);
          coverCtx.drawImage(image, -art / 2, -art / 2, art, art);
          coverCtx.restore();
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      paintCover();
    };

    const stamp = ({ x, y }: Point) => {
      brushCtx.globalCompositeOperation = "source-over";
      brushCtx.clearRect(0, 0, diameter, diameter);
      brushCtx.fillStyle = gradient;
      brushCtx.fillRect(0, 0, diameter, diameter);
      // Keep only the hidden layer's pixels under the brush.
      brushCtx.globalCompositeOperation = "source-in";
      brushCtx.drawImage(cover, x - center, y - center, diameter, diameter, 0, 0, diameter, diameter);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(brush, x - center, y - center);
    };

    // Runs only while there's a trail to draw or fade, then stops.
    const tick = () => {
      frame = 0;
      const drawing = points.length > 0;
      idle = drawing ? 0 : idle + 1;

      const fade = drawing ? DECAY : Math.min(DECAY + idle * 0.004, 0.5);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      if (drawing) {
        points.forEach(stamp);
        points = [];
      }
      if (idle >= FADE_FRAMES) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !images.length) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * dpr;
      const y = (event.clientY - rect.top) * dpr;
      if (x < -radius || y < -radius || x > canvas.width + radius || y > canvas.height + radius) {
        last = null;
        return;
      }

      // Fill in the gap since the last event so fast moves still leave a smooth trail.
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const steps = Math.min(Math.ceil(Math.hypot(dx, dy) / Math.max(radius * 0.3, 1)), 60);
        for (let i = 1; i <= steps; i++) {
          points.push({ x: last.x + (dx * i) / steps, y: last.y + (dy * i) / steps });
        }
      } else {
        points.push({ x, y });
      }
      last = { x, y };
      if (!frame) frame = requestAnimationFrame(tick);
    };

    resize();
    Promise.all(ILLUSTRATIONS.map(loadImage))
      .then((loaded) => {
        if (cancelled) return;
        images = loaded;
        paintCover();
      })
      .catch(() => {
        // No illustrations, no effect. The hero still works.
      });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(paintCover);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-contrast"] });
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    colorScheme.addEventListener("change", paintCover);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      colorScheme.removeEventListener("change", paintCover);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full" />;
}
