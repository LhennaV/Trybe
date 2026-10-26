"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag, Info, Warning } from "@phosphor-icons/react";
import LevelBadge from "@/components/badges/LevelBadge";
import { reportHref } from "@/components/safety/reportHref";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import TradeStatusPill from "./TradeStatusPill";
import { currentOffer, describeOffer, type Trade } from "./tradeModel";
import type { MessageRequest } from "./sampleTrades";

type Tab = "chats" | "requests";

function TabButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-[9px] py-2 text-body-s font-bold ${
        active ? "bg-surface-white text-brand-plum" : "text-ink-600"
      }`}
    >
      {label}
      <span
        className={`rounded-chip px-[7px] py-px text-caption font-extrabold text-surface-white ${
          active ? "bg-brand-plum" : "bg-ink-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const offer = currentOffer(trade);
  const waitingOnYou = trade.status === "pending" && offer?.madeBy === "them";

  return (
    <li>
      <Link
        href={`/trades/${trade.id}`}
        className={`flex items-center gap-3 rounded-card border-[1.5px] bg-surface-white px-3 py-2.5 ${
          waitingOnYou ? "border-brand-lavender" : "border-line"
        }`}
      >
        <Avatar name={trade.other.handle} size={40} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-body-s font-bold text-ink-900">@{trade.other.handle}</span>
            <span className="ml-auto shrink-0 text-caption text-ink-400">{trade.lastActivity}</span>
          </span>
          {offer && <span className="truncate text-caption text-ink-600">{describeOffer(offer)}</span>}
          {waitingOnYou && <span className="text-caption font-bold text-brand-plum">Your move</span>}
        </span>
        <TradeStatusPill status={trade.status} />
      </Link>
    </li>
  );
}

function RequestCard({ request }: { request: MessageRequest }) {
  return (
    <li
      className={`flex flex-col gap-2.5 rounded-card border-[1.5px] bg-surface-white px-3.5 py-3 ${
        request.asksForContact ? "border-status-warning" : "border-line"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={request.handle} size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/users/${request.handle}`} className="text-body-m font-bold text-ink-900">
              @{request.handle}
            </Link>
            <LevelBadge completedTrades={request.tradeCount} />
          </div>
          <p className="text-caption text-ink-600">
            {request.joined} · {request.tradeCount} trades · {request.age}
          </p>
        </div>
      </div>
      <p className="rounded-xl bg-brand-cream px-3 py-2.5 text-body-s text-ink-900">{request.preview}</p>
      {request.asksForContact && (
        <p className="flex items-start gap-1.5 rounded-[10px] bg-status-warning-soft px-2.5 py-2 text-caption text-ink-900">
          <Warning size={14} weight="bold" className="mt-px shrink-0 text-status-warning" aria-hidden />
          This message asks for contact info. Keeping chats on Trybe keeps your trade history in one place.
        </p>
      )}
      {/* "Accept chat" wording from CHAT-03. Nothing is sent until they're accepted. */}
      <div className="flex items-center gap-2">
        <Button className="flex-1 py-2.5">Accept chat</Button>
        <Button variant="ghost" className="flex-1 py-2.5">
          Decline
        </Button>
        <IconButton label={`Report @${request.handle}`} href={reportHref("message", request.handle, "/trades")}>
          <Flag size={20} weight="bold" aria-hidden />
        </IconButton>
      </div>
    </li>
  );
}

// Trades screen: active trade chats, plus message requests from people you
// haven't traded with (CHAT-02).
export default function TradesInbox({ trades, requests }: { trades: Trade[]; requests: MessageRequest[] }) {
  const [tab, setTab] = useState<Tab>("chats");

  return (
    <div className="flex flex-col gap-3.5">
      <div role="tablist" aria-label="Trades" className="flex gap-1 rounded-xl bg-line p-1">
        <TabButton active={tab === "chats"} label="Chats" count={trades.length} onClick={() => setTab("chats")} />
        <TabButton
          active={tab === "requests"}
          label="Requests"
          count={requests.length}
          onClick={() => setTab("requests")}
        />
      </div>

      {tab === "chats" ? (
        trades.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {trades.map((trade) => (
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-body-s text-ink-400">
            No trades yet. Find something you like and make an offer!
          </p>
        )
      ) : (
        <>
          <p className="flex items-start gap-2.5 rounded-input bg-brand-lavender-soft px-3 py-2.5 text-caption text-ink-900">
            <Info size={16} weight="bold" className="shrink-0 text-brand-plum" aria-hidden />
            First messages from people you haven&apos;t traded with wait here. They won&apos;t know you&apos;ve read them
            until you accept.
          </p>
          <ul className="flex flex-col gap-3.5">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
