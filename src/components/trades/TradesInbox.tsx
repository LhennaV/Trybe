"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChatCircle, Flag, Info, Warning } from "@phosphor-icons/react";
import LevelBadge from "@/components/badges/LevelBadge";
import { reportHref } from "@/components/safety/reportHref";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import RequestPanel from "./RequestPanel";
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

function TradeRow({ trade, active }: { trade: Trade; active: boolean }) {
  const offer = currentOffer(trade);
  const waitingOnYou = trade.status === "pending" && offer?.madeBy === "them";

  return (
    <li>
      <Link
        href={`/trades/${trade.id}`}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-card border-[1.5px] px-3 py-2.5 ${
          active
            ? "border-brand-lavender-soft bg-brand-lavender-soft"
            : waitingOnYou
              ? "border-brand-lavender bg-surface-white"
              : "border-line bg-surface-white"
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

type RequestCardProps = {
  request: MessageRequest;
  accepted: boolean;
  onAccept: () => void;
  onDecline: () => void;
  // Desktop only: opens the request in the panel on the right.
  selected?: boolean;
  onSelect?: () => void;
};

function RequestCard({ request, accepted, onAccept, onDecline, selected = false, onSelect }: RequestCardProps) {
  return (
    <li
      className={`relative flex flex-col gap-2.5 rounded-card border-[1.5px] px-3.5 py-3 ${
        selected
          ? "border-brand-plum bg-brand-lavender-soft"
          : request.asksForContact
            ? "border-status-warning bg-surface-white"
            : "border-line bg-surface-white"
      }`}
    >
      {onSelect && (
        // Covers the whole card on desktop; the links and buttons below sit above it.
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={`Open the request from @${request.handle}`}
          className="absolute inset-0 hidden rounded-card lg:block"
        />
      )}
      <div className="flex items-center gap-2.5">
        <Avatar name={request.handle} size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/users/${request.handle}`} className="relative text-body-m font-bold text-ink-900">
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
      <div className="relative flex items-center gap-2">
        {accepted ? (
          <p role="status" className="flex-1 text-body-s font-bold text-brand-plum">
            Chat accepted. It opens once chats are connected.
          </p>
        ) : (
          <>
            <Button className="flex-1 py-2.5" onClick={onAccept}>
              Accept chat
            </Button>
            <Button variant="ghost" className="flex-1 py-2.5" onClick={onDecline}>
              Decline
            </Button>
          </>
        )}
        <IconButton label={`Report @${request.handle}`} href={reportHref("message", request.handle, "/trades")}>
          <Flag size={20} weight="bold" aria-hidden />
        </IconButton>
      </div>
    </li>
  );
}

// Trades screen: active trade chats, plus message requests from people you
// haven't traded with (CHAT-02). Accept and decline stay on this screen until
// the chat endpoints exist.
export default function TradesInbox({
  trades,
  requests,
  activeTradeId,
  heading,
  withPanel = false,
}: {
  trades: Trade[];
  requests: MessageRequest[];
  // Highlights the open chat in the desktop list panel.
  activeTradeId?: string;
  // Shown above the tabs (the "Trades" title on the Trades screen).
  heading?: ReactNode;
  // Desktop: lays out the list with a panel on the right that shows the
  // picked request. Off inside a trade chat, where the chat is the panel.
  withPanel?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("chats");
  const [requestList, setRequestList] = useState(requests);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = requestList.find((request) => request.id === selectedId);

  const accept = (id: string) => setAcceptedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  const decline = (id: string) => {
    setRequestList((list) => list.filter((request) => request.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  };

  const list = (
    <div className="flex flex-col gap-3.5">
      {heading}
      <InboxTabs
        tab={tab}
        setTab={setTab}
        trades={trades}
        activeTradeId={activeTradeId}
        requests={requestList}
        acceptedIds={acceptedIds}
        selectedId={withPanel ? selectedId : null}
        onSelect={withPanel ? setSelectedId : undefined}
        onAccept={accept}
        onDecline={decline}
      />
    </div>
  );

  if (!withPanel) return list;

  return (
    <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
      {list}
      <div className="hidden lg:block">
        {tab === "requests" && selected ? (
          <RequestPanel
            request={selected}
            accepted={acceptedIds.includes(selected.id)}
            onAccept={() => accept(selected.id)}
            onDecline={() => decline(selected.id)}
          />
        ) : (
          <div className="flex min-h-[520px] flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed border-line text-center">
            <ChatCircle size={36} weight="bold" className="text-brand-lavender" aria-hidden />
            <p className="text-body-m font-bold text-ink-900">
              {tab === "requests" ? "Pick a request to read it" : "Pick a trade to open the chat"}
            </p>
            <p className="text-body-s text-ink-600">
              {tab === "requests"
                ? "Accept to start chatting, or decline and they won't be told."
                : "Offers, counters, and messages all live there."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InboxTabs({
  tab,
  setTab,
  trades,
  activeTradeId,
  requests,
  acceptedIds,
  selectedId,
  onSelect,
  onAccept,
  onDecline,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
  trades: Trade[];
  activeTradeId?: string;
  requests: MessageRequest[];
  acceptedIds: string[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
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
              <TradeRow key={trade.id} trade={trade} active={trade.id === activeTradeId} />
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
          {requests.length > 0 ? (
            <ul className="flex flex-col gap-3.5">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  accepted={acceptedIds.includes(request.id)}
                  onAccept={() => onAccept(request.id)}
                  onDecline={() => onDecline(request.id)}
                  selected={request.id === selectedId}
                  onSelect={onSelect && (() => onSelect(request.id))}
                />
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-body-s text-ink-400">No requests right now.</p>
          )}
        </>
      )}
    </div>
  );
}
