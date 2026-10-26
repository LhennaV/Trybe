import type { Metadata } from "next";
import DraftDocPage from "@/components/safety/DraftDocPage";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <DraftDocPage title="Terms of use">
      <h2>Using Trybe</h2>
      <p>Who can use Trybe, account rules, and what you agree to when you sign up.</p>
      <h2>Trades</h2>
      <p>Trades happen in person between members. Trybe doesn&apos;t hold payments, ship items, or guarantee a trade.</p>
      <h2>Your content</h2>
      <p>You own what you post. You give Trybe permission to show it in the app.</p>
      <h2>Ending your account</h2>
      <p>You can delete your account at any time from Settings or the account deletion page.</p>
    </DraftDocPage>
  );
}
