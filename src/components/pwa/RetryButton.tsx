"use client";

import Button from "@/components/ui/Button";

export default function RetryButton() {
  return (
    <Button fullWidth className="mt-2" onClick={() => window.location.reload()}>
      Try again
    </Button>
  );
}
