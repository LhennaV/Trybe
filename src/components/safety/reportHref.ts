import type { ReportTarget } from "./ReportForm";

// Link to the report screen, coming back to `back` when done.
export function reportHref(type: ReportTarget, handle: string, back: string) {
  const params = new URLSearchParams({ type, handle, back });
  return `/report?${params.toString()}`;
}
