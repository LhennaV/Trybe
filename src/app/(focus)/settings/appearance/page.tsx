import type { Metadata } from "next";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = {
  title: "Appearance",
};

export default function AppearancePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Appearance" backHref="/settings" />
      <AppearanceSettings />
    </main>
  );
}
