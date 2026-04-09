import {
  Calendar,
  Check,
  Package,
  PackageCheck,
  PackagePlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StaffLayout } from "../../components/StaffLayout";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../context/AppContext";
import { PackageStatus } from "../../lib/types";

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: "disponivel", label: "Disponível" },
  { value: "entregue", label: "Entregue" },
];

export function StaffDashboard() {
  const { packages, updatePackage, deletePackage } = useApp();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<PackageStatus>("disponivel");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deliveryModalId, setDeliveryModalId] = useState<string | null>(null);
  const [collectorName, setCollectorName] = useState("");
  const [collectorRa, setCollectorRa] = useState("");

  const total = packages.length;
  const disponivel = packages.filter((p) => p.status === "disponivel").length;
  const entregues = packages.filter((p) => p.status === "entregue").length;
  const naoRetiradas = packages.filter((p) => p.status !== "entregue").length;

  const recent = [...packages]
    .sort((a, b) => b.dataChegada.localeCompare(a.dataChegada))
    .slice(0, 5);

  const pendingDeletePkg = packages.find((pkg) => pkg.id === confirmDeleteId);
  const deliveryPkg = packages.find((pkg) => pkg.id === deliveryModalId);

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  function handleEditStart(id: string, currentStatus: PackageStatus) {
    setEditingId(id);
    setEditingStatus(currentStatus);
  }

  function handleEditCancel() {
    setEditingId(null);
  }

  function handleEditSave(id: string) {
    if (editingStatus === "entregue") {
      setDeliveryModalId(id);
      return;
    }

    updatePackage(id, {
      status: editingStatus,
      dataRetirada: undefined,
      collectedAt: undefined,
      collectedBy: undefined,
      collectedByRa: undefined,
    });
    setEditingId(null);
    if (editingStatus === "disponivel") {
      toast.success("Status atualizado para Disponível! O aluno foi notificado.");
      return;
    }
    toast.success("Status atualizado com sucesso.");
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    deletePackage(confirmDeleteId);
    setConfirmDeleteId(null);
    toast.success("Encomenda removida com sucesso.");
  }

  function handleDeliveryConfirm() {
    if (!deliveryPkg) return;
    if (!collectorName.trim()) {
      toast.error("Informe o nome de quem retirou.");
      return;
    }
    if (!collectorRa.trim()) {
      toast.error("Informe o RA de quem retirou.");
      return;
    }

    const nowIso = new Date().toISOString();

    updatePackage(deliveryPkg.id, {
      status: "entregue",
      dataRetirada: nowIso.split("T")[0],
      collectedAt: nowIso,
      collectedBy: collectorName.trim(),
      collectedByRa: collectorRa.trim(),
    });

    toast.success(`Retirado por: ${collectorName.trim()} (RA: ${collectorRa.trim()}).`);
    setCollectorName("");
    setCollectorRa("");
    setDeliveryModalId(null);
    setEditingId(null);
  }

  return (
    <StaffLayout>
      {confirmDeleteId && pendingDeletePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja excluir a encomenda <strong>{pendingDeletePkg.codigo}</strong>?
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

      {deliveryModalId && deliveryPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar retirada</h3>
            <p className="mt-2 text-sm text-gray-600">
              Informe os dados de quem retirou a encomenda <strong>{deliveryPkg.codigo}</strong>.
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                placeholder="Nome de quem retirou"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="text"
                value={collectorRa}
                onChange={(e) => setCollectorRa(e.target.value)}
                placeholder="RA de quem retirou"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeliveryModalId(null);
                  setCollectorName("");
                  setCollectorRa("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeliveryConfirm}
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Confirmar entrega
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="mb-2 text-2xl font-bold text-gray-900">Página Inicial Administrativa</h1>
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
          title="Entregues"
          value={entregues}
          icon={<Package size={22} className="text-blue-700" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Não Retiradas"
          value={naoRetiradas}
          icon={<Package size={22} className="text-amber-700" />}
          iconBg="bg-amber-100"
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
                  <th className="px-6 py-3 text-left font-semibold">Ações</th>
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
                      {editingId === pkg.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value as PackageStatus)}
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
                    <td className="px-6 py-4">
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
                          onClick={() => setConfirmDeleteId(pkg.id)}
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

      {/* Quick actions */}
      <div className="grid gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <PackagePlus size={20} className="text-blue-900" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Cadastrar Nova Encomenda</h3>
          <p className="mt-2 text-base text-gray-500">
            Registre a chegada de uma nova encomenda no sistema.
          </p>
          <button
            onClick={() => navigate("/funcionario/cadastrar")}
            className="mt-6 w-full rounded-lg bg-blue-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cadastrar Encomenda
          </button>
        </div>
      </div>
    </StaffLayout>
  );
}
