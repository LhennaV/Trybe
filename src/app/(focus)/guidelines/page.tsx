import type { Metadata } from "next";
import DraftDocPage from "@/components/safety/DraftDocPage";

export const metadata: Metadata = { title: "Community guidelines" };

export default function GuidelinesPage() {
  return (
    <DraftDocPage title="Community guidelines">
      <h2>Be kind and honest</h2>
      <p>Describe gear as it really is, show up when you say you will, and be decent in chats.</p>
      <h2>Not allowed</h2>
      <ul>
        <li>Asking for payment before the meetup</li>
        <li>Fake, stolen, or unsafe items</li>
        <li>Harassment, hate, or explicit content</li>
        <li>Pushing people to chat off Trybe to get around the rules</li>
      </ul>
      <h2>Reporting</h2>
      <p>Report anything that breaks these rules. Reports are private and reviewed by the Trybe team.</p>
    </DraftDocPage>
  );
}
