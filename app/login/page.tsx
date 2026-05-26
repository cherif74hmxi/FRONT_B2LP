import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-cyan-700">Connexion</h1>
          <p className="mt-2 text-sm text-slate-600">
            Connectez-vous pour commenter ou administrer les billets.
          </p>
        </header>

        <LoginForm />
      </div>
    </main>
  );
}
