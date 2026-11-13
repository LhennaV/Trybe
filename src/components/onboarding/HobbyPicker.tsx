"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import type { Hobby, HobbyLevel } from "@/shared/contracts/hobbies";
import { OTHER_HOBBY_NAME_MAX, otherHobbySchema, type Me, type OtherHobby } from "@/shared/contracts/users";
import { apiRequest } from "@/components/api/request";
import { setMe, useMe } from "@/components/profile/useMe";
import { updateMe } from "@/components/settings/profileApi";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";

// "Other" lets people name a hobby that isn't on the list yet. It's saved as
// a request only they see (otherHobbies), never on the public profile.
type OtherState = { open: boolean; text: string };

// Where "Continue" goes. From Edit profile's "Edit" links it goes back there.
const NEXT_ALLOWED = ["/onboarding/area", "/settings/profile"];

function nextHref() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && NEXT_ALLOWED.includes(next) ? next : "/onboarding/area";
}

function HobbyGroup({
  title,
  hint,
  level,
  hobbies,
  picks,
  onToggle,
  other,
  onOtherChange,
  otherError,
  otherPlaceholder,
}: {
  title: string;
  hint: string;
  level: HobbyLevel;
  hobbies: Hobby[];
  picks: Map<string, HobbyLevel>;
  onToggle: (hobbyId: string) => void;
  other: OtherState;
  onOtherChange: (other: OtherState) => void;
  otherError?: string;
  otherPlaceholder: string;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-title-m text-ink-900">{title}</span>
        <span className="text-caption text-ink-600">{hint}</span>
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {hobbies.map((hobby) => {
          const pickedHere = picks.get(hobby.id) === level;
          // Picked in the other group: still tappable (it moves here), but quieter.
          const pickedThere = picks.has(hobby.id) && !pickedHere;
          return (
            <Chip
              key={hobby.id}
              selected={pickedHere}
              onClick={() => onToggle(hobby.id)}
              className={pickedThere ? "border-dashed text-ink-400" : undefined}
            >
              {hobby.name}
            </Chip>
          );
        })}
        <Chip
          selected={other.open}
          aria-expanded={other.open}
          onClick={() => onOtherChange({ ...other, open: !other.open })}
          className="inline-flex items-center gap-1"
        >
          <Plus size={14} weight="bold" aria-hidden />
          Other
        </Chip>
      </div>
      {other.open && (
        <Input
          label="Which one?"
          placeholder={otherPlaceholder}
          value={other.text}
          maxLength={OTHER_HOBBY_NAME_MAX}
          autoFocus
          hint="Not on the list yet? We'll note it, and popular ones get added."
          error={otherError}
          onChange={(event) => onOtherChange({ ...other, text: event.target.value })}
        />
      )}
    </section>
  );
}

