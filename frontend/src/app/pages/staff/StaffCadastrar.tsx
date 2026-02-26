import { ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StaffLayout } from "../../components/StaffLayout";
import { useApp } from "../../context/AppContext";
import { PackageItem, PackageStatus } from "../../lib/types";

const statusOptions: { value: PackageStatus; label: string }[] = [
  { value: "em_separacao", label: "Em Separação" },
  { value: "disponivel", label: "Disponível" },
  { value: "entregue", label: "Entregue" },
];

export function StaffCadastrar() {
  const { addPackage } = useApp();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    aluno: "",
    ra: "",
    codigo: "",
    dataChegada: today,
    status: "em_separacao" as PackageStatus,
  });
  const [success, setSuccess] = useState(false);

  function handleChange(field: keyof typeof form, value: string) {
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
    setForm({ aluno: "", ra: "", codigo: "", dataChegada: today, status: "em_separacao" });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
          Voltar ao Dashboard
        </button>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Cadastrar Nova Encomenda</h1>

      {/* Success banner */}
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          <span className="text-lg">✅</span>
          Encomenda cadastrada! O aluno será notificado quando o status for atualizado.
        </div>
      )}

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
              RA (Registro Acadêmico) <span className="text-red-500">*</span>
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
            <input
              type="date"
              value={form.dataChegada}
              onChange={(e) => handleChange("dataChegada", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status Inicial <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
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
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cadastrar Encomenda
          </button>
          <button
            onClick={() => navigate("/funcionario")}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 sm:flex-none sm:px-6"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          Após o cadastro, o aluno poderá visualizar sua encomenda no sistema.
          Quando o status for alterado para <strong>Disponível</strong>, o aluno
          será notificado para retirar.
        </p>
      </div>
    </StaffLayout>
  );
}
