type TradeStatus = "pending" | "accepted" | "completed" | "declined";

type StatusPillProps = {
  status: TradeStatus;
  className?: string;
};

const statusStyles: Record<TradeStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-status-warning-soft text-status-warning" },
  accepted: { label: "Accepted", className: "bg-brand-lavender-soft text-brand-plum" },
  completed: { label: "Completed", className: "bg-status-success-soft text-status-success" },
  declined: { label: "Declined", className: "bg-line text-ink-600" },
};

export default function StatusPill({ status, className }: StatusPillProps) {
  const { label, className: statusClassName } = statusStyles[status];

  return (
    <span
      className={[
        "inline-flex items-center rounded-chip px-2.5 py-1 text-caption font-extrabold",
        statusClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
