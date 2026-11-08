import type { Metadata } from "next";
import Link from "next/link";
import LegalDoc, { CONTACT_EMAIL, CONTACT_HREF, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for using Trybe: accounts, trading in person, your posts, and what Trybe is and isn't.",
};

// Terms of use (AUTH-03, SAFE-07). Draft: both founders sign off on the final
// text before launch. Minimum age is still an open decision (TRD section 21);
// 18 matches the sign up form for now.
const SECTIONS: LegalSection[] = [
  {
    id: "agreeing",
    title: "Agreeing to these terms",
    body: (
      <p>
        By creating an account or using Trybe, you agree to these terms and our{" "}
        <Link href="/guidelines">Community guidelines</Link>. If you don&apos;t agree, please don&apos;t use Trybe.
      </p>
    ),
  },
  {
    id: "who-can-use",
    title: "Who can use Trybe",
    body: (
      <ul>
        <li>You must be 18 or older.</li>
        <li>One account per person, with a real email you can verify.</li>
        <li>You&apos;re responsible for keeping your password safe and for what happens on your account.</li>
      </ul>
    ),
  },
  {
    id: "what-trybe-is",
    title: "What Trybe is, and isn't",
    body: (
      <>
        <p>
          Trybe helps people find each other to trade hobby gear. <strong>Trades happen between members</strong>, not
          with Trybe.
        </p>
        <ul>
          <li>We don&apos;t own, check, or ship any items.</li>
          <li>
            We don&apos;t hold or send money. Cash top-ups are agreed in the app and paid in person at the meetup.
          </li>
          <li>We don&apos;t guarantee that a trade will happen, or that an item is as described.</li>
          <li>Ratings, badges, and verified emails lower the risk. They don&apos;t remove it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "trading",
    title: "Trading fairly",
    body: (
      <ul>
        <li>Describe your gear honestly, with real photos and the right condition.</li>
        <li>Only offer things you own and are allowed to trade.</li>
        <li>Show up when you agree to meet, or cancel in the app.</li>
        <li>Meet in a public place and check items before you swap.</li>
        <li>Never ask for or send money before the meetup.</li>
      </ul>
    ),
  },
  {
    id: "your-content",
    title: "Your posts and photos",
    body: (
      <p>
        You own what you post. By posting, you let Trybe show it in the app and on our website so others can find it.
        This permission ends when you delete the post or your account. Don&apos;t post anything you don&apos;t have
        the right to share.
      </p>
    ),
  },
  {
    id: "not-allowed",
    title: "What's not allowed",
    body: (
      <p>
        Anything that breaks the <Link href="/guidelines">Community guidelines</Link>, including fake or stolen items,
        scams, harassment, and trying to get around Trybe&apos;s safety features. We may hide content or suspend
        accounts that break these rules, and we&apos;ll review reports as quickly as we can.
      </p>
    ),
  },
  {
    id: "ending",
    title: "Deleting your account",
    body: (
      <p>
        You can delete your account any time in Settings or on the <a href="/delete-account">account deletion page</a>
        . Any open trades are cancelled first, and your data is deleted as described in our{" "}
        <Link href="/privacy">Privacy notice</Link>.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility",
    body: (
      <p>
        Trybe is a student project offered as is. We work hard to keep it running and safe, but we can&apos;t promise
        it will always be available or error free. As far as the law allows, we&apos;re not responsible for trades,
        items, meetups, or anything that happens between members.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and the law",
    body: (
      <p>
        If we change these terms, we&apos;ll tell you in the app before they apply. These terms follow the laws of the
        Philippines. Questions? Email <a href={CONTACT_HREF} target="_blank" rel="noreferrer">{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of use"
      current="/terms"
      updated="November 8, 2026"
      intro={
        <p>
          The short version: be honest, trade in person, never pay ahead, and remember Trybe connects people but
          isn&apos;t part of the trade.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
