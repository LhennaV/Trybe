"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowsLeftRight,
  CaretLeft,
  DotsThree,
  Flag,
  HourglassMedium,
  PaperPlaneTilt,
  Prohibit,
  ShieldCheck,
  User,
  Warning,
  X,
} from "@phosphor-icons/react";
import Avatar from "@/components/ui/Avatar";
import Button, { buttonClassName } from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Sheet from "@/components/ui/Sheet";
import SheetAction from "@/components/ui/SheetAction";
import OfferCard from "./OfferCard";
import TradeStatusPill from "./TradeStatusPill";
import { canRespond, currentOffer, describeOffer, type ChatMessage, type Trade, type TradeStatus } from "./tradeModel";

// Phrases that hint at moving off Trybe. The server does the real check
// (CHAT-04); this only warns you before you send.
const CONTACT_HINT = /\b(\d{4}[\s-]?\d{3}[\s-]?\d{4}|09\d{9}|viber|whats ?app|telegram|messenger|gcash|ig\b|instagram)/i;

function Bubble({ message }: { message: Extract<ChatMessage, { kind: "text" }> }) {
  const mine = message.from === "me";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "flex max-w-[78%] flex-col gap-1 px-3.5 py-2.5",
          mine
            ? "rounded-t-[18px] rounded-br-[6px] rounded-bl-[18px] bg-brand-plum text-surface-white"
            : "rounded-t-[18px] rounded-br-[18px] rounded-bl-[6px] border-[1.5px] border-line bg-surface-white text-ink-900",
        ].join(" ")}
      >
        <p className="text-body-s">{message.body}</p>
        <p className={`text-caption opacity-70 ${mine ? "" : "text-ink-400"}`}>{message.time}</p>
      </div>
    </div>
  );
}

