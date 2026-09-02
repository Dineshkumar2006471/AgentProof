"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsEnabled, captureAnalytics, identifyAnalytics, initializeAnalytics } from "@/lib/analytics";

type AnalyticsUser = { sub?: string };

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!analyticsEnabled()) return;
    initializeAnalytics();
    captureAnalytics("page_viewed", { path: pathname });
  }, [pathname]);

  useEffect(() => {
    if (!analyticsEnabled()) return;
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { user?: AnalyticsUser } | null) => {
        if (active && payload?.user?.sub) identifyAnalytics(payload.user.sub);
      })
      .catch(() => undefined);

    return () => { active = false; };
  }, [pathname]);

  return children;
}
