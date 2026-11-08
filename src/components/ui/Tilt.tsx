"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

type TiltProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  // Most it leans, in degrees. Use less on big cards so they don't swing too far.
  max?: number;
};

// From Lhenna's portfolio (after React Bits' "Tilted Card"): the card leans
// toward the mouse in 3D with a soft shine following it, then springs back.
// Mouse and trackpad only; touch and reduced motion get a still card.
// The CSS lives in globals.css under "Card motion".
export default function Tilt({ children, className = "", style, max = 8 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(event: PointerEvent) {
    const element = ref.current;
    if (!element || event.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--rx", `${(0.5 - y) * max * 2}deg`);
    element.style.setProperty("--ry", `${(x - 0.5) * max * 2}deg`);
    element.style.setProperty("--mx", `${x * 100}%`);
    element.style.setProperty("--my", `${y * 100}%`);
    element.dataset.tilting = "true";
  }

  function onLeave() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
    delete element.dataset.tilting;
  }

  return (
    <div className="tilt-wrap">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={style}
        className={`tilt relative ${className}`}
      >
        {children}
        <span aria-hidden className="tilt-shine" />
      </div>
    </div>
  );
}
