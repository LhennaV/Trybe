import type { Metadata } from "next";
import LevelBadge from "@/components/badges/LevelBadge";
import { TRADER_LEVELS } from "@/components/badges/levels";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { SheetDemo, ToggleDemo } from "./InteractiveDemos";

export const metadata: Metadata = {
  title: "Component preview",
  robots: { index: false },
};

// Dev page for checking the base UI components in every theme.
export default function Preview() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-xl text-brand-plum">Trybe</h1>
        <p className="text-body-m text-ink-600">
          Curiosity killed the cat. Trybe brought it back.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Appearance</h2>
        <ThemeSwitcher />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Buttons</h2>
        <Button fullWidth>Make an offer</Button>
        <Button variant="secondary" fullWidth>
          Save for later
        </Button>
        <Button variant="ghost" fullWidth>
          Maybe next time
        </Button>
        <Button variant="danger" fullWidth>
          Submit report
        </Button>
        <Button fullWidth disabled>
          Can&apos;t touch this
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Chips</h2>
        <div className="flex flex-wrap gap-2">
          <Chip selected>Pottery</Chip>
          <Chip>Film photography</Chip>
          <Chip>Knitting</Chip>
          <Chip selected>Woodworking</Chip>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Avatars</h2>
        <div className="flex items-center gap-3">
          <Avatar name="Storm" size={56} />
          <Avatar name="kiln.and.co" size={40} />
          <Avatar name="filmbyjo" size={40} />
          <Avatar name="mika.makes" size={40} />
          <Avatar name="kiln.and.co" size={20} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Card</h2>
        <Card className="flex flex-col gap-1">
          <p className="text-title-m text-ink-900">Trade safely</p>
          <p className="text-body-s text-ink-600">
            Meet somewhere public and check the gear before you swap.
          </p>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Toggles</h2>
        <ToggleDemo />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Sheet</h2>
        <SheetDemo />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Trade status</h2>
        <div className="flex flex-wrap gap-2">
          <StatusPill status="pending" />
          <StatusPill status="accepted" />
          <StatusPill status="completed" />
          <StatusPill status="declined" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-s uppercase text-ink-400">Trader levels</h2>
        <div className="flex flex-wrap gap-2">
          {TRADER_LEVELS.map((level) => (
            <LevelBadge key={level.level} completedTrades={level.minTrades} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-label-s uppercase text-ink-400">Inputs</h2>
        <Input label="Display name" placeholder="What should we call you?" />
        <Input
          label="Email"
          type="email"
          defaultValue="storm@"
          error="That email looks a little off. Mind checking it?"
        />
      </section>
    </main>
  );
}