function PickerSkeleton() {
  const widths = [72, 96, 64, 110, 84, 70, 92, 60];
  return (
    <div role="status" aria-label="Loading hobbies" className="flex flex-col gap-6">
      {[0, 1].map((group) => (
        <div key={group} className="flex flex-col gap-2.5">
          <Skeleton className="h-5 w-40 rounded-chip" />
          <div className="flex flex-wrap gap-2">
            {widths.map((width, i) => (
              <Skeleton key={i} className="h-[34px] rounded-chip" style={{ width }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function otherFrom(me: Me, level: HobbyLevel): OtherState {
  const saved = me.otherHobbies.find((h) => h.level === level);
  return saved ? { open: true, text: saved.name } : { open: false, text: "" };
}

// Onboarding step 2 (PROF-01): hobbies you already do and want to try, from
// GET /api/hobbies, saved with PATCH /api/me. A hobby sits in one list only.
export default function HobbyPicker() {
  const router = useRouter();
  const meState = useMe();
  const [hobbies, setHobbies] = useState<Hobby[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [picks, setPicks] = useState<Map<string, HobbyLevel> | null>(null);
  const [haveOther, setHaveOther] = useState<OtherState>({ open: false, text: "" });
  const [tryOther, setTryOther] = useState<OtherState>({ open: false, text: "" });
  const [otherErrors, setOtherErrors] = useState<Partial<Record<HobbyLevel, string>>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void apiRequest<Hobby[]>("/api/hobbies").then((result) => {
      if (!active) return;
      if (result.ok) setHobbies(result.data);
      else setLoadError(result.message);
    });
    return () => {
      active = false;
    };
  }, []);

  // Start from what's already saved, once, so editing later keeps your picks.
  const meSettled = meState.status !== "loading";
  if (picks === null && meSettled) {
    const me = meState.status === "ready" ? meState.me : null;
    setPicks(new Map(me?.hobbies.map((h) => [h.id, h.level]) ?? []));
    if (me) {
      setHaveOther(otherFrom(me, "has"));
      setTryOther(otherFrom(me, "trying"));
    }
  }

  function toggle(hobbyId: string, level: HobbyLevel) {
    setError("");
    setPicks((current) => {
      const next = new Map(current);
      if (next.get(hobbyId) === level) next.delete(hobbyId);
      else next.set(hobbyId, level);
      return next;
    });
  }

  const others: OtherHobby[] = [
    { name: haveOther.text, level: "has" as const, open: haveOther.open },
    { name: tryOther.text, level: "trying" as const, open: tryOther.open },
  ]
    .filter((other) => other.open && other.name.trim())
    .map(({ name, level }) => ({ name: name.trim(), level }));
  const picked = (picks?.size ?? 0) + others.length;

  async function save() {
    if (!picks || saving) return;

    // Check the typed hobbies here first, so the error sits under the right field.
    const errors: Partial<Record<HobbyLevel, string>> = {};
    for (const other of others) {
      const parsed = otherHobbySchema.safeParse(other);
      if (!parsed.success) errors[other.level] = parsed.error.issues[0]?.message;
    }
    setOtherErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError("");
    const result = await updateMe({
      hobbies: Array.from(picks, ([hobbyId, level]) => ({ hobbyId, level })),
      otherHobbies: others,
    });
    if (!result.ok) {
      setSaving(false);
      setError(result.message);
      return;
    }
    setMe(result.data);
    router.push(nextHref());
  }

  if (loadError) {
    return (
      <p role="alert" className="rounded-xl bg-status-danger/12 px-3.5 py-3 text-body-s font-bold text-status-danger">
        {loadError}
      </p>
    );
  }

  if (!hobbies || !picks) return <PickerSkeleton />;

  const signedOut = meState.status === "signed-out";

  return (
    <>
      <HobbyGroup
        title="I already do"
        hint="gear I might trade away"
        level="has"
        hobbies={hobbies}
        picks={picks}
        onToggle={(id) => toggle(id, "has")}
        other={haveOther}
        onOtherChange={setHaveOther}
        otherError={otherErrors.has}
        otherPlaceholder="e.g. Knitting"
      />
      <HobbyGroup
        title="I want to try"
        hint="gear I'm looking for"
        level="trying"
        hobbies={hobbies}
        picks={picks}
        onToggle={(id) => toggle(id, "trying")}
        other={tryOther}
        onOtherChange={setTryOther}
        otherError={otherErrors.trying}
        otherPlaceholder="e.g. Leathercraft"
      />

      <div className="flex-1" />

      {signedOut && (
        <p role="alert" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          Log in first so we can save your picks.{" "}
          <Link href="/login" className="font-bold underline underline-offset-2">
            Log in
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-status-danger/12 px-3.5 py-3 text-body-s font-bold text-status-danger">
          {error}
        </p>
      )}
      <Button fullWidth disabled={picked === 0 || saving || signedOut} onClick={() => void save()}>
        {saving ? "Saving…" : picked === 0 ? "Pick at least one" : `Continue · ${picked} picked`}
      </Button>
    </>
  );
}
