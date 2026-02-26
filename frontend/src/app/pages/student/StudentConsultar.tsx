import { ArrowLeft, Calendar, Package, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { StudentHeader } from "../../components/StudentHeader";
import { useApp } from "../../context/AppContext";
import { PackageStatus } from "../../lib/types";

const statusOptions: { value: PackageStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "em_separacao", label: "Em Separação" },
  { value: "disponivel", label: "Disponível" },
  { value: "entregue", label: "Entregue" },
];

export function StudentConsultar() {
  const { user, packages } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PackageStatus | "todos">("todos");

  const myPackages = packages.filter((p) => p.ra === user?.ra);
  const disponivel = myPackages.filter((p) => p.status === "disponivel").length;

  const filtered = useMemo(() => {
    return myPackages.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.codigo.toLowerCase().includes(search.toLowerCase()) ||
        p.aluno.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "todos" || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [myPackages, search, statusFilter]);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader availableCount={disponivel} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back button + Title */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/aluno")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </button>
        </div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Consultar Encomendas</h1>

        {/* Filters */}
        <div className="mb-6 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código ou nome…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PackageStatus | "todos")}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition sm:w-48"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? "encomenda encontrada" : "encomendas encontradas"}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">Nenhuma encomenda encontrada</h3>
            <p className="mt-1 text-sm text-gray-400">
              Tente alterar os filtros de busca.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
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
                <div className="mt-4">
                  <StatusBadge status={pkg.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
