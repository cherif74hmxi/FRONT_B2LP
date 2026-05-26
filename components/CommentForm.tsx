"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";
import { createCommentaire } from "./api";

type CommentFormProps = {
  billetId: number;
  onCreated?: () => void;
};

export default function CommentForm({ billetId, onCreated }: CommentFormProps) {
  const router = useRouter();
  const { initialized, isAuthenticated, token, user } = useAuth();
  const [contenu, setContenu] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !user) {
      setErrorMessage("Vous devez etre connecte.");
      return;
    }

    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    try {
      // On passe aussi l'id du billet et l'id de l'utilisateur, car la route API
      // est POST /api/commentaires et non POST /api/billets/{id}/commentaires.
      await createCommentaire(token, billetId, user.id, contenu);

      setContenu("");
      setSuccessMessage("Commentaire ajoute.");

      // Le POST /api/commentaires ne renvoie pas toujours toutes les infos
      // du commentaire (auteur, id, etc.). On demande donc a la page de
      // recharger le billet complet pour afficher un commentaire propre.
      onCreated?.();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Ajout impossible",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!initialized) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {/* Visiteur : lecture seule. Il voit les billets/commentaires, mais ne commente pas. */}
        <p className="text-sm text-slate-700">
          Connectez-vous pour ajouter un commentaire.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-flex rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-950 hover:bg-purple-200"
        >
          Connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <label className="block">
        <span className="text-sm font-medium text-slate-800">
          Ajouter un commentaire
        </span>
        <textarea
          value={contenu}
          onChange={(event) => setContenu(event.target.value)}
          required
          rows={4}
          className="mt-2 w-full resize-y rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600"
        />
      </label>

      {errorMessage ? (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded bg-purple-950 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Envoi..." : "Publier le commentaire"}
      </button>
    </form>
  );
}
