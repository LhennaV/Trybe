import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// 40px square icon button with a line border (back, bell, save, more).
// The ::before grows the hit area to 44px.
const iconButtonClassName =
  "relative flex size-10 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-line bg-surface-white text-ink-900 before:absolute before:-inset-0.5";

type IconButtonProps = {
  label: string;
  children: ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "children" | "className">)
  | ({ href?: undefined } & Omit<ComponentProps<"button">, "children" | "className">)
);

export default function IconButton({ label, children, className, ...props }: IconButtonProps) {
  const classes = [iconButtonClassName, className].filter(Boolean).join(" ");

  if (props.href !== undefined) {
    return (
      <Link aria-label={label} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ComponentProps<"button">;
  return (
    <button type={type} aria-label={label} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
