import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import NotebookStory from "@/components/about/NotebookStory";
import RoadmapSection from "@/components/about/RoadmapSection";
import TeamSection from "@/components/about/TeamSection";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingNav from "@/components/landing/LandingNav";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Trybe went from a notebook to an app: the name, the tagline, the two people building it, and what comes next.",
};

export default function AboutPage() {
  return (
    <>
      <LandingNav />
      <main className="flex-1 overflow-x-clip">
        <AboutHero />
        <NotebookStory />
        <TeamSection />
        <RoadmapSection />
      </main>
      <LandingFooter />
    </>
  );
}
