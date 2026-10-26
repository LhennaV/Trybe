import Link from "next/link";
import { Camera, Check, Flag, Package, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { reportHref } from "@/components/safety/reportHref";
import { buttonClassName } from "@/components/ui/Button";
import { currentOffer, formatPHP, type Trade } from "./tradeModel";

function Side({ label, items, cash, tone }: { label: string; items: string[]; cash?: number; tone: "mine" | "theirs" }) {
  const Icon = tone === "mine" ? Camera : Package;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-s uppercase text-ink-600">{label}</p>
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            tone === "mine" ? "bg-brand-lavender-soft text-brand-plum" : "bg-brand-box-soft text-brand-box-dark"
          }`}
        >
          <Icon size={18} weight="bold" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-body-s font-bold text-ink-900">{items.join(" + ") || "Nothing"}</span>
          {cash !== undefined && <span className="text-caption text-ink-600">+ {formatPHP(cash)} cash at meetup</span>}
        </span>
      </div>
    </div>
  );
}

// Right panel of the desktop Trades screen: what each side gives, where the
// trade is, a short safety reminder, and quick links.
export default function TradeDetailsPanel({ trade }: { trade: Trade }) {
  const offer = currentOffer(trade);
  const steps = [
    { label: "Proposed", done: true },
    {
      label: trade.status === "pending" ? (trade.offers.length > 1 ? "Counter offer sent" : "Waiting for a reply") : "Accepted",
      done: trade.status !== "pending",
      current: trade.status === "pending",
    },
    { label: "Meet up", done: trade.status === "completed", current: trade.status === "accepted" },
    { label: "Rate each other", done: false },
  ];

  return (
    <aside className="flex flex-col gap-3 overflow-y-auto p-4" aria-label="Trade details">
      <h2 className="text-title-m text-ink-900">Trade details</h2>
      {offer && (
        <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-line bg-surface-white p-3.5">
          <Side
            label="You give"
            items={offer.myItems}
            cash={offer.cash?.from === "me" ? offer.cash.amount : undefined}
            tone="mine"
          />
          <hr className="h-px border-0 bg-line" />
          <Side
            label="You get"
            items={offer.theirItems}
            cash={offer.cash?.from === "them" ? offer.cash.amount : undefined}
            tone="theirs"
          />
        </div>
      )}

      <ol className="flex flex-col gap-2 rounded-card border-[1.5px] border-line bg-surface-white p-3.5">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2.5 text-body-s">
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-chip ${
                step.done
                  ? "bg-brand-plum text-surface-white"
                  : step.current
                    ? "border-[2.5px] border-brand-plum"
                    : "bg-line"
              }`}
            >
              {step.done && <Check size={11} weight="bold" aria-hidden />}
            </span>
            <span className={step.done || step.current ? "font-bold text-brand-plum" : "text-ink-400"}>{step.label}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-1.5 rounded-card bg-status-success-soft p-3.5">
        <p className="flex items-center gap-2 text-body-s font-bold text-ink-900">
          <ShieldCheck size={16} weight="bold" className="text-status-success" aria-hidden />
          Before you meet
        </p>
        {["Pick a public, well-lit spot", "Inspect the gear in person", "Cash only at the handoff"].map((tip) => (
          <p key={tip} className="flex items-center gap-1.5 text-caption text-ink-900">
            <Check size={12} weight="bold" className="text-status-success" aria-hidden />
            {tip}
          </p>
        ))}
      </div>

      <Link href={`/users/${trade.other.handle}`} className={buttonClassName({ variant: "ghost", fullWidth: true })}>
        View profile
      </Link>
      <Link
        href={reportHref("trade", trade.other.handle, `/trades/${trade.id}`)}
        className="flex min-h-11 items-center justify-center gap-1.5 text-body-s font-bold text-status-danger"
      >
        <Flag size={14} weight="bold" aria-hidden />
        Report this trade
      </Link>
    </aside>
  );
}
