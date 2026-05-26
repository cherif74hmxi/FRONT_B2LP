"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { deleteBillet } from "./api";

type AdminPostActionsProps = {
  billetId: number;
};

export default function AdminPostActions({ billetId }: AdminPostActionsProps) {
  const router = useRouter();
  const { isAdmin, token } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!token || !window.confirm("Supprimer ce billet ?")) {
      return;
    }

    setErrorMessage(undefined);
    setIsDeleting(true);

    try {
      await deleteBillet(token, billetId);
      router.refresh();
      router.push("/");
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
    <div className="mt-5 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/billets/${billetId}/edit`}
          className="rounded bg-cyan-100 px-3 py-1.5 text-sm font-medium text-cyan-900 hover:bg-cyan-200"
        >
          Modifier
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
