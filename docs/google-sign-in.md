# Google Sign-In Setup

AgentProof keeps email/password authentication available at all times. Google sign-in is an optional Cognito-hosted OAuth code flow and becomes visible only after the configuration below is complete.

## 1. Create Google OAuth Credentials

In Google Cloud Console, create or select a project, configure the OAuth consent screen, and create an OAuth client of type **Web application**.

Add this exact Google authorized redirect URI:

```text
https://agentproof-production-899640267626.auth.ap-south-1.amazoncognito.com/oauth2/idpresponse
```

Google redirects to Cognito first. Cognito then redirects to AgentProof at:

```text
https://agent-proof.dev/api/auth/google/callback
```

Do not add the AgentProof callback directly to Google Cloud Console.

## 2. Store Credentials In AWS Secrets Manager

Create a production secret in `ap-south-1` with this JSON shape:

```json
{
  "clientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
}
```

The secret must not be committed, pasted into chat, or stored in Amplify environment variables. Copy its ARN for the next step.

## 3. Deploy Cognito Configuration

In a local PowerShell session with the intended AWS SSO profile authenticated:

```powershell
$env:GOOGLE_OAUTH_SECRET_ARN = "YOUR_SECRETS_MANAGER_ARN"
$env:AGENTPROOF_APP_URL = "https://agent-proof.dev"
npm run infra:deploy:production
```

This creates the Cognito hosted-login domain, enables the authorization-code callback URL, and adds Google as an identity provider. The deployment output includes `CognitoHostedUiDomain`.

## 4. Enable The Button In Amplify

In the Amplify `main` branch environment variables, set:

```text
COGNITO_DOMAIN=<CognitoHostedUiDomain output>
NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED=true
```

Redeploy `main` after saving these values.

## 5. Verify

1. Open `https://agent-proof.dev/auth/sign-up`.
2. Accept the Terms and Privacy Policy, then choose **Continue with Google**.
3. Complete the Google consent flow and confirm the redirect reaches the requested workspace route.
4. Sign out, then use Google again from `/auth/sign-in`.
5. Confirm email/password sign-up, confirmation, sign-in, reset password, refresh, and sign-out still work.

Google sign-up records the same current Terms and Privacy Policy version as email/password sign-up. Do not enable the public button until the Cognito deployment and Amplify values are complete.
