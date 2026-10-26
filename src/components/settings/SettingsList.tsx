import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

// A titled group of rows in one white card, like ACCOUNT or PRIVACY & SAFETY.
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-label-s uppercase text-ink-400">{title}</h2>
      <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-line bg-surface-white [&>*+*]:border-t [&>*+*]:border-line">
        {children}
      </div>
    </section>
  );
}

const rowClassName = "flex min-h-11 w-full items-center gap-3 px-3.5 py-[11px] text-left";

type SettingsRowProps = {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
  href: string;
};

// A row that opens another screen. Shows the current value on the right.
export function SettingsLinkRow({ icon, label, value, href }: SettingsRowProps) {
  return (
    <Link href={href} className={rowClassName}>
      <span className="shrink-0 text-brand-plum">{icon}</span>
      <span className="flex-1 text-body-s text-ink-900">{label}</span>
      {value && <span className="text-caption text-ink-400">{value}</span>}
      <CaretRight size={16} weight="bold" className="shrink-0 text-ink-400" aria-hidden />
    </Link>
  );
}

// A row with a control on the right (a Toggle). The label id ties the control to its text.
export function SettingsControlRow({
  icon,
  label,
  labelId,
  control,
}: {
  icon?: ReactNode;
  label: string;
  labelId: string;
  control: ReactNode;
}) {
  return (
    <div className={rowClassName}>
      {icon && <span className="shrink-0 text-brand-plum">{icon}</span>}
      <span id={labelId} className="flex-1 text-body-s text-ink-900">
        {label}
      </span>
      {control}
    </div>
  );
}
