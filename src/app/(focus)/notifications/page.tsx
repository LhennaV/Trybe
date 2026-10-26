import type { Metadata } from "next";
import NotificationList from "@/components/notifications/NotificationList";
import { SAMPLE_NOTIFICATIONS } from "@/components/notifications/sampleNotifications";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false },
};

export default function NotificationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-2 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <NotificationList notifications={SAMPLE_NOTIFICATIONS} />
    </main>
  );
}
