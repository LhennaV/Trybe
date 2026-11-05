import LandingSection from "./LandingSection";
import WaitlistForm from "./WaitlistForm";

export default function FinalCta() {
  return (
    <LandingSection innerClassName="pt-2 lg:pt-6">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-brand-plum px-5 py-10 text-center lg:gap-5 lg:rounded-[32px] lg:px-16 lg:py-[72px]">
        <h2 className="font-display text-display-section-m text-surface-white lg:max-w-[720px] lg:text-display-cta">
          Your next hobby might already be in someone&apos;s drawer.
        </h2>
        <p className="text-body-s text-brand-lavender-soft lg:text-lead">
          Join the beta and be one of the first to trade on Trybe.
        </p>
        <WaitlistForm onPlum className="text-left lg:max-w-[460px]" />
      </div>
    </LandingSection>
  );
}
