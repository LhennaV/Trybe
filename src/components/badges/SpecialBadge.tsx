import { Cat, Package, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Paw from "@/components/icons/Paw";
import { getSpecialBadge, type SpecialBadgeId, type SpecialBadgeInfo } from "./specialBadges";

type SpecialBadgeProps = {
  badge: SpecialBadgeId;
  className?: string;
};

function BadgeIcon({ icon }: { icon: SpecialBadgeInfo["icon"] }) {
  if (icon === "paw") return <Paw size={13} className="text-brand-plum" />;
  const Icon = icon === "package" ? Package : Cat;
  return <Icon size={13} weight="bold" className="text-brand-plum" aria-hidden />;
}

// The gold ring and sparkle set special badges apart from level badges.
// On profiles, show them next to the level badge.
export default function SpecialBadge({ badge, className }: SpecialBadgeProps) {
  const info = getSpecialBadge(badge);

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-chip border-[1.5px] border-brand-box-dark bg-surface-white py-[3px] pr-[9px] pl-2 text-caption font-extrabold whitespace-nowrap text-ink-900",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <BadgeIcon icon={info.icon} />
      {info.name}
      <Sparkle size={11} weight="bold" className="text-brand-box-dark" aria-hidden />
    </span>
  );
}
