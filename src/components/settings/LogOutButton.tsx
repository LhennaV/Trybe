"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignOut } from "@phosphor-icons/react";
import { logOut } from "@/components/auth/authApi";
import { resetMe } from "@/components/profile/useMe";

type LogOutButtonProps = {
  className: string;
  iconSize?: number;
  // "menuitem" when it sits inside a menu.
  role?: string;
};

// Logs out this device (AUTH-06), forgets the account on screen, and goes to
// the log in page. Styling comes from where it's placed.
export default function LogOutButton({ className, iconSize = 18, role }: LogOutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setPending(true);
    setError("");
    const result = await logOut();
    if (!result.ok) {
      setPending(false);
      setError(result.message);
      return;
    }
    resetMe();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <button type="button" role={role} onClick={() => void handleClick()} disabled={pending} className={className}>
        <SignOut size={iconSize} weight="bold" aria-hidden />
        {pending ? "Logging out…" : "Log out"}
      </button>
      {error && (
        <p role="alert" className="px-3 text-center text-caption font-bold text-status-danger">
          {error}
        </p>
      )}
    </>
  );
}
