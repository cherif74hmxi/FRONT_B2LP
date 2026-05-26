import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-cyan-700">
            Inscription
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Creez un compte adherent pour pouvoir commenter les billets.
          </p>
        </header>

        <RegisterForm />
      </div>
    </main>
  );
}
