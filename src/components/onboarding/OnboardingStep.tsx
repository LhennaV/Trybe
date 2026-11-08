import type { ReactNode } from "react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { AuthBrand } from "@/components/auth/AuthScreen";
import IconButton from "@/components/ui/IconButton";

type OnboardingStepProps = {
  step: number;
  totalSteps: number;
  // Leave out when going back makes no sense (right after the email link).
  backHref?: string;
  title: string;
  subtitle: ReactNode;
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
    // Sits inside the frosted card from src/app/(auth)/layout.tsx.
    <main className="flex flex-col gap-[18px] px-5 pt-4 pb-7 sm:px-8 sm:pt-6 sm:pb-8">
      <AuthBrand />
      <div className="flex min-h-11 items-center gap-3">
        {backHref && (
          <IconButton href={backHref} label="Back">
            <CaretLeft size={20} weight="bold" aria-hidden />
          </IconButton>
        )}
        <p className="text-body-s font-bold text-ink-600">
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
