"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function SiteHeader() {
  const router = useRouter();
  const { initialized, isAdmin, isAuthenticated, logout, user } = useAuth();
  const userName = user?.nom ?? user?.name;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      router.refresh();
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-xl font-semibold text-purple-950">
            B2LP - le blog de Lyon Palme
          </Link>
          {initialized && user ? (
            <p className="mt-1 text-sm text-slate-500">
              Connecte en tant que {userName ?? user.email}
              {user.role ? ` (${user.role})` : ""}
            </p>
          ) : null}
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200"
          >
            Billets
          </Link>

          {isAdmin ? (
            <Link
              href="/admin/billets/new"
              className="rounded bg-cyan-100 px-3 py-1.5 text-sm font-medium text-cyan-900 hover:bg-cyan-200"
            >
              Nouveau billet
            </Link>
          ) : null}

          {initialized && isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-950 hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Deconnexion..." : "Deconnexion"}
            </button>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded bg-cyan-100 px-3 py-1.5 text-sm font-medium text-cyan-900 hover:bg-cyan-200"
              >
                Inscription
              </Link>
              <Link
                href="/login"
                className="rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-950 hover:bg-purple-200"
              >
                Connexion
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
