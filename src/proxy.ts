import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/agents", "/profile"];

export function proxy(request: NextRequest) {
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/"));
  if (!isProtected) return NextResponse.next();
  if (request.cookies.has("agentproof-access-token")) return NextResponse.next();
  const signIn = new URL("/auth/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard/:path*", "/agents/:path*", "/profile/:path*"]
};
