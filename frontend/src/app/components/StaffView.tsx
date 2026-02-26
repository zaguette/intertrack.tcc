import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PackageItem } from "../lib/types";
import { formatDateTime, generateId } from "../lib/utils";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Trash2, PackageCheck, PackageOpen, Edit2 } from "lucide-react";

const statusLabels = {
  pending: "Aguardando processamento",
  available: "Disponível para retirada",
  collected: "Retirada",
} as const;

type StaffViewProps = {
  packages: PackageItem[];
  onPackagesChange: (items: PackageItem[]) => void;
  onNotifyAvailable: (item: PackageItem) => void;
};

export default function StaffView({
  packages,
  onPackagesChange,
  onNotifyAvailable,
}: StaffViewProps) {
  const [studentName, setStudentName] = useState("");
  const [code, setCode] = useState("");
  const [protocol, setProtocol] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PackageItem | null>(null);

  const pendingCount = packages.filter((item) => item.status === "pending").length;
  const availableCount = packages.filter((item) => item.status === "available").length;
  const collectedCount = packages.filter((item) => item.status === "collected").length;

  const grouped = useMemo(() => {
    return {
      pending: packages.filter((item) => item.status === "pending"),
      available: packages.filter((item) => item.status === "available"),
      collected: packages.filter((item) => item.status === "collected"),
    };
  }, [packages]);

  const filteredPackages = packages.filter((p) => {
    if (!search.trim()) return true;
    return p.studentName.toLowerCase().includes(search.trim().toLowerCase());
  });

  function handleCreateOrUpdate() {
    if (!studentName.trim() || !code.trim()) {
      toast.error("Preencha o nome do aluno e o código da encomenda.");
      return;
    }

    if (editingId) {
      const updated = packages.map((pkg) => {
        if (pkg.id === editingId) {
          return {
            ...pkg,
            studentName: studentName.trim(),
            code: code.trim(),
            protocol: protocol.trim() || undefined,
            description: description.trim() || undefined,
          };
        }
        return pkg;
      });
      onPackagesChange(updated);
      toast.success("Encomenda atualizada.");
      setEditingId(null);
      setStudentName("");
      setCode("");
      setProtocol("");
      setDescription("");
      return;
    }

    const newItem: PackageItem = {
      id: generateId(),
      studentName: studentName.trim(),
      code: code.trim(),
      protocol: protocol.trim() || undefined,
      description: description.trim() || undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    onPackagesChange([newItem, ...packages]);
    setStudentName("");
    setCode("");
    setProtocol("");
    setDescription("");
    toast.success("Encomenda cadastrada com sucesso.");
  }

  function startEdit(item: PackageItem) {
    setEditingId(item.id);
    setStudentName(item.studentName);
    setCode(item.code);
    setProtocol(item.protocol || "");
    setDescription(item.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setStudentName("");
    setCode("");
    setProtocol("");
    setDescription("");
  }

  function markAvailable(item: PackageItem) {
    const timestamp = new Date().toISOString();
    const updated: PackageItem[] = packages.map((pkg) => {
      if (pkg.id === item.id) {
        return {
          ...pkg,
          status: "available" as const,
          availableAt: timestamp,
        };
      }
      return pkg;
    });

    onPackagesChange(updated);
    toast.success("Encomenda marcada como disponível.");
    onNotifyAvailable({
      ...item,
      status: "available",
      availableAt: timestamp,
    });
  }

  function markUnavailable(item: PackageItem) {
    const updated: PackageItem[] = packages.map((pkg) => {
      if (pkg.id === item.id) {
        return {
          ...pkg,
          status: "pending",
          availableAt: undefined,
        };
      }
      return pkg;
    });
    onPackagesChange(updated);
    toast.success("Encomenda marcada como indisponível.");
  }

  function markCollected(item: PackageItem) {
    const timestamp = new Date().toISOString();
    const collectorName = "Administrador";
    const updated: PackageItem[] = packages.map((pkg) => {
      if (pkg.id === item.id) {
        return {
          ...pkg,
          status: "collected" as const,
          collectedAt: timestamp,
          collectedBy: collectorName,
        };
      }
      return pkg;
    });

    onPackagesChange(updated);
    toast.success(`Encomenda retirada por: ${collectorName} às ${formatDateTime(timestamp)}`);
  }

  function removeItem(item: PackageItem) {
    // abrir modal de confirmação em vez de usar confirm nativo
    setPendingDelete(item);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const updated = packages.filter((pkg) => pkg.id !== pendingDelete.id);
    onPackagesChange(updated);
    toast.success("Encomenda removida.");
    setPendingDelete(null);
  }

  function cancelDelete() {
    setPendingDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-unasp-navy text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {editingId ? "✏️ Editar Encomenda" : "➕ Cadastrar Nova Encomenda"}
            </h2>
            <p className="text-sm text-blue-200">
              {editingId ? "Altere os dados da encomenda e salve as mudanças" : "Registre a chegada de uma nova encomenda"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome do destinatário *"
              placeholder="Ex: João Silva"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
            <Input
              label="Código de rastreio *"
              placeholder="Ex: AMZ12345"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <Input
              label="Número de protocolo"
              placeholder="Opcional"
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
            />
          </div>

          <Textarea
            label="Descrição (opcional)"
            placeholder="Ex: Caixa Amazonas, Envelope Shopee, etc."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="flex justify-end">
            {editingId ? (
              <div className="flex gap-2">
                <Button onClick={handleCreateOrUpdate} className="gap-2">💾 Salvar alterações</Button>
                <Button variant="ghost" onClick={cancelEdit} className="gap-2">Cancelar edição</Button>
              </div>
            ) : (
              <Button onClick={handleCreateOrUpdate} className="gap-2">➕ Cadastrar Encomenda</Button>
            )}
           </div>
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Aguardando</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-700">Disponíveis</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">{availableCount}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-100 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Retiradas</p>
              <p className="mt-2 text-2xl font-bold text-slate-700">{collectedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="p-4">
          <Input
            label="Buscar por nome do destinatário"
            placeholder="Digite o nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Card>

        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((status) => (
          <div key={status} className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{statusLabels[status]}</h3>
              <Badge variant={status}>{grouped[status].length}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {grouped[status].length === 0 ? (
                <Card className="border-dashed text-sm text-slate-500">Nenhuma encomenda nesta categoria.</Card>
              ) : (
                grouped[status]
                  .filter((p) => filteredPackages.find((fp) => fp.id === p.id))
                  .map((item) => (
                    <Card key={item.id} className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">{item.studentName}</p>
                          <p className="text-lg font-semibold text-slate-900">{item.code}</p>
                        </div>
                        <Badge variant={item.status}>{statusLabels[item.status]}</Badge>
                      </div>

                      {item.description && <p className="text-sm text-slate-600">{item.description}</p>}

                      <div className="space-y-1 text-xs text-slate-500">
                        <p>Chegada: {formatDateTime(item.createdAt)}</p>
                        {item.availableAt && <p>Disponível: {formatDateTime(item.availableAt)}</p>}
                        {item.collectedAt && <p>Retirada: {formatDateTime(item.collectedAt)}</p>}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {item.status === "pending" && (
                          <>
                            <Button variant="secondary" onClick={() => markAvailable(item)} className="gap-2">
                              <PackageOpen size={16} />
                              Marcar como disponível
                            </Button>

                            <Button variant="ghost" onClick={() => startEdit(item)} className="gap-2">
                              <Edit2 size={16} />
                              Editar
                            </Button>
                          </>
                        )}

                        {item.status === "available" && (
                          <>
                            <Button variant="primary" onClick={() => markCollected(item)} className="gap-2">
                              <PackageCheck size={16} />
                              Marcar como retirada
                            </Button>

                            <Button variant="outline" onClick={() => markUnavailable(item)} className="gap-2">Indisponível</Button>

                            <Button variant="ghost" onClick={() => startEdit(item)} className="gap-2">
                              <Edit2 size={16} />
                              Editar
                            </Button>
                          </>
                        )}

                        <Button variant="ghost" onClick={() => removeItem(item)} className="gap-2 text-rose-500 hover:text-rose-600">
                          <Trash2 size={16} />
                          Excluir
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </div>
        ))}
        {pendingDelete && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <Card className="max-w-md w-full">
              <h3 className="text-lg font-semibold">Confirmar exclusão</h3>
              <p className="mt-2 text-sm text-slate-600">Tem certeza que deseja excluir a encomenda <strong>{pendingDelete.code}</strong> de <strong>{pendingDelete.studentName}</strong>? Esta ação não pode ser desfeita.</p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={cancelDelete}>Cancelar</Button>
                <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
