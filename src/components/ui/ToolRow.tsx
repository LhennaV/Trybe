import { ArrowsLeftRight, Camera } from "@phosphor-icons/react/dist/ssr";
import type { ToolItem } from "@/components/posts/samplePostDetails";

export default function ToolRow({ tool }: { tool: ToolItem }) {
  return (
    <div className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface-white py-2.5 pr-3.5 pl-2.5">
      {/* Placeholder until item photos exist. */}
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-box-soft text-brand-box-dark/40">
        <Camera size={20} weight="bold" aria-hidden />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <p className="text-body-m font-bold text-ink-900">{tool.name}</p>
        <p className="text-caption text-ink-600">
          {tool.condition} · {tool.category}
        </p>
        {tool.lookingFor && (
          <p className="text-caption font-bold text-brand-plum">Looking for: {tool.lookingFor}</p>
        )}
      </div>

      {tool.upForTrade ? (
        <span className="flex shrink-0 items-center gap-1 rounded-chip bg-brand-lavender-soft px-[9px] py-[5px] text-caption font-extrabold text-brand-plum">
          <ArrowsLeftRight size={12} weight="bold" aria-hidden />
          Trade
        </span>
      ) : (
        <span className="shrink-0 rounded-chip bg-line px-[9px] py-[5px] text-caption font-extrabold text-ink-600">
          Inspo
        </span>
      )}
    </div>
  );
}
