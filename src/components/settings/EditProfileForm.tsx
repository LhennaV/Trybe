"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { LockSimple } from "@phosphor-icons/react";
import { BIO_MAX, updateMeSchema, type Me, type UpdateMe } from "@/shared/contracts/users";
import { firstFieldErrors, zodFieldErrors } from "@/components/api/request";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Sheet from "@/components/ui/Sheet";
import Skeleton from "@/components/ui/Skeleton";
import Toggle from "@/components/ui/Toggle";
import TopBar from "@/components/ui/TopBar";
import ProfilePhotoPicker from "./ProfilePhotoPicker";
import { setMe, useMe } from "@/components/profile/useMe";
import { updateMe } from "./profileApi";
import { SettingsControlRow } from "./SettingsList";
import { useProfilePhoto } from "./useProfilePhoto";

type Values = { displayName: string; handle: string; bio: string; city: string };
type Notice = { tone: "success" | "error"; text: string } | null;

function valuesFrom(me: Me): Values {
  return { displayName: me.displayName, handle: me.handle, bio: me.bio ?? "", city: me.city ?? "" };
}

// Only what changed. A blank city that was never set stays unset.
function changedFields(me: Me, values: Values): UpdateMe {
  const saved = valuesFrom(me);
  const changes: UpdateMe = {};
  if (values.displayName !== saved.displayName) changes.displayName = values.displayName;
  if (values.handle !== saved.handle) changes.handle = values.handle;
  if (values.bio !== saved.bio) changes.bio = values.bio;
  if (values.city !== saved.city && !(values.city.trim() === "" && me.city === null)) changes.city = values.city;
  return changes;
}

function HobbyList({ title, hobbies }: { title: string; hobbies: string[] }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center">
        <h2 className="text-label-s text-ink-600">{title}</h2>
        <Link href="/onboarding/hobbies" className="ml-auto flex min-h-11 items-center text-body-s font-bold text-brand-plum">
          Edit
        </Link>
      </div>
      {hobbies.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {hobbies.map((hobby) => (
            <li key={hobby} className="rounded-chip bg-brand-plum px-3.5 py-2 text-body-s font-bold text-surface-white">
              {hobby}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-s text-ink-600">None yet. Tap Edit to add some.</p>
      )}
    </section>
  );
}

function EditProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading your profile" className="flex flex-col gap-3.5">
      <div className="flex flex-col items-center gap-3 py-1">
        <Skeleton className="size-24 rounded-chip" />
        <Skeleton className="h-4 w-24 rounded-chip" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20 rounded-chip" />
          <Skeleton className="h-[52px] w-full rounded-input" />
        </div>
      ))}
    </div>
  );
}

