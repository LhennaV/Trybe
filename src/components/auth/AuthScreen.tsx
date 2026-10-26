import type { ReactNode } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import IconButton from "@/components/ui/IconButton";

type AuthScreenProps = {
  backHref: string;
  children: ReactNode;
};

// Shared frame for sign up, log in, and the other account screens:
// back button on top, then the content in a phone-width column.
export default function AuthScreen({ backHref, children }: AuthScreenProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-2 pb-[max(34px,env(safe-area-inset-bottom))] lg:min-h-0 lg:max-w-[400px] lg:py-12">
      <div className="py-2">
        <IconButton href={backHref} label="Back">
          <CaretLeft size={20} weight="bold" aria-hidden />
        </IconButton>
      </div>
      {children}
    </main>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1.5 pb-1.5">
      <h1 className="font-display text-display-l text-brand-plum">{title}</h1>
      <p className="text-body-m text-ink-600">{subtitle}</p>
    </div>
  );
}
