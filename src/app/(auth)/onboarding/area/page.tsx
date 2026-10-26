import type { Metadata } from "next";
import AreaForm from "@/components/onboarding/AreaForm";
import OnboardingStep from "@/components/onboarding/OnboardingStep";

export const metadata: Metadata = {
  title: "Your area",
};

export default function OnboardingAreaPage() {
  return (
    <OnboardingStep
      step={3}
      totalSteps={3}
      backHref="/onboarding/hobbies"
      title="Where do you trade?"
      subtitle="Trades happen in person, so we show gear near you first."
    >
      <AreaForm />
    </OnboardingStep>
  );
}
