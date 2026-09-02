"use client";

import { useEffect } from "react";
import { captureAnalytics } from "@/lib/analytics";

export function PublicReportAnalytics({ demo, status }: { demo: boolean; status: string }) {
  useEffect(() => {
    captureAnalytics("public_report_viewed", { demo, status });
  }, [demo, status]);

  return null;
}
