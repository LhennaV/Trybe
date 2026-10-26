"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  // Read by screen readers when the sheet opens.
  label: string;
  children: ReactNode;
};

// Bottom sheet on mobile, centered modal from lg up. Built on <dialog>, which
// traps focus, closes on Escape, and returns focus to the opener for us.
export default function Sheet({ open, onClose, label, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      // Clicking the scrim (the dialog itself, outside the panel) closes it.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={[
        "m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto bg-surface-white text-ink-900 backdrop:bg-overlay-scrim/45",
        "rounded-t-sheet px-4 pt-2.5 pb-[max(30px,env(safe-area-inset-bottom))]",
        "lg:m-auto lg:w-[540px] lg:rounded-sheet lg:p-7 lg:shadow-modal",
        // Slide up on mobile, fade and scale from 98% on desktop. Opacity only with reduced motion.
        "transition-[translate,scale,opacity] duration-[250ms] ease-out",
        "starting:open:translate-y-full lg:starting:open:translate-y-0 lg:starting:open:scale-[0.98] lg:starting:open:opacity-0",
        "motion-reduce:starting:open:translate-y-0 motion-reduce:starting:open:scale-100 motion-reduce:starting:open:opacity-0",
      ].join(" ")}
    >
      <div className="flex justify-center pb-1.5 lg:hidden" aria-hidden>
        <span className="h-[5px] w-10 rounded-[3px] bg-line" />
      </div>
      {children}
    </dialog>
  );
}
