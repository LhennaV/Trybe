import type { ReactNode } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import IconButton from "./IconButton";

type TopBarProps = {
  title: string;
  backHref: string;
  // Optional action on the right, like Save.
  action?: ReactNode;
};

// Back button + screen title, used on settings-style screens.
export default function TopBar({ title, backHref, action }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <IconButton href={backHref} label="Back">
        <CaretLeft size={20} weight="bold" aria-hidden />
      </IconButton>
      <h1 className="text-title-m text-ink-900">{title}</h1>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
