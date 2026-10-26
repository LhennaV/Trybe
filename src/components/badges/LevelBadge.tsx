import Paw from "@/components/icons/Paw";
import { getTraderLevel } from "./levels";

type LevelBadgeProps = {
  completedTrades: number;
  className?: string;
};

export default function LevelBadge({ completedTrades, className }: LevelBadgeProps) {
  const level = getTraderLevel(completedTrades);

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-chip px-[9px] py-[3px] text-caption font-extrabold",
        level.badgeClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Paw size={13} className={level.pawClassName} />
      {level.name}
    </span>
  );
}
