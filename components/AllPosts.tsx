"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { useAuth } from "./AuthProvider";
import { findBilletId } from "./api";
import type { Billet } from "./types";

type AllPostsProps = {
  apiUrl: string;
  billets: Billet[];
  errorMessage?: string;
};

function formatDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(parsedDate);
}

function getAuthorName(auteur: Billet["Auteur"]): string {
  if (!auteur) {
    return "Auteur inconnu";
  }

  if (typeof auteur === "string") {
    return auteur;
  }

  return auteur.nom ?? auteur.name ?? auteur.email;
}

export default function AllPosts({
  apiUrl,
  billets,
  errorMessage,
}: AllPostsProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [openErrorMessage, setOpenErrorMessage] = useState<string>();

  async function handleOpenBillet(
    event: MouseEvent<HTMLAnchorElement>,
    billet: Billet,
  ) {
    if (billet.hasRealId) {
      return;
    }

    event.preventDefault();
    setOpenErrorMessage(undefined);

    try {
      // L'API ne donne pas toujours l'id dans la liste.
      // On retrouve donc le vrai id avant d'ouvrir le billet.
      // Ca doit marcher aussi en visiteur si GET /api/billets/{id} est public.
      const realBilletId = await findBilletId(billet, token);

      router.push(`/billets/${realBilletId}`);
    } catch (error) {
      setOpenErrorMessage(
        error instanceof Error ? error.message : "Impossible d'ouvrir le billet",
      );
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-cyan-600">
            Liste des billets
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Donnees recuperees depuis <code>{apiUrl}</code>.
          </p>
        </header>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Impossible de charger les billets</p>
            <p className="mt-1 text-sm">{errorMessage}</p>
          </div>
        ) : billets.length === 0 ? (
          <p className="text-slate-700">Aucun billet trouve.</p>
        ) : (
          <>
            {openErrorMessage ? (
              <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {openErrorMessage}
              </p>
            ) : null}

            <ul className="space-y-4">
              {billets.map((billet, index) => (
                <li
                  key={`${billet.id}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-cyan-600">
                        {billet.Titre}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Cree le {formatDate(billet.Date)} par{" "}
                        {getAuthorName(billet.Auteur)}
                      </p>
                    </div>
                    <Link
                      href={`/billets/${billet.id}`}
                      onClick={(event) => handleOpenBillet(event, billet)}
                      className="inline-flex shrink-0 items-center justify-center rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-900 hover:bg-purple-200"
                    >
                      Voir le billet
                    </Link>
                  </div>

                  <p className="mt-3 text-slate-700">{billet.Contenu}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
