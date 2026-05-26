"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BilletForm from "@/components/BilletForm";
import { useAuth } from "@/components/AuthProvider";
import { fetchBillet } from "@/components/api";
import type { Billet } from "@/components/types";

type EditBilletClientProps = {
  id: string;
};

export default function EditBilletClient({ id }: EditBilletClientProps) {
  const { initialized, token } = useAuth();
  const [billet, setBillet] = useState<Billet>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    let isCurrentRequest = true;

    async function loadBillet() {
      setIsLoading(true);
      setErrorMessage(undefined);

      try {
        // La route GET /api/billets/{id} demande un token sur ton API.
        // On charge donc le billet cote navigateur, une fois la session connue.
        const nextBillet = await fetchBillet(id, token);

        if (isCurrentRequest) {
          setBillet(nextBillet);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setBillet(undefined);
          setErrorMessage(
            error instanceof Error ? error.message : "Erreur inconnue",
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadBillet();

    return () => {
      isCurrentRequest = false;
    };
  }, [id, initialized, token]);

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href={billet ? `/billets/${billet.id}` : "/"}
          className="inline-flex rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200"
        >
          Retour
        </Link>

        <header className="mb-6 mt-6">
          <h1 className="text-3xl font-semibold text-cyan-700">
            Modifier le billet
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Modification reservee aux administrateurs.
          </p>
        </header>

        {isLoading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 shadow-sm">
            Chargement du billet...
          </p>
        ) : errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Impossible de charger le billet</p>
            <p className="mt-1 text-sm">{errorMessage}</p>
            {errorMessage === "Unauthenticated." ? (
              <Link
                href="/login"
                className="mt-3 inline-flex rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-950 hover:bg-purple-200"
              >
                Se connecter
              </Link>
            ) : null}
          </div>
        ) : billet ? (
          <BilletForm mode="edit" billet={billet} />
        ) : null}
      </div>
    </main>
  );
}
