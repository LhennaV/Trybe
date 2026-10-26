"use client";

import { useState } from "react";
import { Bell, Heart, Sparkle } from "@phosphor-icons/react";
import Toggle from "@/components/ui/Toggle";
import { SettingsControlRow } from "./SettingsList";

// Notification preferences (NOTIF-03). Local only until the settings API exists.
export default function NotificationToggles() {
  const [trades, setTrades] = useState(true);
  const [matches, setMatches] = useState(true);
  const [likes, setLikes] = useState(false);

  return (
    <>
      <SettingsControlRow
        icon={<Bell size={18} weight="bold" aria-hidden />}
        label="Trade offers & updates"
        labelId="notify-trade-updates"
        control={<Toggle checked={trades} onCheckedChange={setTrades} aria-labelledby="notify-trade-updates" />}
      />
      <SettingsControlRow
        icon={<Sparkle size={18} weight="bold" aria-hidden />}
        label="Gear matches near me"
        labelId="notify-gear-matches"
        control={<Toggle checked={matches} onCheckedChange={setMatches} aria-labelledby="notify-gear-matches" />}
      />
      <SettingsControlRow
        icon={<Heart size={18} weight="bold" aria-hidden />}
        label="Likes on my posts"
        labelId="notify-likes"
        control={<Toggle checked={likes} onCheckedChange={setLikes} aria-labelledby="notify-likes" />}
      />
    </>
  );
}
