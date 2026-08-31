"use client";

import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ProfileIdentity = {
  name?: string;
  username?: string;
  email?: string;
};

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [identity, setIdentity] = useState<ProfileIdentity | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { user?: ProfileIdentity } | null) => {
        if (mounted && payload?.user) setIdentity(payload.user);
      })
      .catch(() => undefined);

    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      mounted = false;
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const accountName = identity?.name?.trim() || identity?.email?.split("@")[0]?.trim() || identity?.username?.trim() || "Account";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-outline-variant)] text-[var(--color-seal-indigo)] transition-colors hover:border-[var(--color-seal-indigo)] hover:bg-[var(--color-surface-container)] focus:outline-none focus:ring-2 focus:ring-[var(--color-seal-indigo)] focus:ring-offset-2"
      >
        <UserCircle size={20} strokeWidth={1.8} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-52 border border-[var(--color-ink-graphite)] bg-[var(--color-paper-cream)] p-2 shadow-[4px_4px_0_var(--color-ink-graphite)]">
          <div className="border-b border-[var(--color-outline-variant)] px-3 py-2">
            <span className="eyebrow">ACCOUNT</span>
            <p className="mono mt-1 truncate text-[var(--color-on-surface-variant)]" title={accountName}>{accountName}</p>
          </div>
          <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className="mt-2 block px-3 py-2 font-data-label text-xs uppercase text-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-seal-indigo)]">
            Profile
          </Link>
          <button role="menuitem" type="button" disabled={signingOut} onClick={handleSignOut} className="mt-1 flex w-full items-center gap-2 px-3 py-2 text-left font-data-label text-xs uppercase text-[var(--color-fail-clay)] hover:bg-[var(--color-surface-container)] disabled:cursor-wait disabled:opacity-60">
            <LogOut size={14} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
