import { Check, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StudentLayout } from "../../components/StudentLayout";
import { useApp } from "../../context/AppContext";
import { AuthorizedName } from "../../lib/types";

type NameSectionProps = {
  title: string;
  description: string;
  names: AuthorizedName[];
  canToggle: boolean;
  showRelationship: boolean;
  newName: string;
  relationship: AuthorizedName["parentesco"];
  onNameChange: (value: string) => void;
  onRelationshipChange: (value: AuthorizedName["parentesco"]) => void;
  onAdd: () => void;
  onToggle: (name: AuthorizedName) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, nome: string, parentesco: AuthorizedName["parentesco"]) => Promise<void>;
};

function NameSection({ title, description, names, canToggle, showRelationship, newName, relationship, onNameChange, onRelationshipChange, onAdd, onToggle, onRemove, onUpdate }: NameSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingRelationship, setEditingRelationship] = useState<AuthorizedName["parentesco"]>("outro");

  function startEditing(name: AuthorizedName) {
    setEditingId(name.id);
    setEditingName(name.nome_completo);
    setEditingRelationship(name.parentesco);
  }

  async function saveEditing() {
    if (!editingId || !editingName.trim()) return;
    await onUpdate(editingId, editingName.trim(), editingRelationship);
    setEditingId(null);
  }

  return <section className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
    <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-[var(--app-text)]">{title}</h2><p className="mt-1 text-xs text-[var(--muted-text)]">{description}</p></div><UserRound size={17} className="text-[var(--muted-text)]" /></div>
    <div className={`mt-4 grid gap-2 ${showRelationship ? "sm:grid-cols-[1fr_150px_auto]" : "sm:grid-cols-[1fr_auto]"}`}><input value={newName} onChange={(event) => onNameChange(event.target.value)} placeholder="Nome completo" className="rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--app-text)]" />{showRelationship && <select value={relationship} onChange={(event) => onRelationshipChange(event.target.value as AuthorizedName["parentesco"])} className="rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--app-text)]"><option value="outro">Outro</option><option value="pai">Pai</option><option value="mae">Mãe</option><option value="irmao">Irmão</option><option value="irma">Irmã</option><option value="responsavel">Responsável</option></select>}<button onClick={onAdd} className="inline-flex items-center justify-center gap-1 rounded-lg bg-[var(--unasp-orange)] px-3 py-2 text-sm font-semibold text-white"><Plus size={15} /> Adicionar</button></div>
    <div className="mt-4 space-y-2">{names.length === 0 && <p className="text-sm text-[var(--muted-text)]">Nenhum nome cadastrado.</p>}{names.map((name) => <div key={name.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-3 py-2">{editingId === name.id ? <div className="flex min-w-0 flex-1 flex-wrap gap-2"><input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="min-w-[180px] flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-2 py-1 text-sm text-[var(--app-text)]" />{showRelationship && <select value={editingRelationship} onChange={(event) => setEditingRelationship(event.target.value as AuthorizedName["parentesco"])} className="rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-2 py-1 text-sm text-[var(--app-text)]"><option value="outro">Outro</option><option value="pai">Pai</option><option value="mae">Mãe</option><option value="irmao">Irmão</option><option value="irma">Irmã</option><option value="responsavel">Responsável</option></select>}<button onClick={saveEditing} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" title="Salvar"><Check size={15} /></button><button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Cancelar"><X size={15} /></button></div> : <><div><p className="text-sm font-medium text-[var(--app-text)]">{name.nome_completo}</p><p className="text-xs capitalize text-[var(--muted-text)]">{name.parentesco}</p></div><div className="flex items-center gap-2"><button onClick={() => startEditing(name)} className="rounded-lg p-1.5 text-[var(--muted-text)] hover:bg-black/5" title="Editar"><Pencil size={15} /></button>{canToggle && <button onClick={() => onToggle(name)} className={`rounded-full px-3 py-1 text-xs font-semibold ${name.ativo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{name.ativo ? "Autorizado" : "Não autorizado"}</button>}<button onClick={() => onRemove(name.id)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" title="Remover"><Trash2 size={15} /></button></div></>}</div>)}</div>
  </section>;
}