// Edit profile (PROF-06). Loads GET /api/me. Save sends only what changed to
// PATCH /api/me, then the photo change (if any) to /api/me/photo.
export default function EditProfileForm() {
  const router = useRouter();
  const meState = useMe();
  const me = meState.status === "ready" ? meState.me : null;
  const [values, setValues] = useState<Values | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  // Not in the API yet, so these only change on this screen for now.
  const [showCity, setShowCity] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const photo = useProfilePhoto(me?.photoUrl ?? null);
  const bioId = useId();

  // Fill the fields once, when the profile first arrives.
  if (me && !values) setValues(valuesFrom(me));

  const changes = me && values ? changedFields(me, values) : {};
  const dirty = Object.keys(changes).length > 0 || photo.dirty;
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Closing the tab or refreshing with unsaved changes asks first too.
  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => (v ? { ...v, [key]: value } : v));
    setNotice(null);
    if (fieldErrors[key]) {
      setFieldErrors((errors) => {
        const next = { ...errors };
        delete next[key];
        return next;
      });
    }
  }

  async function save() {
    if (!me || !values || saving || !dirty) return;

    const parsed = updateMeSchema.safeParse(changes);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      setNotice({ tone: "error", text: "Check the fields in red." });
      return;
    }

    const hasFields = Object.keys(parsed.data).length > 0;

    setSaving(true);
    setFieldErrors({});
    setNotice(null);
    let latest = me;

    if (hasFields) {
      const result = await updateMe(parsed.data);
      if (!result.ok) {
        setSaving(false);
        setFieldErrors(firstFieldErrors(result.fields));
        window.scrollTo({ top: 0, behavior: "smooth" });
        setNotice({ tone: "error", text: result.message });
        return;
      }
      latest = result.data;
      setMe(latest);
    }

    let photoFailed = false;
    if (photo.dirty) {
      const result = await photo.save();
      if (result) latest = result;
      else photoFailed = true;
    }

    setMe(latest);
    setValues(valuesFrom(latest));

    if (photoFailed) {
      setSaving(false);
      setNotice({
        tone: "error",
        text: hasFields ? "Your details saved, but the photo didn't. Try it again." : "The photo didn't save. Try it again.",
      });
      return;
    }
    // Back to the profile, which already shows the changes.
    router.push("/profile");
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <TopBar
        title="Edit profile"
        backHref="/profile"
        onBack={(event) => {
          if (!dirty || saving) return;
          event.preventDefault();
          setConfirmLeave(true);
        }}
        action={
          <button
            type="submit"
            disabled={!dirty || saving}
            className="min-h-11 px-1 text-body-m font-bold text-brand-plum disabled:text-ink-400"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        }
      />

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`rounded-xl px-3.5 py-3 text-body-s font-bold ${
            notice.tone === "error" ? "bg-status-danger/12 text-status-danger" : "bg-status-success-soft text-status-success"
          }`}
        >
          {notice.text}
        </p>
      )}

      {meState.status === "signed-out" || meState.status === "error" ? (
        <p role="alert" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          {meState.status === "error" ? meState.message : "Log in to edit your profile."}{" "}
          <Link href="/login" className="font-bold underline underline-offset-2">
            Log in
          </Link>
        </p>
      ) : !me || !values ? (
        <EditProfileSkeleton />
      ) : (
        <>
          <ProfilePhotoPicker name={values.displayName || me.displayName} photo={photo} />

          <Input
            label="Display name"
            name="displayName"
            autoComplete="nickname"
            value={values.displayName}
            onChange={(event) => update("displayName", event.target.value)}
            error={fieldErrors.displayName}
          />
          <Input
            label="Handle"
            name="handle"
            autoComplete="username"
            autoCapitalize="none"
            prefix="@"
            value={values.handle}
            onChange={(event) => update("handle", event.target.value)}
            error={fieldErrors.handle}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center">
              <label htmlFor={bioId} className="text-label-s text-ink-600">
                Bio
              </label>
              <span className="ml-auto text-caption text-ink-400" aria-live="polite">
                {values.bio.length} / {BIO_MAX}
              </span>
            </div>
            <textarea
              id={bioId}
              name="bio"
              rows={3}
              maxLength={BIO_MAX}
              value={values.bio}
              onChange={(event) => update("bio", event.target.value)}
              aria-invalid={fieldErrors.bio ? true : undefined}
              className="resize-none rounded-input border-[1.5px] border-line bg-surface-white px-4 py-3 text-body-s text-ink-900 placeholder:text-ink-400"
              placeholder="What do you make? What are you curious about?"
            />
            {fieldErrors.bio && <p className="text-caption font-bold text-status-danger">{fieldErrors.bio}</p>}
          </div>

          <Input
            label="City"
            name="city"
            autoComplete="address-level2"
            placeholder="e.g. Quezon City"
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
            error={fieldErrors.city}
          />
          <p className="flex items-start gap-1.5 text-caption text-ink-400">
            <LockSimple size={13} weight="bold" className="mt-px shrink-0" aria-hidden />
            Only your city shows on your profile. Your exact location is never public.
          </p>

          <HobbyList title="Hobbies I do" hobbies={me.hobbies.filter((h) => h.level === "has").map((h) => h.name)} />
          <HobbyList
            title="Hobbies I want to try"
            hobbies={me.hobbies.filter((h) => h.level === "trying").map((h) => h.name)}
          />

          <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-line bg-surface-white [&>*+*]:border-t [&>*+*]:border-line">
            <SettingsControlRow
              label="Show my city on my profile"
              labelId="show-city"
              control={<Toggle checked={showCity} onCheckedChange={setShowCity} aria-labelledby="show-city" />}
            />
            <SettingsControlRow
              label="Show my trade history"
              labelId="show-history"
              control={<Toggle checked={showHistory} onCheckedChange={setShowHistory} aria-labelledby="show-history" />}
            />
            <SettingsControlRow
              label="Show items I've saved"
              labelId="show-saved"
              control={<Toggle checked={showSaved} onCheckedChange={setShowSaved} aria-labelledby="show-saved" />}
            />
          </div>
        </>
      )}

      <Sheet open={confirmLeave} onClose={() => setConfirmLeave(false)} label="Leave without saving?">
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-display-m text-ink-900">Leave without saving?</h2>
            <p className="text-body-s text-ink-600">Your changes to your profile won&apos;t be kept.</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Button fullWidth onClick={() => setConfirmLeave(false)}>
              Keep editing
            </Button>
            <Button fullWidth variant="ghost" onClick={() => router.push("/profile")}>
              Discard changes
            </Button>
          </div>
        </div>
      </Sheet>
    </form>
  );
}
