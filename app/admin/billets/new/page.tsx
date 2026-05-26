import BilletForm from "@/components/BilletForm";

export default function NewBilletPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-cyan-700">
            Nouveau billet
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Creation reservee aux administrateurs.
          </p>
        </header>

        <BilletForm mode="create" />
      </div>
    </main>
  );
}