export function StudentNomesAutorizados({ section }: { section: AuthorizedName["tipo"] }) {
  const { user, getAuthorizedNames, addAuthorizedName, updateAuthorizedName, removeAuthorizedName } = useApp();
  const [authorizedNames, setAuthorizedNames] = useState<AuthorizedName[]>([]);
  const [alternativeNames, setAlternativeNames] = useState<AuthorizedName[]>([]);
  const [alternativeName, setAlternativeName] = useState("");
  const [authorizedName, setAuthorizedName] = useState("");
  const [relationship, setRelationship] = useState<AuthorizedName["parentesco"]>("outro");

  async function reloadNames() {
    if (user?.id) {
      const names = await getAuthorizedNames(user.id);
      setAlternativeNames(names.filter((name) => name.tipo === "alternativo"));
      setAuthorizedNames(names.filter((name) => name.tipo === "autorizado"));
    }
  }

  useEffect(() => {
    reloadNames().catch(() => toast.error("Não foi possível carregar os nomes autorizados."));
  }, [user?.id]);

  async function handleAdd(tipo: AuthorizedName["tipo"]) {
    const name = tipo === "alternativo" ? alternativeName : authorizedName;
    if (!user?.id || !name.trim()) {
      toast.error("Informe um nome.");
      return;
    }
    const result = await addAuthorizedName(user.id, { nome_completo: name.trim(), parentesco: relationship, tipo, ativo: true });
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível cadastrar a autorização.");
      return;
    }
    await reloadNames();
    if (tipo === "alternativo") setAlternativeName("");
    else setAuthorizedName("");
    toast.success(tipo === "autorizado" ? "Pessoa autorizada cadastrada." : "Nome alternativo cadastrado.");
  }

  async function handleToggle(name: AuthorizedName) {
    if (!user?.id) return;
    const result = await updateAuthorizedName(user.id, name.id, { ativo: !name.ativo, tipo: "autorizado" });
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível atualizar a autorização.");
      return;
    }
    await reloadNames();
  }

  async function handleRemove(nameId: string) {
    if (!user?.id) return;
    const result = await removeAuthorizedName(user.id, nameId);
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível remover o nome.");
      return;
    }
    await reloadNames();
  }

  async function handleUpdate(id: string, nome: string, parentesco: AuthorizedName["parentesco"]) {
    if (!user?.id) return;
    const result = await updateAuthorizedName(user.id, id, { nome_completo: nome, parentesco });
    if (!result.ok) toast.error(result.error ?? "Não foi possível editar o nome.");
    else await reloadNames();
  }

  return (
    <StudentLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--app-text)]">{section === "alternativo" ? "Nomes alternativos" : "Nomes autorizados"}</h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">{section === "alternativo" ? "Cadastre variações do seu nome usadas nas etiquetas de encomendas." : "Cadastre pessoas autorizadas a retirar suas encomendas."}</p>
        </div>

        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--panel-bg)] p-4 sm:p-6">
          {section === "alternativo" && <NameSection title="Nomes alternativos" description="Variações usadas em Shein, Shopee, Mercado Livre ou nomes de familiares impressos na etiqueta." names={alternativeNames} canToggle={false} showRelationship newName={alternativeName} relationship={relationship} onNameChange={setAlternativeName} onRelationshipChange={setRelationship} onAdd={() => handleAdd("alternativo")} onToggle={handleToggle} onRemove={handleRemove} onUpdate={handleUpdate} />}
          {section === "autorizado" && <NameSection title="Pessoas autorizadas" description="Amigos, parentes ou colegas de quarto autorizados a retirar suas encomendas." names={authorizedNames} canToggle showRelationship={false} newName={authorizedName} relationship="outro" onNameChange={setAuthorizedName} onRelationshipChange={setRelationship} onAdd={() => handleAdd("autorizado")} onToggle={handleToggle} onRemove={handleRemove} onUpdate={handleUpdate} />}
        </div>
      </div>
    </StudentLayout>
  );
}
