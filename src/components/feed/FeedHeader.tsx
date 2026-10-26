import Image from "next/image";
import { Bell } from "@phosphor-icons/react/dist/ssr";
import IconButton from "@/components/ui/IconButton";

// Mobile header: Storm in the box, the TRYBE wordmark, and notifications.
export default function FeedHeader() {
  return (
    <header className="flex items-center gap-2">
      <Image src="/brand/storm-icon.png" alt="" width={40} height={39} priority />
      <span className="font-display text-display-m text-brand-plum">TRYBE</span>
      <IconButton label="Notifications" className="ml-auto">
        <Bell size={20} weight="bold" aria-hidden />
      </IconButton>
    </header>
  );
}
