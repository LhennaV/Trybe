"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Input from "./Input";

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

// Password field with a small eye button to show what was typed. The icon is
// 20px; the button is 44px so it's easy to hit.
export default function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="mr-1 flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-400"
        >
          {visible ? <EyeSlash size={20} weight="bold" aria-hidden /> : <Eye size={20} weight="bold" aria-hidden />}
        </button>
      }
    />
  );
}
