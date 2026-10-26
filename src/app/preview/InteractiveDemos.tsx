"use client";

import { useState } from "react";
import { Flag, Prohibit, User, X } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import SheetAction from "@/components/ui/SheetAction";
import Toggle from "@/components/ui/Toggle";

export function ToggleDemo() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span id="toggle-demo-1" className="text-body-m text-ink-900">
          Trade updates
        </span>
        <Toggle checked={on} onCheckedChange={setOn} aria-labelledby="toggle-demo-1" />
      </div>
      <div className="flex items-center justify-between">
        <span id="toggle-demo-2" className="text-body-m text-ink-900">
          Weekly digest
        </span>
        <Toggle checked={off} onCheckedChange={setOff} aria-labelledby="toggle-demo-2" />
      </div>
    </div>
  );
}

export function SheetDemo() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="ghost" fullWidth onClick={() => setOpen(true)}>
        Open the more menu
      </Button>
      <Sheet open={open} onClose={close} label="More options">
        <div className="flex flex-col gap-1.5">
          <SheetAction
            icon={<User size={20} weight="bold" />}
            title="View @kiln.and.co's profile"
            onClick={close}
          />
          <SheetAction
            icon={<X size={20} weight="bold" />}
            title="Cancel this trade"
            description={`Your AE-1 goes back to "up for trade". No rating hit.`}
            onClick={close}
          />
          <hr className="h-[1.5px] border-0 bg-line" />
          <SheetAction
            danger
            icon={<Prohibit size={20} weight="bold" />}
            title="Block @kiln.and.co"
            description="They can't message you or propose trades."
            onClick={close}
          />
          <SheetAction
            danger
            icon={<Flag size={20} weight="bold" />}
            title="Report @kiln.and.co"
            description="Scams, no-shows, fake items, harassment."
            onClick={close}
          />
          <Button variant="ghost" fullWidth className="mt-1.5" onClick={close}>
            Close
          </Button>
        </div>
      </Sheet>
    </>
  );
}
