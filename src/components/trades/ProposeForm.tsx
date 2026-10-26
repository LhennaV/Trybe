"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowsLeftRight, Camera, Check, Info, Money, Package } from "@phosphor-icons/react";
import type { ToolItem } from "@/components/posts/samplePostDetails";
import Button, { buttonClassName } from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import TopBar from "@/components/ui/TopBar";
import { formatPHP, type Side } from "./tradeModel";

type Balance = "even" | "cash" | "item";

type ProposeFormProps = {
  mode: "propose" | "counter";
  backHref: string;
  theirHandle: string;
  theirItems: ToolItem[];
  myItems: ToolItem[];
  initialTheirIds?: string[];
  initialMyIds?: string[];
  initialCash?: { amount: number; from: Side };
};

function toggle(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
}

function PickRow({
  item,
  selected,
  onToggle,
  tone,
}: {
  item: ToolItem;
  selected: boolean;
  onToggle: () => void;
  tone: "mine" | "theirs";
}) {
  const Icon = tone === "mine" ? Camera : Package;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={[
        "flex w-full items-center gap-3 rounded-card bg-surface-white p-2.5 text-left",
        selected ? "border-2 border-brand-plum" : "border-[1.5px] border-line",
      ].join(" ")}
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-[10px] ${
          tone === "mine" ? "bg-brand-lavender-soft text-brand-plum" : "bg-brand-box-soft text-brand-box-dark"
        }`}
      >
        <Icon size={19} weight="bold" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="text-body-s font-bold text-ink-900">{item.name}</span>
        <span className="text-caption text-ink-600">
          {item.category} · {item.condition}
        </span>
        {tone === "theirs" && item.lookingFor && (
          <span className="mt-0.5 self-start rounded-lg bg-brand-lavender-soft px-2 py-[3px] text-caption font-extrabold text-brand-plum">
            Wants: {item.lookingFor}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={`flex size-[22px] shrink-0 items-center justify-center rounded-chip ${
          selected ? "bg-brand-plum text-surface-white" : "border-[1.5px] border-ink-400 bg-surface-white"
        }`}
      >
        {selected && <Check size={13} weight="bold" />}
      </span>
    </button>
  );
}

// Propose a trade or send a counter (TRD-01, TRD-02, TRD-03). Pick their
// items and yours, and optionally balance it with cash in either direction.
export default function ProposeForm({
  mode,
  backHref,
  theirHandle,
  theirItems,
  myItems,
  initialTheirIds,
  initialMyIds = [],
  initialCash,
}: ProposeFormProps) {
  const [theirIds, setTheirIds] = useState(initialTheirIds ?? theirItems.slice(0, 1).map((i) => i.id));
  const [myIds, setMyIds] = useState(initialMyIds);
  const [balance, setBalance] = useState<Balance>(initialCash ? "cash" : "even");
  const [cashAmount, setCashAmount] = useState(initialCash ? String(initialCash.amount) : "");
  const [cashFrom, setCashFrom] = useState<Side>(initialCash?.from ?? "me");
  const [notice, setNotice] = useState("");
  const cashId = useId();

  const cash = Number(cashAmount.replace(/[^\d]/g, ""));
  const hasCash = balance === "cash" && cash > 0;
  const ready = theirIds.length > 0 && (myIds.length > 0 || hasCash);

  return (
    <form
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(
          `${mode === "counter" ? "Counter offers" : "Proposals"} aren't connected yet. They go live once the trade API is ready.`,
        );
      }}
    >
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-[calc(110px+max(30px,env(safe-area-inset-bottom)))]">
        <TopBar title={mode === "counter" ? "Counter offer" : "Propose a trade"} backHref={backHref} />

        <h2 className="text-label-s uppercase text-ink-600">You get</h2>
        {theirItems.map((item) => (
          <PickRow
            key={item.id}
            item={item}
            tone="theirs"
            selected={theirIds.includes(item.id)}
            onToggle={() => setTheirIds((ids) => toggle(ids, item.id))}
          />
        ))}
        <p className="-mt-2 text-caption text-ink-400">from @{theirHandle}</p>

        <div className="flex items-center gap-2.5" aria-hidden>
          <span className="h-[1.5px] flex-1 bg-line" />
          <span className="flex size-9 items-center justify-center rounded-chip bg-brand-plum text-surface-white">
            <ArrowsLeftRight size={18} weight="bold" />
          </span>
          <span className="h-[1.5px] flex-1 bg-line" />
        </div>

        <h2 className="text-label-s text-ink-600">
          <span className="uppercase">You give</span> · pick from your gear
        </h2>
        {myItems.length > 0 ? (
          myItems.map((item) => (
            <PickRow
              key={item.id}
              item={item}
              tone="mine"
              selected={myIds.includes(item.id)}
              onToggle={() => setMyIds((ids) => toggle(ids, item.id))}
            />
          ))
        ) : (
          // TRD-10: no gear yet. Cash-only offers still work.
          <div className="flex flex-col gap-2.5 rounded-card border-[1.5px] border-dashed border-line px-4 py-4 text-center">
            <p className="text-body-s text-ink-600">
              You don&apos;t have any gear up for trade yet. Post something you made and tag your tools, or offer cash
              below.
            </p>
            <Link href="/new" className={buttonClassName({ variant: "secondary", fullWidth: true })}>
              Add your gear
            </Link>
          </div>
        )}

        <h2 className="text-label-s uppercase text-ink-600">Balance the trade (optional)</h2>
        <SegmentedControl
          label="Balance the trade"
          value={balance}
          onChange={setBalance}
          options={[
            { value: "even", label: "Even swap" },
            { value: "cash", label: "Add cash" },
            { value: "item", label: "Add item" },
          ]}
        />

        {balance === "cash" && (
          <>
            <div className="flex h-[52px] items-center gap-2.5 rounded-input border-[1.5px] border-line bg-surface-white px-4">
              <Money size={20} weight="bold" className="shrink-0 text-status-success" aria-hidden />
              <label htmlFor={cashId} className="text-body-m font-bold text-ink-400">
                PHP
              </label>
              <input
                id={cashId}
                inputMode="numeric"
                value={cashAmount}
                onChange={(event) => setCashAmount(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-title-m text-ink-900 outline-none placeholder:text-ink-400"
              />
            </div>
            <SegmentedControl
              label="Who adds the cash"
              value={cashFrom}
              onChange={setCashFrom}
              options={[
                { value: "me", label: "From you" },
                { value: "them", label: `From @${theirHandle}` },
              ]}
            />
            <p className="flex items-start gap-2 rounded-xl bg-status-warning-soft px-3 py-2.5 text-caption text-ink-900">
              <Info size={16} weight="bold" className="shrink-0 text-status-warning" aria-hidden />
              Cash is handed over in person at the meetup. Trybe never holds or sends payments.
            </p>
          </>
        )}
        {balance === "item" && (
          <p className="rounded-xl bg-brand-lavender-soft px-3 py-2.5 text-caption text-ink-900">
            Pick more than one item above, from either side, to even things out.
          </p>
        )}

        {notice && (
          <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
            {notice}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-4 pt-3 pb-[max(30px,env(safe-area-inset-bottom))]">
          <Button type="submit" fullWidth disabled={!ready}>
            {mode === "counter" ? "Send counter" : "Send proposal"}
            {hasCash && ` · ${formatPHP(cash)}`}
          </Button>
          <p className="text-caption text-ink-400">They can accept, decline, or send a counter offer.</p>
        </div>
      </div>
    </form>
  );
}
