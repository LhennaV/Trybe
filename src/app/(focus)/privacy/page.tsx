import type { Metadata } from "next";
import DraftDocPage from "@/components/safety/DraftDocPage";

export const metadata: Metadata = { title: "Privacy notice" };

// Plain-language privacy notice (Philippines Data Privacy Act, TRD section 15).
export default function PrivacyPage() {
  return (
    <DraftDocPage title="Privacy notice">
      <h2>What we collect</h2>
      <ul>
        <li>Email, display name, handle, profile photo, bio, and city</li>
        <li>Your hobbies, posts, photos, gear, trades, messages, and ratings</li>
        <li>Reports you send, and basic device and error data</li>
      </ul>
      <p>We don&apos;t collect payment details, your exact location, or your contacts. Photo location data is removed on upload.</p>
      <h2>Why</h2>
      <p>To run your account, show your posts, and make trades work.</p>
      <h2>How long</h2>
      <p>Retention periods will be listed here.</p>
      <h2>Your rights</h2>
      <p>You can see, fix, or delete your data. Delete your account any time from Settings.</p>
    </DraftDocPage>
  );
}
