import type { Metadata } from "next";
import HobbyPicker from "@/components/onboarding/HobbyPicker";
import OnboardingStep from "@/components/onboarding/OnboardingStep";

export const metadata: Metadata = {
  title: "Pick your hobbies",
};

// AUTH_REDIRECTS.verified: the email link lands here, so there's no back
// button (the sign up form is already done).
export default function OnboardingHobbiesPage() {
  return (
    <OnboardingStep
      step={2}
      totalSteps={3}
      title="What are you into?"
      subtitle="Email verified! Now tell us what you already do and what you've been wanting to try."
    >
      <HobbyPicker />
    </OnboardingStep>
  );
}
