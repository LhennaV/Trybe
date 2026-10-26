import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-plum text-surface-white shadow-button",
  secondary: "bg-brand-lavender-soft text-brand-plum",
  ghost: "bg-surface-white border-[1.5px] border-line text-ink-900",
  danger: "bg-status-danger text-surface-white shadow-button-danger",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-button px-[22px] py-3.5 text-body-m font-bold",
        "transition-transform duration-200 ease-out active:translate-y-[3px] active:shadow-none",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
