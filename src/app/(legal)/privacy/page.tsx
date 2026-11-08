import type { Metadata } from "next";
import LegalDoc, { CONTACT_EMAIL, CONTACT_HREF, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "What Trybe collects, why, who helps us run it, and the rights you have over your data.",
};

// Plain-language privacy notice (Philippines Data Privacy Act of 2012 and the
// Google Play listing, TRD section 15). Draft: both founders sign off on the
// final text before launch (SAFE-07).
const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        Trybe is a non-commercial app for trading hobby gear, run by two students in the Philippines. When this notice
        says &ldquo;we&rdquo;, it means us. You can reach us at <a href={CONTACT_HREF} target="_blank" rel="noreferrer">{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>Only what Trybe needs to work:</p>
        <ul>
          <li>
            <strong>Your account:</strong> email, password (stored scrambled, we can&apos;t read it), display name,
            username, profile photo, bio, and city.
          </li>
          <li>
            <strong>What you do on Trybe:</strong> your hobbies, posts, photos, gear, trade offers, messages, meetup
            details, ratings, and reports.
          </li>
          <li>
            <strong>Technical data:</strong> basic device and error information so we can fix crashes, and a bot check
            when you sign up or log in.
          </li>
        </ul>
        <p>
          <strong>What we don&apos;t collect:</strong> payment details, your exact location, or your contacts. Location
          data hidden inside photos is removed when you upload them.
        </p>
      </>
    ),
  },
  {
    id: "why",
    title: "Why we use it",
    body: (
      <ul>
        <li>To create your account and keep it secure</li>
        <li>To show your posts and profile to other members</li>
        <li>To make trades, chats, and meetups work</li>
        <li>To keep the community safe: reviewing reports, stopping spam and bots</li>
        <li>To send you account emails, like verification and password resets</li>
      </ul>
    ),
  },
  {
    id: "who-sees-it",
    title: "Who can see it",
    body: (
      <>
        <p>
          <strong>Other members</strong> see your public profile: display name, username, photo, bio, city, hobbies,
          posts, ratings, and how long you&apos;ve been on Trybe. Only the two people in a trade can read its messages.
          Your email is never shown.
        </p>
        <p>
          <strong>Services that help us run Trybe</strong> handle data for us and only for this purpose: Supabase
          (database, sign in, photos, chat), Vercel (hosting), Sentry (error reports), Cloudflare Turnstile (bot
          checks), and Brevo (sending emails).
        </p>
        <p>We never sell your data, and we don&apos;t show ads.</p>
      </>
    ),
  },
  {
    id: "how-long",
    title: "How long we keep it",
    body: (
      <p>
        We keep your data while your account is open. When you delete your account, we delete your profile, posts,
        photos, and gear. Exact retention periods for anything kept longer, such as reports needed to keep others
        safe, will be listed here before launch.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the Data Privacy Act of 2012, you can:</p>
        <ul>
          <li>Know what data we have about you and how it&apos;s used</li>
          <li>Get a copy of it</li>
          <li>Fix anything that&apos;s wrong</li>
          <li>Object to how it&apos;s used, or ask us to delete it</li>
          <li>Complain to the National Privacy Commission</li>
        </ul>
        <p>
          You can edit your profile or delete your account any time in Settings, or from the{" "}
          <a href="/delete-account">account deletion page</a>. For anything else, email us.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: (
      <p>
        Data is sent over encrypted connections, access is limited to the two of us, and chat messages can only be
        read by the people in the trade. No system is perfect, so if something ever goes wrong with your data,
        we&apos;ll tell you and the National Privacy Commission as the law requires.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this notice",
    body: (
      <p>If we change how we use your data, we&apos;ll update this page and tell you in the app before it applies.</p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy notice"
      current="/privacy"
      updated="November 8, 2026"
      intro={<p>The short version: we collect only what Trybe needs, we never sell it, and you can delete it anytime.</p>}
      sections={SECTIONS}
    />
  );
}
