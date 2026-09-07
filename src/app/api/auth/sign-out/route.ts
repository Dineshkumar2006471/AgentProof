import { jsonOk } from "@/lib/api";
import { signOut } from "@/lib/auth/cognito";
import { clearSession, getAccessToken } from "@/lib/auth/session";
import { cognitoLogoutUrl } from "@/lib/auth/google";

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (token) await signOut(token).catch(() => undefined);
  await clearSession();
  const logoutUrl = cognitoLogoutUrl(request);
  return jsonOk({ signedOut: true, cognitoLogoutUrl: logoutUrl });
}
