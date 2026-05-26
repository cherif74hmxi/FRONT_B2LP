"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { deleteCommentaire } from "./api";

type DeleteCommentButtonProps = {
  commentaireId: number;
  onDeleted?: () => void;
};

export default function DeleteCommentButton({
  commentaireId,
  onDeleted,
}: DeleteCommentButtonProps) {
  const router = useRouter();
  const { isAdmin, token } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);
  // Pour supprimer, il faut absolument le vrai id du commentaire en base.
  const canDelete = Number.isFinite(commentaireId) && commentaireId > 0;

  async function handleDelete() {
    if (!canDelete) {
      // Si on arrive ici, le souci vient de la reponse API :
      // le commentaire existe, mais son id n'a pas ete renvoye au front.
      setErrorMessage(
        "Impossible de supprimer ce commentaire : l'API ne renvoie pas son id.",
      );
      return;
    }

    if (!token || !window.confirm("Supprimer ce commentaire ?")) {
      return;
    }

    setErrorMessage(undefined);
    setIsDeleting(true);

    try {
      await deleteCommentaire(token, commentaireId);
      // On retire le commentaire de l'affichage sans attendre un rechargement.
      onDeleted?.();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Suppression impossible",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Suppression..." : "Supprimer le commentaire"}
      </button>

      {errorMessage ? (
        <p className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
