import { ArrowLeft, Check, Info, Pencil, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StaffLayout } from "../../components/StaffLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../context/AppContext";
import { PackageStatus } from "../../lib/types";

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: "em_separacao", label: "Em Separação" },
  { value: "disponivel", label: "Disponível" },
  { value: "entregue", label: "Entregue" },
];

export function StaffGerenciar() {
  const { packages, updatePackage, deletePackage } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PackageStatus | "todos">("todos");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<PackageStatus>("em_separacao");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.codigo.toLowerCase().includes(search.toLowerCase()) ||
        p.aluno.toLowerCase().includes(search.toLowerCase()) ||
        p.ra.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "todos" || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [packages, search, statusFilter]);

  function handleEditStart(id: string, currentStatus: PackageStatus) {
    setEditingId(id);
    setEditingStatus(currentStatus);
  }

  function handleEditSave(id: string) {
    updatePackage(id, { status: editingStatus });
    setEditingId(null);
    toast.success("Status atualizado! O aluno foi notificado.");
  }

  function handleEditCancel() {
    setEditingId(null);
  }

  function handleDeleteRequest(id: string) {
    setConfirmDeleteId(id);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    deletePackage(confirmDeleteId);
    setConfirmDeleteId(null);
    toast.success("Encomenda removida com sucesso.");
  }

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  const pendingDeletePkg = packages.find((p) => p.id === confirmDeleteId);

  return (
    <StaffLayout>
      {/* Delete Confirm Modal */}
      {confirmDeleteId && pendingDeletePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja excluir a encomenda{" "}
              <strong>{pendingDeletePkg.codigo}</strong> de{" "}
              <strong>{pendingDeletePkg.aluno}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back + Title */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/funcionario")}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </button>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Gerenciar Encomendas</h1>

      {/* Filters */}
      <div className="mb-6 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código, aluno ou RA…"
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

      {/* Results count */}
      <p className="mb-4 text-sm text-gray-500">
        {filtered.length}{" "}
        {filtered.length === 1 ? "encomenda encontrada" : "encomendas encontradas"}
      </p>

      {/* Table */}
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
                  <th className="px-5 py-3 text-left font-semibold">Código</th>
                  <th className="px-5 py-3 text-left font-semibold">Aluno</th>
                  <th className="px-5 py-3 text-left font-semibold">RA</th>
                  <th className="px-5 py-3 text-left font-semibold">Data</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                      {pkg.codigo}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{pkg.aluno}</td>
                    <td className="px-5 py-4 text-gray-500">{pkg.ra}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                      {formatDate(pkg.dataChegada)}
                    </td>
                    <td className="px-5 py-4">
                      {editingId === pkg.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingStatus}
                            onChange={(e) =>
                              setEditingStatus(e.target.value as PackageStatus)
                            }
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleEditSave(pkg.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                            title="Salvar"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={pkg.status} />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {editingId !== pkg.id && (
                          <button
                            onClick={() => handleEditStart(pkg.id, pkg.status)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            title="Editar status"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRequest(pkg.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          Ao alterar o status de uma encomenda para <strong>Disponível</strong>, o aluno
          correspondente será notificado automaticamente pelo sistema.
        </p>
      </div>
    </StaffLayout>
  );
}
