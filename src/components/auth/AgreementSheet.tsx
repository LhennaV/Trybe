"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HandCoins, MapPin, ShieldCheck } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Sheet from "@/components/ui/Sheet";

// Minimum age is still an open decision (TRD section 21). 18 is a placeholder.
export const MIN_AGE = 18;

// The three things people most need to know before they trade. Keep these true
// to AGENTS.md: Trybe never holds money, and ratings don't guarantee safety.
const KEY_POINTS = [
  { icon: HandCoins, text: "Trades happen in person. Any cash is paid at the meetup, never through Trybe." },
  { icon: MapPin, text: "Only your city is shown. Meet in a public place, and bring a friend if you like." },
  { icon: ShieldCheck, text: "Ratings and badges help you decide, but they can't guarantee a trade." },
];

const LINK = "font-bold text-brand-plum underline underline-offset-2";

type AgreementSheetProps = {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onAgree: () => void;
};

// Shown once, when a new person taps Create account: the short version of
// the rules, then they confirm their age and that they've read the Terms,
// Privacy notice, and Community guidelines (AUTH-03, AUTH-04). The links open
// in a new tab so the form keeps what they typed.
export default function AgreementSheet({ open, pending, onClose, onAgree }: AgreementSheetProps) {
  const [checked, setChecked] = useState({ age: false, terms: false, privacy: false });
  const allChecked = checked.age && checked.terms && checked.privacy;

  return (
    <Sheet open={open} onClose={onClose} label="Before you join">
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex items-center gap-3.5">
          <Image src="/brand/storm-icon.png" alt="" width={56} height={55} />
          <div className="flex flex-col gap-0.5">
            <h2 className="font-display text-display-m text-brand-plum">One last thing</h2>
            <p className="text-body-s text-ink-600">The quick version of how Trybe works.</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2.5 rounded-card bg-brand-cream p-4">
          {KEY_POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-body-s text-ink-900">
              <Icon size={20} weight="bold" aria-hidden className="mt-px shrink-0 text-brand-plum" />
              {text}
            </li>
          ))}
        </ul>

        <fieldset className="flex flex-col">
          <legend className="sr-only">Agreements</legend>
          <Checkbox
            checked={checked.age}
            onChange={(event) => setChecked((c) => ({ ...c, age: event.target.checked }))}
            label={`I'm ${MIN_AGE} or older`}
          />
          <Checkbox
            checked={checked.terms}
            onChange={(event) => setChecked((c) => ({ ...c, terms: event.target.checked }))}
            label={
              <>
                I have read and agree to the{" "}
                <Link href="/terms" target="_blank" className={LINK}>
                  Terms of use
                </Link>
              </>
            }
          />
          <Checkbox
            checked={checked.privacy}
            onChange={(event) => setChecked((c) => ({ ...c, privacy: event.target.checked }))}
            label={
              <>
                I have read the{" "}
                <Link href="/privacy" target="_blank" className={LINK}>
                  Privacy notice
                </Link>{" "}
                and{" "}
                <Link href="/guidelines" target="_blank" className={LINK}>
                  Community guidelines
                </Link>
              </>
            }
          />
        </fieldset>

        <div className="flex flex-col gap-2">
          <Button fullWidth disabled={!allChecked || pending} onClick={onAgree}>
            {pending ? "Creating account…" : "Agree and create account"}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose} disabled={pending}>
            Not now
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
