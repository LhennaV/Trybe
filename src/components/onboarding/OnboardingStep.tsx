import type { ReactNode } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import IconButton from "@/components/ui/IconButton";

type OnboardingStepProps = {
  step: number;
  totalSteps: number;
  backHref: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

// Frame shared by the onboarding steps: back button, "Step x of y",
// progress bars, and the heading. Sign up counts as step 1.
export default function OnboardingStep({
  step,
  totalSteps,
  backHref,
  title,
  subtitle,
  children,
}: OnboardingStepProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-[18px] px-4 pt-2 pb-[max(34px,env(safe-area-inset-bottom))] lg:min-h-0 lg:max-w-[440px] lg:py-12">
      <div className="flex items-center gap-3 py-2">
        <IconButton href={backHref} label="Back">
          <CaretLeft size={20} weight="bold" aria-hidden />
        </IconButton>
        <p className="text-body-s font-bold text-ink-400">
          Step {step} of {totalSteps}
        </p>
      </div>

      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-[3px] ${index < step ? "bg-brand-plum" : "bg-line"}`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-display-l text-brand-plum">{title}</h1>
        <p className="text-body-m text-ink-600">{subtitle}</p>
      </div>

      {children}
    </main>
  );
}
