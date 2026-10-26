import type { Metadata } from "next";
import ReportQueue, { type QueuedReport } from "@/components/safety/ReportQueue";

export const metadata: Metadata = { title: "Report queue", robots: { index: false } };

// Sample reports until GET /api/admin/reports exists. The route will be
// admin-only once roles are in place (Phase 5, backend).
const SAMPLE_QUEUE: QueuedReport[] = [
  {
    id: "r1",
    target: "User",
    targetHref: "/users/kiln.and.co",
    reason: "Asked me to pay before meeting",
    details: 'Asked me to send a PHP 500 "reservation fee" through GCash before Saturday.',
    reportedHandle: "thrift.n.tinker",
    age: "1h ago",
  },
  {
    id: "r2",
    target: "Post",
    targetHref: "/posts/pentax-k1000",
    reason: "Fake, stolen, or unsafe item",
    details: "",
    reportedHandle: "quickflip.ph",
    age: "Yesterday",
  },
  {
    id: "r3",
    target: "Trade",
    targetHref: "/trades/yashica-wheel",
    reason: "Didn't show up to the meetup",
    details: "Waited 40 minutes at Trinoma.",
    reportedHandle: "quickflip.ph",
    age: "Oct 22",
  },
];

export default function AdminReportsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-3.5 px-4 py-6">
      <h1 className="font-display text-display-l text-brand-plum">Report queue</h1>
      <ReportQueue reports={SAMPLE_QUEUE} />
    </main>
  );
}
