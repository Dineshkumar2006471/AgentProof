# Dodo Payments Live Rollout

Paid checkout remains disabled until this checklist is complete. Free public-beta access is unaffected.

## Live Setup

1. Complete Dodo live-account verification, tax, settlement, and invoice settings.
2. Create live Builder, Agency, and One-time products matching the shared plan definitions.
3. Configure `https://agent-proof.dev/api/webhooks/dodo` with payment and subscription lifecycle events.
4. Store the live API key and webhook key in Amplify branch variables. Never use `NEXT_PUBLIC_*` variables for payment secrets.
5. Set `DODO_PAYMENTS_ENVIRONMENT=live_mode`, product IDs, and `DODO_CHECKOUT_ENABLED=true`.

## Required Event Checks

- Successful Builder subscription grants Builder only after a signed webhook.
- One-time purchase grants exactly one credit after a signed webhook.
- Failed and cancelled payments grant no entitlement.
- Duplicate webhooks remain idempotent.
- Renewal, plan change, cancellation, expiry, failure, and hold update the server-side billing record correctly.
- Invalid webhook signatures return `401`.

## Rollback

Set `DODO_CHECKOUT_ENABLED=false` and redeploy to disable new paid checkout without affecting accounts, verification, reports, or free public-beta access.