// Trade chat (mobile). Offers, counters, and messages in one thread, with
// the current terms pinned on top. Changes are local until the trade and
// message endpoints exist; then this subscribes to Supabase Realtime (CHAT-05).
export default function TradeChat({ trade: initial }: { trade: Trade }) {
  const router = useRouter();
  const [trade, setTrade] = useState(initial);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  // Set when the server says the trade changed under you (409). See handleAction.
  const [conflict, setConflict] = useState(false);

  const offer = currentOffer(trade);
  const myMove = canRespond(trade);
  const handle = trade.other.handle;
  const draftAsksForContact = CONTACT_HINT.test(draft);

  function addSystem(body: string, status: TradeStatus) {
    setTrade((t) => ({
      ...t,
      status,
      messages: [...t.messages, { id: `sys-${t.messages.length}`, kind: "system", body }],
    }));
  }

  // When the API exists this awaits the endpoint; a 409 sets `conflict` instead.
  function handleAction(action: "accept" | "decline") {
    setConflict(false);
    if (action === "accept") addSystem("You accepted. The items are reserved for this trade. Set up a meetup next.", "accepted");
    else addSystem("You declined this offer.", "declined");
  }

  function send() {
    const body = draft.trim();
    if (!body) return;
    setTrade((t) => ({
      ...t,
      messages: [...t.messages, { id: `msg-${t.messages.length}`, kind: "text", from: "me", body, time: "Now" }],
    }));
    setDraft("");
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <header className="flex items-center gap-2.5 border-b border-line bg-surface-white px-4 py-2.5 pt-[max(10px,env(safe-area-inset-top))]">
        <IconButton href="/trades" label="Back to trades">
          <CaretLeft size={20} weight="bold" aria-hidden />
        </IconButton>
        <Link href={`/users/${handle}`} className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar name={handle} size={38} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-body-m font-bold text-ink-900">@{handle}</span>
            <span className="text-caption text-ink-600">
              {trade.other.tradeCount > 0 ? `★ ${trade.other.rating} · ${trade.other.tradeCount} trades` : "New trader"}
            </span>
          </span>
        </Link>
        <TradeStatusPill status={trade.status} />
        <IconButton label="More options" onClick={() => setMenuOpen(true)}>
          <DotsThree size={20} weight="bold" aria-hidden />
        </IconButton>
      </header>

      {offer && (
        <div className="flex items-center gap-2.5 bg-brand-lavender-soft px-4 py-2.5">
          <ArrowsLeftRight size={16} weight="bold" className="shrink-0 text-brand-plum" aria-hidden />
          <div className="flex min-w-0 flex-col">
            <p className="text-body-s font-bold text-brand-plum-dark">{describeOffer(offer)}</p>
            <p className="text-caption text-ink-600">
              {trade.offers.length > 1 ? "Counter offer · history is in the chat below" : "Current offer"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3.5" role="log" aria-label={`Chat with @${handle}`}>
        {trade.messages.map((message) => {
          if (message.kind === "text") return <Bubble key={message.id} message={message} />;
          if (message.kind === "system") {
            return (
              <p key={message.id} className="text-center text-caption text-ink-600">
                {message.body}
              </p>
            );
          }
          const index = trade.offers.findIndex((o) => o.id === message.offerId);
          const thisOffer = trade.offers[index];
          if (!thisOffer) return null;
          const isCurrent = thisOffer.id === offer?.id;
          return (
            <OfferCard
              key={message.id}
              offer={thisOffer}
              otherHandle={handle}
              isCounter={index > 0}
              actions={
                isCurrent && myMove ? (
                  <div className="flex gap-2">
                    <Button className="flex-1 px-2.5 py-[9px]" onClick={() => handleAction("accept")}>
                      Accept
                    </Button>
                    <Link
                      href={`/trades/${trade.id}/counter`}
                      className={buttonClassName({ variant: "secondary", className: "flex-1 px-2.5 py-[9px]" })}
                    >
                      Counter
                    </Link>
                    <Button variant="ghost" className="flex-1 px-2.5 py-[9px]" onClick={() => handleAction("decline")}>
                      Decline
                    </Button>
                  </div>
                ) : isCurrent && trade.status === "pending" ? (
                  // You made the current offer, so you wait (TRD-05).
                  <p className="flex items-center gap-1.5 text-caption text-ink-600">
                    <HourglassMedium size={14} weight="bold" aria-hidden />
                    Waiting for @{handle} to accept, counter, or decline.
                  </p>
                ) : null
              }
            />
          );
        })}

        {conflict && (
          <div role="alert" className="flex flex-col gap-2 rounded-xl bg-status-warning-soft px-3 py-2.5 text-caption text-ink-900">
            This trade changed while you were looking, so nothing was saved.
            <Button variant="ghost" className="py-2" onClick={() => router.refresh()}>
              Show the latest
            </Button>
          </div>
        )}

        <p className="flex items-center gap-2 rounded-xl bg-status-success-soft px-3 py-2 text-caption text-ink-900">
          <ShieldCheck size={16} weight="bold" className="shrink-0 text-status-success" aria-hidden />
          Keep the chat on Trybe and never send money ahead of the meetup.
        </p>
      </div>

      <form
        className="flex flex-col gap-2 border-t border-line bg-surface-white px-4 pt-2.5 pb-[max(30px,env(safe-area-inset-bottom))]"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        {draftAsksForContact && (
          <p className="flex items-start gap-1.5 rounded-[10px] bg-status-warning-soft px-2.5 py-2 text-caption text-ink-900">
            <Warning size={14} weight="bold" className="mt-px shrink-0 text-status-warning" aria-hidden />
            Looks like contact info. Keeping the chat on Trybe keeps your trade history in one place.
          </p>
        )}
        <div className="flex items-center gap-2.5">
          <label htmlFor="chat-draft" className="sr-only">
            Message @{handle}
          </label>
          <input
            id="chat-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Message @${handle}`}
            autoComplete="off"
            className="h-[42px] min-w-0 flex-1 rounded-chip border-[1.5px] border-line bg-brand-cream px-4 text-body-s text-ink-900 placeholder:text-ink-400"
          />
          <button
            type="submit"
            aria-label="Send"
            className="relative flex size-[42px] shrink-0 items-center justify-center rounded-chip bg-brand-plum text-surface-white before:absolute before:-inset-0.5"
          >
            <PaperPlaneTilt size={18} weight="bold" aria-hidden />
          </button>
        </div>
      </form>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} label="Trade options">
        <div className="flex flex-col gap-1.5">
          <SheetAction
            icon={<User size={20} weight="bold" />}
            title={`View @${handle}'s profile`}
            onClick={() => router.push(`/users/${handle}`)}
          />
          {(trade.status === "pending" || trade.status === "accepted") && (
            <SheetAction
              icon={<X size={20} weight="bold" />}
              title="Cancel this trade"
              description={
                trade.status === "accepted"
                  ? "Reserved items go back to up for trade."
                  : "Withdraw from this trade before anyone accepts."
              }
              onClick={() => {
                setMenuOpen(false);
                addSystem("You cancelled this trade.", "cancelled");
              }}
            />
          )}
          <hr className="h-[1.5px] border-0 bg-line" />
          <SheetAction
            danger
            icon={<Prohibit size={20} weight="bold" />}
            title={`Block @${handle}`}
            description="They can't message you or propose trades."
            onClick={() => setMenuOpen(false)}
          />
          <SheetAction
            danger
            icon={<Flag size={20} weight="bold" />}
            title={`Report @${handle}`}
            description="Scams, no-shows, fake items, harassment."
            onClick={() => setMenuOpen(false)}
          />
          <Button variant="ghost" fullWidth className="mt-1.5" onClick={() => setMenuOpen(false)}>
            Close
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
