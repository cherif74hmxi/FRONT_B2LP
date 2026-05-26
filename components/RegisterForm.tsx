"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { registerUser } from "./api";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    if (password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Le back cree l'utilisateur en adherent par defaut.
      await registerUser(name, email, password);
      setSuccessMessage("Compte cree. Vous pouvez maintenant vous connecter.");

      // On renvoie vers la page de connexion pour garder le parcours simple.
      router.push("/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Inscription impossible",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Nom</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
          />
        </label>

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
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-purple-950 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creation..." : "Creer mon compte"}
        </button>

        <Link
          href="/login"
          className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
        >
          Deja un compte
        </Link>
      </div>
    </form>
  );
}
