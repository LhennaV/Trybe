import { Check } from "@phosphor-icons/react/dist/ssr";

const STEPS = ["Proposed", "Accepted", "Met up", "Rated"];

// Where the trade is: done steps are filled, the current one is outlined.
export default function TradeProgress({ current }: { current: number }) {
  return (
    <ol className="flex gap-1.5" aria-label="Trade progress">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span
              className={[
                "flex size-6 items-center justify-center rounded-chip",
                done ? "bg-brand-plum text-surface-white" : active ? "border-[3px] border-brand-plum bg-surface-white" : "bg-line",
              ].join(" ")}
            >
              {done && <Check size={12} weight="bold" aria-hidden />}
            </span>
            <span
              className={`text-caption ${done || active ? "font-extrabold text-brand-plum" : "text-ink-400"}`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
