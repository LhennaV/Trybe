"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import StatusPill from "@/components/ui/StatusPill";

export type QueuedReport = {
  id: string;
  target: string;
  targetHref: string;
  reason: string;
  details: string;
  reportedHandle: string;
  age: string;
};

type Resolution = "hidden" | "suspended" | "dismissed";

const RESOLUTION_LABELS: Record<Resolution, string> = {
  hidden: "Content hidden",
  suspended: "Account suspended",
  dismissed: "Dismissed",
};

// Report queue for admins (SAFE-04, SAFE-05). Admin access and the actions
// themselves are checked on the server; this page only lays them out.
export default function ReportQueue({ reports }: { reports: QueuedReport[] }) {
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const open = reports.filter((r) => !resolved[r.id]).length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-s text-ink-600">{open} open</p>
      <ul className="flex flex-col gap-3">
        {reports.map((report) => {
          const resolution = resolved[report.id];
          const resolve = (value: Resolution) => setResolved((all) => ({ ...all, [report.id]: value }));
          return (
            <li key={report.id} className="flex flex-col gap-2.5 rounded-card border-[1.5px] border-line bg-surface-white p-3.5">
              <div className="flex items-center gap-2">
                <p className="text-body-s font-bold text-ink-900">{report.reason}</p>
                <span className="ml-auto">
                  {resolution ? (
                    <StatusPill status="completed" label={RESOLUTION_LABELS[resolution]} />
                  ) : (
                    <StatusPill status="pending" label="Open" />
                  )}
                </span>
              </div>
              <p className="text-caption text-ink-600">
                {report.target} ·{" "}
                <Link href={report.targetHref} className="font-bold text-brand-plum underline">
                  @{report.reportedHandle}
                </Link>{" "}
                · {report.age}
              </p>
              {report.details && <p className="rounded-xl bg-brand-cream px-3 py-2 text-body-s text-ink-900">{report.details}</p>}
              {!resolution && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="px-3.5 py-2" onClick={() => resolve("hidden")}>
                    Hide content
                  </Button>
                  <Button variant="danger" className="px-3.5 py-2" onClick={() => resolve("suspended")}>
                    Suspend
                  </Button>
                  <Button variant="ghost" className="px-3.5 py-2" onClick={() => resolve("dismissed")}>
                    Dismiss
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
