"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";
import { createBillet, updateBillet } from "./api";
import type { Billet } from "./types";

type BilletFormProps = {
  mode: "create" | "edit";
  billet?: Billet;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function BilletForm({ mode, billet }: BilletFormProps) {
  const router = useRouter();
  const { initialized, isAdmin, isAuthenticated, token } = useAuth();
  const [date, setDate] = useState(billet?.Date ?? getTodayDate());
  const [titre, setTitre] = useState(billet?.Titre ?? "");
  const [contenu, setContenu] = useState(billet?.Contenu ?? "");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setErrorMessage("Vous devez etre connecte.");
      return;
    }

    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      const savedBillet =
        mode === "create"
          ? await createBillet(token, { date, titre, contenu })
          : await updateBillet(token, billet!.id, { date, titre, contenu });
      const savedBilletId = Number(savedBillet.id);

      router.refresh();

      if (mode === "create") {
        // L'API ne renvoie pas toujours l'id du billet cree.
        // Dans ce cas, on revient a la liste plutot que d'aller sur /billets/undefined.
        router.push(
          Number.isFinite(savedBilletId) && savedBilletId > 0
            ? `/billets/${savedBilletId}`
            : "/",
        );
        return;
      }

      // En modification, on connait deja l'id grace a l'URL de la page.
      // On l'utilise donc meme si l'API ne le renvoie pas dans sa reponse.
      router.push(`/billets/${billet!.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Enregistrement impossible",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!initialized) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 shadow-sm">
        Verification de la session...
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-slate-700">
          Vous devez etre connecte pour administrer les billets.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-950 hover:bg-purple-200"
        >
          Connexion
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
        Acces reserve aux administrateurs.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Titre</span>
          <input
            type="text"
            value={titre}
            onChange={(event) => setTitre(event.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Contenu</span>
          <textarea
            value={contenu}
            onChange={(event) => setContenu(event.target.value)}
            required
            rows={8}
            className="mt-1 w-full resize-y rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-purple-950 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Enregistrement..."
            : mode === "create"
              ? "Creer le billet"
              : "Modifier le billet"}
        </button>

        <Link
          href={billet ? `/billets/${billet.id}` : "/"}
          className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
