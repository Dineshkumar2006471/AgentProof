# Dodo Payments Beta Rollout

This document covers the payment work separately from the current mobile UI pass. Dodo stays in `test_mode` and free beta access remains available.

## Current Application Flow

```text
Landing plan CTA
  -> /pricing/checkout?plan=<plan>
  -> Cognito sign-in when required
  -> AgentProof order review
  -> Server-side Dodo checkout-session request
  -> Dodo hosted checkout
  -> Return to AgentProof
  -> Signed Dodo webhook
  -> Idempotent billing record and entitlement update
```

The browser return URL never grants access. Paid access is granted only after the signed webhook is accepted by the server.

## Dodo Dashboard Setup

1. Switch Dodo to test mode.
2. Create or copy a test API key.
3. Create a webhook endpoint:

   `https://agent-proof.dev/api/webhooks/dodo`

4. Copy the webhook signing secret.
5. Subscribe the endpoint to payment success and subscription lifecycle events.
6. Confirm the existing Builder, Agency, and One Run test products and their IDs.

Never commit either secret or paste them into chat, GitHub, the browser, or a `NEXT_PUBLIC_*` variable.

## Amplify Variables

In the `AgentProof` app, select the `main` branch and add these server-only values:

| Variable | Value |
| --- | --- |
| `DODO_PAYMENTS_API_KEY` | Dodo test API key |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo webhook signing secret |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` |
| `DODO_CHECKOUT_ENABLED` | `true` during approved billing tests |
| `DODO_TEST_USER_IDS` | Comma-separated Cognito `sub` values |

The product ID variables already belong to the shared pricing definition:

- `DODO_BUILDER_PRODUCT_ID`
- `DODO_AGENCY_PRODUCT_ID`
- `DODO_ONE_RUN_PRODUCT_ID`

Save the variables and start a new Amplify build. A rebuild is required because `amplify.yml` writes the variables into the SSR production environment during the build.

## Approved Test Users

`DODO_TEST_USER_IDS` accepts Cognito subject IDs, not emails and not display names. Start with one or two confirmed test accounts. Keep checkout gated while testing; do not remove the server-side gate to make the browser appear functional.

## Acceptance Tests

- Approved user can open Builder, Agency, and One Run checkout review screens.
- Approved user can open the Dodo hosted test checkout.
- Unapproved user receives the intentional checkout gate.
- Wrong product IDs return a safe provider error without exposing secrets.
- Successful payment creates one entitlement.
- Duplicate webhook delivery does not duplicate the entitlement.
- Subscription activation, renewal, update, cancellation, expiration, failure, and hold update billing state correctly.
- Invalid webhook signatures are rejected.
- Private account data never appears in the public report or browser source.
- Free beta access remains available when Dodo is disabled.

## Rollback

If checkout or webhook tests fail, set `DODO_CHECKOUT_ENABLED=false` in Amplify and redeploy. This disables paid checkout without affecting authentication, verification runs, reports, or free beta users.
