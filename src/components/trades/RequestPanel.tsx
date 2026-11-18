"use client";

import Link from "next/link";
import { Flag, ShieldCheck, Warning } from "@phosphor-icons/react";
import LevelBadge from "@/components/badges/LevelBadge";
import { reportHref } from "@/components/safety/reportHref";
import Avatar from "@/components/ui/Avatar";
import Button, { buttonClassName } from "@/components/ui/Button";
import type { MessageRequest } from "./sampleTrades";

// Desktop: the open message request on the right of the Trades screen
// (CHAT-02, CHAT-03). Phones act on the request card itself.
export default function RequestPanel({
  request,
  accepted,
  onAccept,
  onDecline,
}: {
  request: MessageRequest;
  accepted: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <section
      aria-label={`Message request from @${request.handle}`}
      className="flex min-h-[520px] flex-col rounded-card border-[1.5px] border-line bg-surface-white"
    >
      <header className="flex items-center gap-3 border-b border-line px-5 py-4">
        <Avatar name={request.handle} size={44} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/users/${request.handle}`} className="text-title-m text-ink-900">
              @{request.handle}
            </Link>
            <LevelBadge completedTrades={request.tradeCount} />
          </div>
          <p className="text-caption text-ink-600">
            {request.joined} · {request.tradeCount} trades
          </p>
        </div>
        <Link href={`/users/${request.handle}`} className={buttonClassName({ variant: "ghost", className: "px-3.5 py-2 text-body-s" })}>
          View profile
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-5 py-5">
        <div className="flex max-w-[480px] flex-col gap-1 rounded-card bg-brand-cream px-4 py-3">
          <p className="text-body-m text-ink-900">{request.preview}</p>
          <p className="text-caption text-ink-400">{request.age} ago</p>
        </div>

        {request.asksForContact && (
          <p className="flex max-w-[480px] items-start gap-2 rounded-xl bg-status-warning-soft px-3 py-2.5 text-caption text-ink-900">
            <Warning size={16} weight="bold" className="mt-px shrink-0 text-status-warning" aria-hidden />
            This message asks for contact info. Keeping chats on Trybe keeps your trade history in one place.
          </p>
        )}

        <p className="mt-auto flex items-start gap-2 text-caption text-ink-600">
          <ShieldCheck size={16} weight="bold" className="shrink-0 text-status-success" aria-hidden />
          They won&apos;t know you&apos;ve read this until you accept. Keep the chat on Trybe and never send money ahead of
          the meetup.
        </p>
      </div>

      <footer className="flex items-center gap-2 border-t border-line px-5 py-4">
        {accepted ? (
          <p role="status" className="flex-1 text-body-s font-bold text-brand-plum">
            Chat accepted. It opens here once chats are connected to the API.
          </p>
        ) : (
          <>
            {/* "Accept chat" wording from CHAT-03. */}
            <Button className="flex-1" onClick={onAccept}>
              Accept chat
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onDecline}>
              Decline
            </Button>
          </>
        )}
        <Link
          href={reportHref("message", request.handle, "/trades")}
          className={buttonClassName({ variant: "ghost", className: "gap-1.5 px-3.5 text-status-danger" })}
        >
          <Flag size={18} weight="bold" aria-hidden />
          Report
        </Link>
      </footer>
    </section>
  );
}
