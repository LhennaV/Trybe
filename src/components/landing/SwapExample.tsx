import Image from "next/image";
import { ArrowsLeftRight, Money } from "@phosphor-icons/react/dist/ssr";
import { BRAND, brandSize } from "@/shared/brand";

const SIDES = [
  {
    label: "You have",
    item: "Film camera you used twice",
    illustration: "/illustrations/camera-angled.svg",
    tileClassName: "bg-brand-lavender-soft",
    tilt: "lg:-rotate-3",
    floatDelay: "0s",
  },
  {
    label: "They have",
    item: "Pottery starter tools",
    illustration: "/illustrations/pottery-top.svg",
    tileClassName: "bg-status-success-soft",
    tilt: "lg:rotate-3",
    // Half a cycle behind, so the two cards bob separately.
    floatDelay: "-2.5s",
  },
];

function SideCard({ side }: { side: (typeof SIDES)[number] }) {
  return (
    <div
      style={{ animationDelay: side.floatDelay }}
      className={[
        // Floats on desktop only. Side by side on a phone, out-of-step cards just look misaligned.
        "flex flex-1 flex-col gap-2 rounded-[20px] lg:animate-float bg-surface-white p-2.5 text-left shadow-[0_10px_24px_rgb(43_36_51/0.12)]",
        "lg:mx-2 lg:flex-none lg:gap-3 lg:rounded-3xl lg:p-3.5 lg:shadow-[0_14px_36px_rgb(43_36_51/0.12)]",
        side.tilt,
      ].join(" ")}
    >
      <div
        className={`flex h-[130px] items-center justify-center rounded-[14px] lg:h-[220px] lg:w-[260px] lg:rounded-photo ${side.tileClassName}`}
      >
        <Image src={side.illustration} alt="" width={170} height={170} unoptimized className="size-[104px] lg:size-[170px]" />
      </div>
      <p className="text-label-s tracking-[0.08em] text-brand-plum uppercase">{side.label}</p>
      <p className="text-body-s font-bold text-ink-900 lg:text-title-m">{side.item}</p>
    </div>
  );
}

function CashChip() {
  return (
    <p className="flex items-center gap-1.5 rounded-chip bg-status-warning-soft px-3 py-1.5 text-label-s whitespace-nowrap text-status-warning">
      <Money size={14} weight="bold" aria-hidden />+ PHP 500, paid in person
    </p>
  );
}

// "You have / They have" cards with Storm and the swap button between them.
// Phones stack the middle row under the cards.
export default function SwapExample() {
  const [you, them] = SIDES;

  return (
    <figure className="flex w-full flex-col items-center gap-4 pt-3 lg:gap-[18px] lg:pt-7">
      <div className="flex w-full flex-col items-center lg:w-auto lg:flex-row lg:gap-7 lg:pb-3">
        <div className="flex w-full gap-3 lg:contents">
          <SideCard side={you} />
          <div className="hidden flex-col items-center gap-1.5 lg:flex">
            <Image {...BRAND.icon} {...brandSize(BRAND.icon, 145)} alt="" />
            <span className="flex size-[72px] items-center justify-center rounded-chip bg-brand-plum text-surface-white">
              <ArrowsLeftRight size={32} weight="bold" aria-hidden />
            </span>
            <CashChip />
          </div>
          <SideCard side={them} />
        </div>

        {/* Wraps the cash chip onto its own line on narrow phones instead of cutting it off. */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3.5 lg:hidden">
          <Image {...BRAND.icon} {...brandSize(BRAND.icon, 81)} alt="" />
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-chip bg-brand-plum text-surface-white">
            <ArrowsLeftRight size={24} weight="bold" aria-hidden />
          </span>
          <CashChip />
        </div>
      </div>
      <figcaption className="text-caption text-ink-600">An example trade. You decide what is fair.</figcaption>
    </figure>
  );
}
