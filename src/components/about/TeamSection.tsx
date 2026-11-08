import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowsLeftRight } from "@phosphor-icons/react/dist/ssr";
import SpecialBadge from "@/components/badges/SpecialBadge";
import LandingSection from "@/components/landing/LandingSection";
import SectionLabel from "@/components/landing/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import Tilt from "@/components/ui/Tilt";

type Member = {
  name: string;
  role: string;
  bio: string;
  // Cut-out portrait (transparent background) and the colour behind it.
  // Shown about 340px wide, so it needs 700px+ to stay sharp on 2x screens.
  photo: string;
  backdrop: string;
  tilt: string;
};

const TEAM: Member[] = [
  {
    name: "Lhenna",
    role: "Design & frontend",
    bio: "Designs every screen in Figma, then builds it. Studies IT at PUP Santa Maria. Stormi's human.",
    // TODO(Lhenna): swap for a bigger cut-out (this one is only 378px).
    photo: "/about/lhenna.png",
    backdrop: "bg-brand-lavender",
    tilt: "lg:-rotate-2",
  },
  {
    name: "Ethan",
    role: "Backend",
    bio: "Writes the code you never see, so everything you do see just works. Trades, chats, logins: if it runs, he built it.",
    photo: "/about/ethan.png",
    backdrop: "bg-brand-box",
    tilt: "lg:rotate-2",
  },
];

// One founder as a collectible trading card: portrait on a colour block,
// then name, role, badge, and a short bio. Leans toward the mouse with a
// shine, like holding a real card up to the light.
function MemberCard({ member, index }: { member: Member; index: number }) {
  return (
    <li className={`reveal-item w-full max-w-[360px] ${member.tilt}`} style={{ "--i": index * 2 } as CSSProperties}>
      <Tilt
        max={9}
        className="card-lift flex h-full flex-col gap-4 rounded-[28px] border-[1.5px] border-line bg-surface-white p-3 pb-6"
      >
        <div className={`relative aspect-[4/3.6] overflow-hidden rounded-[20px] ${member.backdrop}`}>
          {/* Faded dots behind the portrait, like a card's foil. */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-25 [background-image:radial-gradient(var(--surface-white)_1.5px,transparent_1.5px)] [background-size:18px_18px]"
          />
          <Image
            src={member.photo}
            alt={`Photo of ${member.name}`}
            fill
            sizes="(min-width: 640px) 340px, 90vw"
            className="object-contain object-bottom"
          />
          <span className="absolute top-3 left-3">
            <SpecialBadge badge="founding-paw" />
          </span>
        </div>
        <div className="flex flex-col gap-2 px-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-display-l text-ink-900">{member.name}</h3>
            <p className="text-label-s tracking-[0.08em] text-brand-plum uppercase">{member.role}</p>
          </div>
          <p className="text-body-m text-ink-600">{member.bio}</p>
        </div>
      </Tilt>
    </li>
  );
}

export default function TeamSection() {
  const [first, second] = TEAM;

  return (
    <LandingSection id="team" innerClassName="flex flex-col items-center gap-10 lg:gap-14">
      <div className="flex flex-col gap-3.5 text-center lg:max-w-[760px] lg:gap-3">
        <SectionLabel>The team</SectionLabel>
        <RevealText
          text="Two people, one very curious cat."
          className="font-display text-display-section-m text-ink-900 lg:text-display-section"
        />
        <p className="text-body-m text-ink-600 lg:text-lead">Trybe is a small, non-commercial project by two students.</p>
      </div>

      <ul className="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-center lg:justify-center lg:gap-0">
        <MemberCard member={first} index={0} />
        {/* The swap button between them: it's a trading app, after all. */}
        <li
          aria-hidden
          className="reveal-item z-10 flex size-14 shrink-0 items-center justify-center rounded-chip bg-brand-plum text-surface-white shadow-button lg:-mx-5"
          style={{ "--i": 1 } as CSSProperties}
        >
          <ArrowsLeftRight size={24} weight="bold" />
        </li>
        <MemberCard member={second} index={1} />
      </ul>
    </LandingSection>
  );
}
