"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminPostActions from "@/components/AdminPostActions";
import CommentForm from "@/components/CommentForm";
import DeleteCommentButton from "@/components/DeleteCommentButton";
import { useAuth } from "@/components/AuthProvider";
import { fetchBillet } from "@/components/api";
import { type Billet, type Commentaire } from "@/components/types";

type BilletDetailProps = {
  id: string;
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

function getBilletAuthorName(auteur: Billet["Auteur"]): string {
  if (!auteur) {
    return "Auteur inconnu";
  }

  if (typeof auteur === "string") {
    return auteur;
  }

  return auteur.nom ?? auteur.email;
}

function getCommentAuthorName(commentaire: Commentaire): string {
  return (
    commentaire.Auteur ??
    commentaire.Utilisateur?.nom ??
    "Auteur inconnu"
  );
}

export default function BilletDetail({ id }: BilletDetailProps) {
  const { initialized, token } = useAuth();
  const [billet, setBillet] = useState<Billet>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const loadBillet = useCallback(async () => {
    if (!initialized) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      // Regle du site :
      // - visiteur : peut lire le billet et ses commentaires
      // - adherent/admin connecte : meme lecture + actions selon son role
      // Le token est donc optionnel ici.
      const nextBillet = await fetchBillet(id, token);

      setBillet(nextBillet);
    } catch (error) {
      setBillet(undefined);
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur inconnue",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, initialized, token]);

  useEffect(() => {
    loadBillet();
  }, [loadBillet]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200"
        >
          Retour aux billets
        </Link>

        {isLoading ? (
          <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
            Chargement du billet...
          </p>
        ) : errorMessage ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Impossible de charger le billet</p>
            <p className="mt-1 text-sm">
              Ce billet est momentanement indisponible. Reessayez plus tard ou
              retournez a la liste des billets.
            </p>
          </div>
        ) : billet ? (
          <>
            <article className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <header>
                <h1 className="text-3xl font-semibold text-cyan-600">
                  {billet.Titre}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Cree le {formatDate(billet.Date)} par{" "}
                  {getBilletAuthorName(billet.Auteur)}
                </p>
              </header>

              <p className="mt-5 text-slate-700">{billet.Contenu}</p>
              <AdminPostActions billetId={billet.id} />
            </article>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                Commentaires
              </h2>

              {billet.Commentaires && billet.Commentaires.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {billet.Commentaires.map((commentaire, index) => (
                    <li
                      key={commentaire.id || index}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-medium text-purple-900">
                        {getCommentAuthorName(commentaire)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(commentaire.Date)}
                      </p>
                      <p className="mt-3 text-slate-700">
                        {commentaire.Contenu}
                      </p>
                      <DeleteCommentButton
                        commentaireId={commentaire.id}
                        onDeleted={() => {
                          setBillet({
                            ...billet,
                            Commentaires: billet.Commentaires?.filter(
                              (commentaireToKeep) =>
                                commentaireToKeep.id !== commentaire.id,
                            ),
                          });
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-slate-700">
                  Aucun commentaire pour ce billet.
                </p>
              )}

              <CommentForm
                billetId={billet.id}
                onCreated={loadBillet}
              />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
