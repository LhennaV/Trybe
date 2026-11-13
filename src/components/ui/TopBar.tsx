import type { MouseEvent, ReactNode } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import IconButton from "./IconButton";

type TopBarProps = {
  title: string;
  backHref: string;
  // Optional action on the right, like Save.
  action?: ReactNode;
  // Runs before going back. Call event.preventDefault() to stay, for
  // example to ask about unsaved changes first.
  onBack?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

// Back button + screen title, used on settings-style screens.
export default function TopBar({ title, backHref, action, onBack }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <IconButton href={backHref} label="Back" onClick={onBack} data-topbar-back>
        <CaretLeft size={20} weight="bold" aria-hidden />
      </IconButton>
      <h1 data-topbar-title className="text-title-m text-ink-900">
        {title}
      </h1>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
