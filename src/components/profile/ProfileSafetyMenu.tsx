"use client";

import { useState } from "react";
import { DotsThree, Flag, Prohibit } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Sheet from "@/components/ui/Sheet";
import SheetAction from "@/components/ui/SheetAction";

// Report and block on someone else's profile (SAFE-01, SAFE-02). The flag and
// the "more" button both open the same sheet. Actions don't submit yet.
export default function ProfileSafetyMenu({ handle }: { handle: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <IconButton label={`Report @${handle}`} className="ml-auto text-status-danger" onClick={() => setOpen(true)}>
        <Flag size={20} weight="bold" aria-hidden />
      </IconButton>
      <IconButton label="More options" onClick={() => setOpen(true)}>
        <DotsThree size={20} weight="bold" aria-hidden />
      </IconButton>

      <Sheet open={open} onClose={close} label={`Options for @${handle}`}>
        <div className="flex flex-col gap-1.5">
          <SheetAction
            danger
            icon={<Prohibit size={20} weight="bold" />}
            title={`Block @${handle}`}
            description="They can't message you or propose trades."
            onClick={close}
          />
          <SheetAction
            danger
            icon={<Flag size={20} weight="bold" />}
            title={`Report @${handle}`}
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
