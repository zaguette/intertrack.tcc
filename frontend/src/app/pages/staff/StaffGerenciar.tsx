import { ArrowLeft, Info, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StaffLayout } from "../../components/StaffLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../context/AppContext";
import { PackageStatus } from "../../lib/types";

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: "em_separacao", label: "Em Separacao" },
  { value: "disponivel", label: "Disponivel" },
  { value: "entregue", label: "Entregue" },
];

export function StaffGerenciar() {
  const { packages } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchBy = searchParams.get("by") === "ra" ? "ra" : "nome";
  const sortOrder = searchParams.get("order") === "antigos" ? "antigos" : "recentes";

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<PackageStatus | "todos">("todos");

  const filtered = useMemo(() => {
    const filteredItems = packages.filter((pkg) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchSearch =
        !normalizedSearch ||
        (searchBy === "nome"
          ? pkg.aluno.toLowerCase().includes(normalizedSearch)
          : pkg.ra.toLowerCase().includes(normalizedSearch));

      const matchStatus = statusFilter === "todos" || pkg.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return filteredItems.sort((a, b) => {
      if (sortOrder === "antigos") return a.dataChegada.localeCompare(b.dataChegada);
      return b.dataChegada.localeCompare(a.dataChegada);
    });
  }, [packages, search, statusFilter, searchBy, sortOrder]);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  return (
    <StaffLayout>
      <div className="mb-4">
        <button
          onClick={() => navigate("/funcionario")}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Voltar a Pagina Inicial
        </button>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Filtro de Encomendas</h1>

      <div className="mb-6 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchBy === "nome" ? "Buscar por nome..." : "Buscar por RA..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PackageStatus | "todos")}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition sm:w-52"
          >
            <option value="todos">Todos os status</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {filtered.length} {filtered.length === 1 ? "encomenda encontrada" : "encomendas encontradas"}
      </p>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={32} className="mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Nenhuma encomenda encontrada.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Codigo</th>
                  <th className="px-5 py-3 text-left font-semibold">Aluno</th>
                  <th className="px-5 py-3 text-left font-semibold">RA</th>
                  <th className="px-5 py-3 text-left font-semibold">Data</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">{pkg.codigo}</td>
                    <td className="px-5 py-4 text-gray-700">{pkg.aluno}</td>
                    <td className="px-5 py-4 text-gray-500">{pkg.ra}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-500">{formatDate(pkg.dataChegada)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={pkg.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          Esta tela e apenas para filtro e consulta. As acoes de editar status e excluir ficam na Pagina Inicial.
        </p>
      </div>
    </StaffLayout>
  );
}
