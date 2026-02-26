import { Calendar, Package, PackageCheck, PackageOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { StudentHeader } from "../../components/StudentHeader";
import { useApp } from "../../context/AppContext";

export function StudentDashboard() {
  const { user, packages } = useApp();
  const navigate = useNavigate();

  const myPackages = packages.filter((p) => p.ra === user?.ra);
  const total = myPackages.length;
  const disponivel = myPackages.filter((p) => p.status === "disponivel").length;
  const emSeparacao = myPackages.filter((p) => p.status === "em_separacao").length;

  const recent = myPackages.slice(0, 6);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader availableCount={disponivel} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.nome}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe suas encomendas pelo Correio Interno do UNASP
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total de Encomendas"
            value={total}
            icon={<Package size={22} className="text-blue-900" />}
            iconBg="bg-blue-100"
          />
          <StatCard
            title="Disponíveis"
            value={disponivel}
            icon={<PackageCheck size={22} className="text-green-700" />}
            iconBg="bg-green-100"
          />
          <StatCard
            title="Em Separação"
            value={emSeparacao}
            icon={<PackageOpen size={22} className="text-yellow-700" />}
            iconBg="bg-yellow-100"
          />
        </div>

        {/* Recent packages */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Minhas Encomendas</h2>
            <button
              onClick={() => navigate("/aluno/consultar")}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
            >
              Ver todas →
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700">Nenhuma encomenda</h3>
              <p className="mt-1 text-sm text-gray-400">
                Você não possui encomendas registradas no momento.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Código
                      </p>
                      <p className="mt-0.5 truncate text-base font-bold text-gray-900">
                        {pkg.codigo}
                      </p>
                    </div>
                    <Package size={20} className="mt-1 flex-shrink-0 text-blue-400" />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{formatDate(pkg.dataChegada)}</span>
                  </div>
                  <div className="mt-3">
                    <StatusBadge status={pkg.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
