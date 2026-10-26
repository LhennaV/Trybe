"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Camera, LockSimple } from "@phosphor-icons/react";
import { MY_PROFILE } from "@/components/profile/sampleProfiles";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import TopBar from "@/components/ui/TopBar";
import { SettingsControlRow } from "./SettingsList";

const BIO_LIMIT = 150;

function HobbyList({ title, hobbies }: { title: string; hobbies: string[] }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center">
        <h2 className="text-label-s text-ink-600">{title}</h2>
        <Link href="/onboarding/hobbies" className="ml-auto text-body-s font-bold text-brand-plum">
          Edit
        </Link>
      </div>
      <ul className="flex flex-wrap gap-2">
        {hobbies.map((hobby) => (
          <li key={hobby} className="rounded-chip bg-brand-plum px-3.5 py-2 text-body-s font-bold text-surface-white">
            {hobby}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Edit profile (PROF-06). Nothing is saved yet; the photo only previews locally.
export default function EditProfileForm() {
  const profile = MY_PROFILE;
  const [bio, setBio] = useState("Crochet by night, learning pottery on weekends. Will trade yarn.");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showCity, setShowCity] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const photoInputId = useId();
  const bioId = useId();

  // Free the preview URL when it's replaced or the screen closes.
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("Saving isn't connected yet. It goes live once the profile API is ready.");
      }}
    >
      <TopBar
        title="Edit profile"
        backHref="/profile"
        action={
          <button type="submit" className="min-h-11 px-1 text-body-m font-bold text-brand-plum">
            Save
          </button>
        }
      />

      {notice && (
        <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          {notice}
        </p>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar name={profile.displayName} src={photoUrl} size={96} />
          <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-chip border-[3px] border-brand-cream bg-brand-plum text-surface-white">
            <Camera size={16} weight="bold" aria-hidden />
          </span>
        </div>
        <label htmlFor={photoInputId} className="flex min-h-11 cursor-pointer items-center text-body-s font-bold text-brand-plum">
          Change photo
        </label>
        <input
          id={photoInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPhotoUrl(URL.createObjectURL(file));
          }}
        />
      </div>

      <Input label="Display name" name="displayName" defaultValue={profile.displayName} autoComplete="nickname" required />
      <Input
        label="Handle"
        name="handle"
        defaultValue={profile.handle}
        autoComplete="username"
        autoCapitalize="none"
        required
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center">
          <label htmlFor={bioId} className="text-label-s text-ink-600">
            Bio
          </label>
          <span className="ml-auto text-caption text-ink-400" aria-live="polite">
            {bio.length} / {BIO_LIMIT}
          </span>
        </div>
        <textarea
          id={bioId}
          name="bio"
          rows={3}
          maxLength={BIO_LIMIT}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="resize-none rounded-input border-[1.5px] border-line bg-surface-white px-4 py-3 text-body-s text-ink-900 placeholder:text-ink-400"
          placeholder="What do you make? What are you curious about?"
        />
      </div>

      <Input label="City" name="city" defaultValue={profile.city} autoComplete="address-level2" required />
      <p className="flex items-start gap-1.5 text-caption text-ink-400">
        <LockSimple size={13} weight="bold" className="mt-px shrink-0" aria-hidden />
        Only your city shows on your profile. Your exact location is never public.
      </p>

      <HobbyList title="Hobbies I do" hobbies={profile.hobbies} />
      <HobbyList title="Hobbies I want to try" hobbies={["Pottery", "Bookbinding"]} />

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
    </form>
  );
}
