import { ArrowLeft, Check, Clock, Info, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StaffLayout } from "../../components/StaffLayout";
import { useApp } from "../../context/AppContext";
import { formatDateTime } from "../../lib/adapters";
import { PackageItem, PackageStatus } from "../../lib/types";

const DRAFT_KEY = "intertrack_staff_cadastrar_draft_v2";

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: "disponivel", label: "Disponível" },
];

type StaffDraft = {
  alunoId: string;
  nomeAluno: string;
  ra: string;
  codigo: string;
  status: PackageStatus;
};

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

function getAlternativeLabel(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const possibleNames = [record.nome_completo, record.nome, record.name];
  return possibleNames.find((name): name is string => typeof name === "string" && name.trim().length > 0)?.trim() ?? "";
}

function getAlternativeCategory(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const possibleCategories = [record.parentesco, record.categoria, record.category];
  return possibleCategories.find((category): category is string => typeof category === "string" && category.trim().length > 0)?.trim() ?? "";
}

export function StaffCadastrar() {
  const { addPackage, users, refreshUsers } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);

  // Relógio só para exibição (o horário gravado vem do servidor)
  useEffect(() => {
    refreshUsers().catch(() => toast.error("Não foi possível atualizar a lista de alunos."));
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  function getDefaultForm(): StaffDraft {
    return {
      alunoId: "",
      nomeAluno: "",
      ra: "",
      codigo: "",
      status: "disponivel" as PackageStatus,
    };
  }

  function getInitialForm(): StaffDraft {
    const fallback = getDefaultForm();
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw) as Partial<StaffDraft>;
      return {
        alunoId: parsed.alunoId ?? "",
        nomeAluno: parsed.nomeAluno ?? "",
        ra: parsed.ra ?? "",
        codigo: parsed.codigo ?? "",
        status: "disponivel",
      };
    } catch {
      return fallback;
    }
  }

  const [form, setForm] = useState<StaffDraft>(getInitialForm);

  // Rascunho do formulário (só conveniência, não guarda encomendas)
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  function handleChange<K extends keyof StaffDraft>(field: K, value: StaffDraft[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (submitting) return;
    if (!form.alunoId) return toast.error("Selecione um aluno cadastrado na lista de sugestões.");
    if (!form.codigo.trim()) return toast.error("Informe o código da encomenda.");

    const newPkg: PackageItem = {
      id: "",
      studentName: form.nomeAluno,
      ra: form.ra.trim(),
      codigo: form.codigo.trim(),
      status: form.status,
    };

    setSubmitting(true);
    const result = await addPackage(newPkg);
    setSubmitting(false);

    if (!result.ok) {
      // Mantém o formulário preenchido para o funcionário corrigir
      toast.error(result.error ?? "Não foi possível cadastrar a encomenda.");
      return;
    }

    toast.success("Encomenda cadastrada com sucesso!");
    setForm(getDefaultForm());
    localStorage.removeItem(DRAFT_KEY);
  }

  const searchLower = normalizeSearchText(form.nomeAluno);
  const suggestions = searchLower ? users.flatMap((student) => {
    if (student.ativo === false) return [];

    const results: Array<{
      student: typeof student;
      matchedName: string;
      matchedCategory?: string;
      isAlternative: boolean;
    }> = [];
    const primaryName = student.nome ?? student.name ?? "";

    if (normalizeSearchText(primaryName).includes(searchLower)) {
      results.push({ student, matchedName: primaryName, isAlternative: false });
    }

    if (Array.isArray(student.nomesAlternativos)) {
      (student.nomesAlternativos as unknown[]).forEach((item) => {
        const nameStr = getAlternativeLabel(item);
        const itemRecord = item && typeof item === "object" ? item as Record<string, unknown> : null;
        const isAuthorized = itemRecord?.tipo === "autorizado";
        const isActive = itemRecord?.ativo !== false;
        if (!isAuthorized && isActive && nameStr && normalizeSearchText(nameStr).includes(searchLower)) {
          results.push({
            student,
            matchedName: nameStr,
            matchedCategory: getAlternativeCategory(item),
            isAlternative: true
          });
        }
      });
    }

    return results;
  }) : [];

  function selectStudent(student: typeof users[number]) {
    setForm((prev) => ({ ...prev, alunoId: student.id, nomeAluno: student.nome ?? "", ra: student.ra ?? "" }));
    setStudentSearchOpen(false);
  }

  return (
    <StaffLayout>
      {/* Back + Title */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/funcionario")}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Voltar à Página Inicial
        </button>
      </div>
      <div className="mb-6 title-highlight">
        <h1 className="text-2xl font-bold text-gray-900">
          Cadastrar Nova Encomenda
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          Registre a chegada de uma nova encomenda no sistema
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Aluno com busca inteligente */}
          <div className="relative sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nome do aluno <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Digite o nome do aluno..." value={form.nomeAluno} onFocus={() => setStudentSearchOpen(true)} onChange={(e) => setForm((prev) => ({ ...prev, nomeAluno: e.target.value, alunoId: "", ra: "" }))} className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
            </div>
            {studentSearchOpen && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {suggestions.slice(0, 8).map(({ student, matchedName, matchedCategory, isAlternative }, index) => (
                  <button key={`${student.id}-${matchedName}-${index}`} type="button" onClick={() => selectStudent(student)} className="flex w-full flex-col gap-1 px-3 py-2.5 text-left text-sm hover:bg-blue-50">
                    <span className="font-medium text-gray-800">{matchedName}{isAlternative && <span className="font-normal text-gray-500">{matchedCategory ? ` (${matchedCategory})` : " (Nome Alternativo)"}</span>}</span>
                    <span className="text-xs text-gray-500">{isAlternative ? <>Aluno Titular: <strong>{student.nome ?? student.name}</strong> | </> : null}RA: {student.ra} | E-mail: {student.email}</span>
                  </button>
                ))}
              </div>
            )}
            {form.alunoId && <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><Check size={13} /> Aluno selecionado: RA {form.ra} · {users.find((student) => student.id === form.alunoId)?.email}</p>}
          </div>

          {/* RA preenchido automaticamente */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">RA do Aluno</label>
            <input type="text" value={form.ra} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mail do aluno</label>
            <input type="text" value={users.find((student) => student.id === form.alunoId)?.email ?? ""} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600" />
          </div>

          {/* Código */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Código da Encomenda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: ENC-2024-007"
              value={form.codigo}
              onChange={(e) => handleChange("codigo", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Data e hora de chegada (automática) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Data e hora de chegada
            </label>
            <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
              <Clock size={15} className="text-gray-400" />
              <span>{formatDateTime(now.toISOString())}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Registrada automaticamente no momento do cadastro.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status Inicial <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as PackageStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--unasp-orange)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Cadastrando..." : "Cadastrar Encomenda"}
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--panel-bg)] p-4">
        <Info size={16} className="mt-0.5 flex-shrink-0 text-[var(--accent-text)]" />
        <p className="text-sm text-[var(--muted-text)]">
          Após o cadastro, o aluno poderá visualizar sua encomenda no sistema.
          O aluno é localizado pelo RA informado.
        </p>
      </div>
    </StaffLayout>
  );
}