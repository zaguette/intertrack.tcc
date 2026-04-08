import { Mail, UserRound } from "lucide-react";
import { StudentLayout } from "../../components/StudentLayout";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/ui/Card";

export function StudentPerfil() {
  const { user, packages } = useApp();
  const myPackages = packages.filter((pkg) => pkg.ra === user?.ra);

  return (
    <StudentLayout>
      <div className="mx-auto max-w-4xl px-0 py-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--app-text)]">Perfil do aluno</h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Informações básicas e resumo da atividade do usuário.
          </p>
        </div>

        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 text-[var(--app-text)]">
              <UserRound size={26} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--app-text)]">{user?.nome}</h2>
              <p className="mt-1 text-sm text-[var(--muted-text)]">RA: {user?.ra}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-text)]">Encomendas</p>
              <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">{myPackages.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-text)]">Disponíveis</p>
              <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">{myPackages.filter((pkg) => pkg.status === "disponivel").length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-text)]">Contato</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-text)]">
                <Mail size={16} />
                Perfil institucional
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
