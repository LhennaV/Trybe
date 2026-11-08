import type { Metadata } from "next";
import LegalDoc, { type LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Community guidelines",
  description: "How to trade on Trybe: be kind and honest, meet safely, and report anything that's off.",
};

// Required before posting (Google Play user generated content policy, TRD section 15).
const SECTIONS: LegalSection[] = [
  {
    id: "kind-honest",
    title: "Be kind and honest",
    body: (
      <p>
        Describe gear as it really is, show up when you say you will, and be decent in chats. Everyone here was a
        beginner at something once.
      </p>
    ),
  },
  {
    id: "not-allowed",
    title: "Not allowed",
    body: (
      <ul>
        <li>Asking for payment before the meetup</li>
        <li>Fake, stolen, or unsafe items</li>
        <li>Harassment, hate, or explicit content</li>
        <li>Pushing people to chat off Trybe to get around the rules</li>
      </ul>
    ),
  },
  {
    id: "meet-safely",
    title: "Meet safely",
    body: (
      <ul>
        <li>Meet in a busy public place, in daylight if you can</li>
        <li>Tell a friend where you&apos;re going</li>
        <li>Check the item before you swap or hand over cash</li>
        <li>Keep the chat on Trybe, so there&apos;s a record if something goes wrong</li>
      </ul>
    ),
  },
  {
    id: "reporting",
    title: "Reporting",
    body: (
      <p>
        Report anything that breaks these rules from the post, profile, chat, or trade. Reports are private and
        reviewed by the Trybe team. Breaking the rules can get content hidden or an account suspended.
      </p>
    ),
  },
];

export default function GuidelinesPage() {
  return (
    <LegalDoc
      title="Community guidelines"
      current="/guidelines"
      updated="November 8, 2026"
      intro={<p>Trybe works because people trust each other. Here&apos;s how to keep it that way.</p>}
      sections={SECTIONS}
    />
  );
}
