"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DotsThree, Flag, Prohibit, SpeakerSlash } from "@phosphor-icons/react";
import { reportHref } from "@/components/safety/reportHref";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Sheet from "@/components/ui/Sheet";
import SheetAction from "@/components/ui/SheetAction";

type Step = "menu" | "confirm-block";

// Report, mute, and block on someone else's profile (SAFE-01, SAFE-02, SAFE-03).
// Mute and block are local until the safety endpoints exist.
export default function ProfileSafetyMenu({ handle }: { handle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [status, setStatus] = useState("");
  const close = () => {
    setOpen(false);
    setStep("menu");
  };
  const report = () => router.push(reportHref("user", handle, `/users/${handle}`));

  return (
    <>
      <IconButton label={`Report @${handle}`} className="ml-auto text-status-danger" onClick={report}>
        <Flag size={20} weight="bold" aria-hidden />
      </IconButton>
      <IconButton label="More options" onClick={() => setOpen(true)}>
        <DotsThree size={20} weight="bold" aria-hidden />
      </IconButton>

      {status && (
        <p role="status" className="sr-only">
          {status}
        </p>
      )}

      <Sheet open={open} onClose={close} label={`Options for @${handle}`}>
        {step === "menu" ? (
          <div className="flex flex-col gap-1.5">
            <SheetAction
              icon={<SpeakerSlash size={20} weight="bold" />}
              title={`Mute @${handle}`}
              description="Hide their posts from your feed. They won't know."
              onClick={() => {
                setStatus(`@${handle} is muted.`);
                close();
              }}
            />
            <hr className="h-[1.5px] border-0 bg-line" />
            <SheetAction
              danger
              icon={<Prohibit size={20} weight="bold" />}
              title={`Block @${handle}`}
              description="They can't message you or propose trades."
              onClick={() => setStep("confirm-block")}
            />
            <SheetAction
              danger
              icon={<Flag size={20} weight="bold" />}
              title={`Report @${handle}`}
              description="Scams, no-shows, fake items, harassment."
              onClick={report}
            />
            <Button variant="ghost" fullWidth className="mt-1.5" onClick={close}>
              Close
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-display-m text-ink-900">Block @{handle}?</h2>
            <p className="text-body-s text-ink-600">
              They won&apos;t be able to message you, see your posts, or propose trades. Any open trades with them get
              cancelled. You can unblock them in Settings.
            </p>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                setStatus(`@${handle} is blocked.`);
                close();
                router.push("/");
              }}
            >
              Block
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setStep("menu")}>
              Never mind
            </Button>
          </div>
        )}
      </Sheet>
    </>
  );
}
