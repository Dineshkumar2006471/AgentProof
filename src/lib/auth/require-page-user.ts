import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export async function requirePageUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=" + encodeURIComponent(nextPath));
  return user;
}
