import type { Metadata } from "next";
import HobbyPicker from "@/components/onboarding/HobbyPicker";
import OnboardingStep from "@/components/onboarding/OnboardingStep";

export const metadata: Metadata = {
  title: "Pick your hobbies",
};

export default function OnboardingHobbiesPage() {
  return (
    <OnboardingStep
      step={2}
      totalSteps={3}
      backHref="/signup"
      title="What are you into?"
      subtitle="Tell us what you already do and what you've been wanting to try. We'll match you with gear from both sides."
    >
      <HobbyPicker />
    </OnboardingStep>
  );
}
