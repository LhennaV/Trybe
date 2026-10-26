import { useId, type ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-label-s text-ink-600">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          "h-13 rounded-input border-[1.5px] bg-surface-white px-4 text-body-m text-ink-900 placeholder:text-ink-400",
          error ? "border-status-danger" : "border-line",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-body-s text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
}
