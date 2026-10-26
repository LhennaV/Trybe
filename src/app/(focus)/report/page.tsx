import type { Metadata } from "next";
import { Suspense } from "react";
import ReportForm, { type ReportTarget } from "@/components/safety/ReportForm";

export const metadata: Metadata = {
  title: "Report",
  robots: { index: false },
};

const TARGETS: ReportTarget[] = ["user", "post", "trade", "review", "message"];

// /report?type=user&handle=kiln.and.co&back=/users/kiln.and.co
// One report screen for every kind of target (SAFE-01).
export default function ReportPage(props: PageProps<"/report">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md" aria-busy="true" />}>
      <Report searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Report({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const type = first(params.type);
  const target = TARGETS.includes(type as ReportTarget) ? (type as ReportTarget) : "user";
  const handle = first(params.handle) ?? "this user";
  // Only allow going back inside the app.
  const back = first(params.back);
  const backHref = back?.startsWith("/") && !back.startsWith("//") ? back : "/";

  return <ReportForm target={target} handle={handle} backHref={backHref} />;
}
