import Image from "next/image";
import NotificationBell from "@/components/notifications/NotificationBell";
import { BRAND, brandSize } from "@/shared/brand";

// Mobile header: Storm in the box, the TRYBE wordmark, and notifications.
// Hidden from lg up, where the sidebar shows the logo.
export default function FeedHeader() {
  return (
    <header className="flex items-center gap-2 lg:hidden">
      <Image {...BRAND.icon} {...brandSize(BRAND.icon, 39)} alt="" priority />
      <span className="font-display text-display-m text-brand-plum">TRYBE</span>
      <NotificationBell className="ml-auto" />
    </header>
  );
}
