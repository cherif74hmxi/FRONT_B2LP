"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function LoginForm() {
  const router = useRouter();
  const { initialized, isAuthenticated, login, user } = useAuth();
  const userName = user?.nom;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.refresh();
      router.push("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Connexion impossible",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (initialized && isAuthenticated) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-medium text-slate-900">
          Vous etes deja connecte{userName ? ` : ${userName}` : ""}.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-950 hover:bg-purple-200"
        >
          Retour aux billets
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Mot de passe
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !initialized}
        className="mt-5 inline-flex rounded bg-purple-950 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>

      <p className="mt-4 text-sm text-slate-700">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-medium text-purple-950 hover:underline"
        >
          Creer un compte
        </Link>
      </p>
    </form>
  );
}
