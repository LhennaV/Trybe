"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowsLeftRight, Bell, Crosshair, LockSimple, Sparkle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";

// Suggestions only. People can type any city.
const CITY_SUGGESTIONS = ["Quezon City", "Manila", "Makati", "Pasig", "Taguig", "Mandaluyong", "Marikina", "Caloocan"];

function NotifyRow({
  id,
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-line px-3.5 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lavender-soft text-brand-plum">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span id={id} className="text-body-s font-bold text-ink-900">
          {title}
        </span>
        <span className="text-caption text-ink-600">{description}</span>
      </span>
      <Toggle checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={id} />
    </div>
  );
}

export default function AreaForm() {
  const router = useRouter();
  const [locationNotice, setLocationNotice] = useState(false);
  const [tradeUpdates, setTradeUpdates] = useState(true);
  const [gearMatches, setGearMatches] = useState(true);

  return (
    <form
      className="flex flex-1 flex-col gap-[18px]"
      onSubmit={(event) => {
        event.preventDefault();
        // Saved to the profile once the accounts API exists. City only, never coordinates (PROF-05).
        router.push("/");
      }}
    >
      <Input
        label="Your city"
        name="city"
        placeholder="e.g. Quezon City"
        autoComplete="address-level2"
        list="city-suggestions"
        required
      />
      <datalist id="city-suggestions">
        {CITY_SUGGESTIONS.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setLocationNotice(true)}
          className="flex min-h-11 items-center gap-1.5 self-start text-body-s font-bold text-brand-plum"
        >
          <Crosshair size={16} weight="bold" aria-hidden />
          Use my current location instead
        </button>
        {locationNotice && (
          <p role="status" className="text-caption text-ink-600">
            Finding your city automatically is coming soon. Type it in for now.
          </p>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-input bg-brand-lavender-soft px-3.5 py-3">
        <LockSimple size={18} weight="bold" className="shrink-0 text-brand-plum" aria-hidden />
        <div className="flex flex-col gap-0.5">
          <p className="text-body-s font-bold text-ink-900">Only your city is ever shown</p>
          <p className="text-caption text-ink-600">
            Nobody sees your street or exact spot. You pick where to meet for each trade.
          </p>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-line bg-surface-white">
        <p className="flex items-center gap-2.5 px-3.5 py-3 text-body-m font-bold text-ink-900">
          <Bell size={18} weight="bold" className="text-brand-plum" aria-hidden />
          Get notified about
        </p>
        <NotifyRow
          id="notify-trades"
          icon={<ArrowsLeftRight size={20} weight="bold" aria-hidden />}
          title="Trade offers & replies"
          description="So you don't miss a counter offer"
          checked={tradeUpdates}
          onCheckedChange={setTradeUpdates}
        />
        <NotifyRow
          id="notify-matches"
          icon={<Sparkle size={20} weight="bold" aria-hidden />}
          title="Gear matches near you"
          description="When someone in your city posts gear for a hobby you want to try"
          checked={gearMatches}
          onCheckedChange={setGearMatches}
        />
      </div>

      <div className="flex-1" />

      <Button type="submit" fullWidth>
        Finish setup
      </Button>
      <Link href="/" className="flex min-h-11 items-center justify-center text-body-s font-bold text-ink-600">
        Skip for now
      </Link>
    </form>
  );
}
