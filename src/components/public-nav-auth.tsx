"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileMenu } from "@/components/profile-menu";

type AuthIdentity = {
  name?: string;
  email?: string;
  username?: string;
};

export function PublicNavAuth() {
  const [user, setUser] = useState<AuthIdentity | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { user?: AuthIdentity } | null) => {
        if (mounted) {
          if (payload?.user) setUser(payload.user);
          setChecked(true);
        }
      })
      .catch(() => {
        if (mounted) setChecked(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!checked) {
    return (
      <Link className="hover:text-[var(--color-seal-indigo)]" href="/auth/sign-in">
        Sign in
      </Link>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link className="hover:text-[var(--color-seal-indigo)] font-bold text-[var(--color-seal-indigo)]" href="/dashboard">
          Dashboard
        </Link>
        <ProfileMenu user={user} />
      </div>
    );
  }

  return (
    <Link className="hover:text-[var(--color-seal-indigo)]" href="/auth/sign-in">
      Sign in
    </Link>
  );
}
