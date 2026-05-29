import { ArrowLeft, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StaffLayout } from "../../components/StaffLayout";
import { BrazilianDatePicker } from "../../components/ui/BrazilianDatePicker";
import { useApp } from "../../context/AppContext";
import { PackageItem, PackageStatus } from "../../lib/types";

const DRAFT_KEY = "intertrack_staff_cadastrar_draft_v1";

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: "disponivel", label: "Disponível" },
  { value: "entregue", label: "Entregue" },
];

type StaffDraft = {
  aluno: string;
  ra: string;
  codigo: string;
  dataChegada: string;
  status: PackageStatus;
};

export function StaffCadastrar() {
  const { addPackage } = useApp();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  function getDefaultForm(): StaffDraft {
    return {
      aluno: "",
      ra: "",
      codigo: "",
      dataChegada: today,
      status: "disponivel" as PackageStatus,
    };
  }

  function getInitialForm(): StaffDraft {
    const fallback = getDefaultForm();
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw) as {
        aluno?: string;
        ra?: string;
        codigo?: string;
        dataChegada?: string;
        status?: PackageStatus;
      };

      return {
        aluno: parsed.aluno ?? "",
        ra: parsed.ra ?? "",
        codigo: parsed.codigo ?? "",
        dataChegada: parsed.dataChegada || today,
        status: parsed.status === "entregue" ? "entregue" : "disponivel",
      };
    } catch {
      return fallback;
    }
  }

  const [form, setForm] = useState<StaffDraft>(getInitialForm);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  function handleChange<K extends keyof StaffDraft>(field: K, value: StaffDraft[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.aluno.trim()) return toast.error("Informe o nome do aluno.");
    if (!form.ra.trim()) return toast.error("Informe o RA do aluno.");
    if (!form.codigo.trim()) return toast.error("Informe o código da encomenda.");
    if (!form.dataChegada) return toast.error("Informe a data de chegada.");

    const newPkg: PackageItem = {
      id: crypto.randomUUID(),
      aluno: form.aluno.trim(),
      ra: form.ra.trim(),
      codigo: form.codigo.trim(),
      dataChegada: form.dataChegada,
      status: form.status,
    };

    addPackage(newPkg);
    toast.success("Encomenda cadastrada com sucesso!");

    // Reset form
    const resetForm = getDefaultForm();
    setForm(resetForm);
    localStorage.removeItem(DRAFT_KEY);
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
        <h1 className="text-2xl font-bold text-gray-900">Cadastrar Nova Encomenda</h1>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Nome do Aluno */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nome do Aluno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={form.aluno}
              onChange={(e) => handleChange("aluno", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* RA */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              RA do Aluno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: 123456"
              value={form.ra}
              onChange={(e) => handleChange("ra", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
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

          {/* Data de Chegada */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Data de Chegada <span className="text-red-500">*</span>
            </label>
            <BrazilianDatePicker
              value={form.dataChegada}
              onChange={(value) => handleChange("dataChegada", value)}
            />
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
            className="w-full rounded-lg bg-[var(--unasp-orange)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Cadastrar Encomenda
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--panel-bg)] p-4">
        <Info size={16} className="mt-0.5 flex-shrink-0 text-[var(--accent-text)]" />
        <p className="text-sm text-[var(--muted-text)]">
          Após o cadastro, o aluno poderá visualizar sua encomenda no sistema.
          Quando o status for alterado para <strong>Disponível</strong>, o aluno
          será notificado para retirar.
        </p>
      </div>
    </StaffLayout>
  );
}
