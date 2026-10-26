import type { ReactNode } from "react";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import { describeOffer, type TradeOffer } from "./tradeModel";

type OfferCardProps = {
  offer: TradeOffer;
  otherHandle: string;
  isCounter: boolean;
  // Accept / Counter / Decline, only on the current offer when it's your move.
  actions?: ReactNode;
};

// An offer inside the trade chat. Every offer and counter is its own card,
// so the chat doubles as the offer history.
export default function OfferCard({ offer, otherHandle, isCounter, actions }: OfferCardProps) {
  const heading =
    offer.madeBy === "me"
      ? `${isCounter ? "You countered" : "You proposed"} · ${offer.time}`
      : `@${otherHandle} ${isCounter ? "sent a counter" : "proposed"} · ${offer.time}`;

  return (
    <div className="flex flex-col gap-2.5 rounded-card border-2 border-brand-lavender bg-surface-white px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-label-s uppercase text-brand-plum">
        <ArrowsLeftRight size={14} weight="bold" aria-hidden />
        {heading}
      </p>
      <p className="text-body-s font-bold text-ink-900">{describeOffer(offer)}</p>
      {actions}
    </div>
  );
}
