import StatusPill from "@/components/ui/StatusPill";
import { STATUS_LABELS, type TradeStatus } from "./tradeModel";

// StatusPill has four looks; cancelled trades reuse the declined (gray) one.
export default function TradeStatusPill({ status }: { status: TradeStatus }) {
  const look = status === "cancelled" ? "declined" : status;
  return <StatusPill status={look} label={STATUS_LABELS[status]} />;
}
