"use client";

import posthog from "posthog-js";

type AnalyticsValue = string | number | boolean | undefined;

export type AnalyticsEvent =
  | "page_viewed"
  | "account_signed_up"
  | "account_confirmed"
  | "account_signed_in"
  | "agent_created"
  | "contract_drafted"
  | "test_matrix_generated"
  | "verification_started"
  | "public_report_viewed"
  | "checkout_started";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
let initialized = false;

export function analyticsEnabled() {
  return Boolean(posthogKey);
}

export function initializeAnalytics() {
  if (!posthogKey || initialized) return;

  posthog.init(posthogKey, {
    api_host: posthogHost,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: "identified_only"
  });
  initialized = true;
}

export function captureAnalytics(event: AnalyticsEvent, properties: Record<string, AnalyticsValue> = {}) {
  initializeAnalytics();
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyAnalytics(subject: string) {
  initializeAnalytics();
  if (!initialized || !subject.trim()) return;
  posthog.identify(subject);
}

export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}
