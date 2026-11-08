import type { Metadata } from "next";
import BadgesSection from "@/components/landing/BadgesSection";
import FaqSection from "@/components/landing/FaqSection";
import HobbiesSection from "@/components/landing/HobbiesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHero from "@/components/landing/LandingHero";
import LandingNav from "@/components/landing/LandingNav";
import ProblemSection from "@/components/landing/ProblemSection";
import SafetySection from "@/components/landing/SafetySection";
import StormSection from "@/components/landing/StormSection";

export const metadata: Metadata = {
  title: { absolute: "Trybe · Try a new hobby without buying new gear" },
  description:
    "Trade the stuff from hobbies you've moved on from for the starter gear you actually want. No checkout, no gamble.",
};

// Public landing page for people who aren't signed in. Section order follows
// Figma "Landing · A · Curiosity"; the hero and footer are ours from
// "Landing · B · No new gear". The app's feed lives at /feed.
export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main className="flex-1 overflow-x-clip">
        <LandingHero />
        <ProblemSection />
        <HowItWorks />
        <HobbiesSection />
        <SafetySection />
        <BadgesSection />
        <StormSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </>
  );
}
