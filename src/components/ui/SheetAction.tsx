import type { ComponentProps, ReactNode } from "react";

type SheetActionProps = ComponentProps<"button"> & {
  icon: ReactNode;
  title: string;
  description?: string;
  danger?: boolean;
};

// One row in an action sheet (e.g. View profile, Block, Report).
export default function SheetAction({
  icon,
  title,
  description,
  danger = false,
  className,
  type = "button",
  ...props
}: SheetActionProps) {
  return (
    <button
      type={type}
      className={["flex w-full items-center gap-3.5 rounded-xl px-1.5 py-[11px] text-left", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span
        aria-hidden
        className={[
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          danger ? "bg-status-danger/12 text-status-danger" : "bg-brand-lavender-soft text-brand-plum",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className={`text-body-m font-bold ${danger ? "text-status-danger" : "text-ink-900"}`}>
          {title}
        </span>
        {description && <span className="text-caption text-ink-600">{description}</span>}
      </span>
    </button>
  );
}
