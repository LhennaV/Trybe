"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

// Blocked users with Unblock (SAFE-02). Sample list until the blocks endpoint exists.
export default function BlockedUsers({ initial }: { initial: { handle: string; since: string }[] }) {
  const [blocked, setBlocked] = useState(initial);

  if (blocked.length === 0) {
    return <p className="py-8 text-center text-body-s text-ink-400">You haven&apos;t blocked anyone.</p>;
  }

  return (
    <ul className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-line bg-surface-white [&>*+*]:border-t [&>*+*]:border-line">
      {blocked.map((user) => (
        <li key={user.handle} className="flex items-center gap-3 px-3.5 py-2.5">
          <Avatar name={user.handle} size={36} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body-s font-bold text-ink-900">@{user.handle}</span>
            <span className="text-caption text-ink-400">Blocked {user.since}</span>
          </span>
          <Button
            variant="ghost"
            className="px-3.5 py-2"
            onClick={() => setBlocked((list) => list.filter((u) => u.handle !== user.handle))}
          >
            Unblock
          </Button>
        </li>
      ))}
    </ul>
  );
}
