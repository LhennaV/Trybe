import { useId, type ComponentProps, type ReactNode } from "react";

type InputProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  // Plain-language help under the field. Hidden while an error shows.
  hint?: ReactNode;
  // Something inside the field on the right, like a show/hide button.
  trailing?: ReactNode;
  // Fixed text inside the field on the left, like "@" for usernames.
  prefix?: string;
};

export default function Input({ label, error, hint, trailing, prefix, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-label-s text-ink-600">
        {label}
      </label>
      <div
        className={[
          "flex h-13 items-center rounded-input border-[1.5px] bg-surface-white has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-brand-plum",
          error ? "border-status-danger" : "border-line",
        ].join(" ")}
      >
        {prefix && (
          <span aria-hidden className="pl-4 text-body-m font-bold text-ink-600">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            "h-full min-w-0 flex-1 rounded-input bg-transparent text-body-m text-ink-900 outline-none! placeholder:text-ink-400",
            prefix ? "pl-0.5" : "pl-4",
            trailing ? "pr-1" : "pr-4",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} className="text-body-s text-status-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-caption text-ink-600">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
