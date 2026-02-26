import {
  Calendar,
  Package,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "../../components/StaffLayout";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../context/AppContext";

export function StaffDashboard() {
  const { packages } = useApp();
  const navigate = useNavigate();

  const total = packages.length;
  const disponivel = packages.filter((p) => p.status === "disponivel").length;
  const emSeparacao = packages.filter((p) => p.status === "em_separacao").length;
  const alunosUnicos = new Set(packages.map((p) => p.ra)).size;

  const recent = [...packages]
    .sort((a, b) => b.dataChegada.localeCompare(a.dataChegada))
    .slice(0, 5);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  return (
    <StaffLayout>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
      <p className="mb-6 text-sm text-gray-500">
        Visão geral do sistema de encomendas
      </p>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <StatCard
          title="Alunos Atendidos"
          value={alunosUnicos}
          icon={<Users size={22} className="text-purple-700" />}
          iconBg="bg-purple-100"
        />
      </div>

      {/* Recent packages table */}
      <div className="mb-8 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Encomendas Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package size={32} className="mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Nenhuma encomenda cadastrada.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Código</th>
                  <th className="px-6 py-3 text-left font-semibold">Aluno</th>
                  <th className="px-6 py-3 text-left font-semibold">RA</th>
                  <th className="px-6 py-3 text-left font-semibold">Data</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((pkg) => (
                  <tr key={pkg.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {pkg.codigo}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{pkg.aluno}</td>
                    <td className="px-6 py-4 text-gray-500">{pkg.ra}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {formatDate(pkg.dataChegada)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pkg.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <PackagePlus size={20} className="text-blue-900" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Cadastrar Nova Encomenda</h3>
          <p className="mt-1 text-sm text-gray-500">
            Registre a chegada de uma nova encomenda no sistema.
          </p>
          <button
            onClick={() => navigate("/funcionario/cadastrar")}
            className="mt-4 w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cadastrar Encomenda
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Package size={20} className="text-gray-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Gerenciar Encomendas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Atualize status, edite ou remova encomendas existentes.
          </p>
          <button
            onClick={() => navigate("/funcionario/gerenciar")}
            className="mt-4 w-full rounded-lg border border-blue-900 px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Gerenciar Encomendas
          </button>
        </div>
      </div>
    </StaffLayout>
  );
}
