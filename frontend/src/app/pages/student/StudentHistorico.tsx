import { CalendarDays, Clock3, UserRound } from "lucide-react";
import { StudentLayout } from "../../components/StudentLayout";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/ui/Card";

export function StudentHistorico() {
  const { packages, user } = useApp();
  const myPackages = packages.filter((pkg) => pkg.ra === user?.ra);

  function formatDate(date?: string) {
    if (!date) return "Pendente";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatTime(dateTime?: string) {
    if (!dateTime) return "Pendente";

    const parsed = new Date(dateTime);
    if (Number.isNaN(parsed.getTime())) return "Pendente";

    return parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <StudentLayout>
      <div className="mx-auto max-w-7xl px-0 py-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--app-text)]">Histórico de encomendas</h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Visualização detalhada com data de chegada, retirada, retirado por e horário.
          </p>
        </div>

        <div className="grid gap-4">
          {myPackages.map((pkg) => (
            <Card key={pkg.id} className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted-text)]">Código</p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--app-text)]">{pkg.codigo}</h2>
                  <p className="mt-2 text-sm text-[var(--muted-text)]">{pkg.aluno}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                      <CalendarDays size={16} />
                      Chegada
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-text)]">{pkg.dataChegada}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                      <Clock3 size={16} />
                      Retirada
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-text)]">{formatDate(pkg.dataRetirada)}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                      <UserRound size={16} />
                      Retirado por
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-text)]">
                      {pkg.collectedBy
                        ? `${pkg.collectedBy}${pkg.collectedByRa ? ` (RA: ${pkg.collectedByRa})` : ""}`
                        : "Pendente"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                      <Clock3 size={16} />
                      Horário
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-text)]">{formatTime(pkg.collectedAt)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
