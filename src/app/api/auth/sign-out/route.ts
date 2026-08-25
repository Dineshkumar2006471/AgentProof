import { jsonOk } from "@/lib/api";
import { signOut } from "@/lib/auth/cognito";
import { clearSession, getAccessToken } from "@/lib/auth/session";

export async function POST() {
  const token = await getAccessToken();
  if (token) await signOut(token).catch(() => undefined);
  await clearSession();
  return jsonOk({ signedOut: true });
}
