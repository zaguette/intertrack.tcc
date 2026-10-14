import { Eye, Power, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StaffLayout } from "../../components/StaffLayout";
import { useApp } from "../../context/AppContext";

export function StaffAlunos() {
  const { users, toggleUserStatus, getAuthorizedNames } = useApp();
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [confirmStudentId, setConfirmStudentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filteredStudents = users.filter((student) => {
    const query = search.trim().toLocaleLowerCase();
    return !query || [student.nome, student.ra, student.email].some((value) =>
      (value ?? "").toLocaleLowerCase().includes(query)
    );
  });
  const selectedStudent = users.find((student) => student.id === selectedStudentId);

  async function openStudent(studentId: string) {
    setSelectedStudentId(studentId);
    await getAuthorizedNames(studentId);
  }

  async function handleStatusChange(studentId: string) {
    if (busy) return;
    const student = users.find((item) => item.id === studentId);
    if (!student) return;
    setBusy(true);
    const result = await toggleUserStatus(studentId, student.ativo === false);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível desativar o aluno.");
      return;
    }
    setConfirmStudentId(null);
    toast.success(student.ativo === false ? "Aluno ativado com sucesso." : "Aluno desativado com sucesso.");
  }

  return (
    <StaffLayout>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Alunos cadastrados</h1>
      <p className="mb-6 text-sm text-gray-500">Consulte perfis e gerencie alunos sem encomendas pendentes.</p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="title-highlight"><h2 className="text-base font-semibold text-gray-900">Lista de Alunos Cadastrados</h2></div>
          <div className="relative sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aluno, RA ou e-mail" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-6 py-3 text-left">Aluno</th><th className="px-6 py-3 text-left">RA</th><th className="px-6 py-3 text-left">E-mail</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Ações</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => {
                return <tr key={student.id} onClick={() => openStudent(student.id)} className="cursor-pointer hover:bg-gray-50"><td className="px-6 py-3 font-medium text-gray-800">{student.nome}</td><td className="px-6 py-3 text-gray-500">{student.ra}</td><td className="px-6 py-3 text-gray-500">{student.email}</td><td className="px-6 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${student.ativo === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{student.ativo === false ? "Inativo" : "Ativo"}</span></td><td className="px-6 py-3"><button onClick={(event) => { event.stopPropagation(); openStudent(student.id); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"><Eye size={14} /> Detalhes</button><button onClick={(event) => { event.stopPropagation(); setConfirmStudentId(student.id); }} className={`ml-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${student.ativo === false ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}><Power size={14} /> {student.ativo === false ? "Ativar" : "Desativar"}</button></td></tr>;
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-500">Nenhum aluno encontrado.</p>}
        </div>
      </div>

      {selectedStudent && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedStudentId(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Perfil do aluno</p><h2 className="mt-1 text-2xl font-semibold text-gray-900">{selectedStudent.nome || "Aluno sem nome"}</h2></div><button onClick={() => setSelectedStudentId(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X size={18} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-xs uppercase tracking-wide text-gray-500">Nome completo</p><p className="mt-1 font-medium text-gray-900">{selectedStudent.nome || "Não informado"}</p></div><div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-xs uppercase tracking-wide text-gray-500">RA</p><p className="mt-1 font-medium text-gray-900">{selectedStudent.ra || "Não informado"}</p></div><div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-xs uppercase tracking-wide text-gray-500">E-mail</p><p className="mt-1 break-all font-medium text-gray-900">{selectedStudent.email || "Não informado"}</p></div><div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-xs uppercase tracking-wide text-gray-500">Status</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selectedStudent.ativo === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{selectedStudent.ativo === false ? "Inativo" : "Ativo"}</span></div></div><div className="mt-6 rounded-xl border border-gray-200 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-gray-900">Nomes alternativos cadastrados</h3><span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{selectedStudent.nomesAlternativos?.filter((name) => name.tipo === "alternativo").length ?? 0}</span></div>{selectedStudent.nomesAlternativos?.filter((name) => name.tipo === "alternativo").length ? <div className="mt-3 flex flex-wrap gap-2">{selectedStudent.nomesAlternativos.filter((name) => name.tipo === "alternativo").map((name) => <span key={name.id} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">{name.nome_completo}</span>)}</div> : <p className="mt-3 text-sm text-gray-500">Nenhum nome alternativo cadastrado.</p>}</div><div className="mt-4 rounded-xl border border-gray-200 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-gray-900">Pessoas autorizadas para retirada</h3><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{selectedStudent.nomesAutorizados?.length ?? 0}</span></div>{selectedStudent.nomesAutorizados?.length ? <div className="mt-3 space-y-2">{selectedStudent.nomesAutorizados.map((name) => <div key={name.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><div><p className="text-sm font-medium text-gray-800">{name.nome_completo}</p><p className="text-xs capitalize text-gray-500">{name.parentesco}</p></div><span className="text-xs font-semibold text-emerald-600">{name.ativo ? "Autorizado" : "Inativo"}</span></div>)}</div> : <p className="mt-3 text-sm text-gray-500">Nenhuma pessoa autorizada para retirada.</p>}</div><div className="mt-6 flex justify-end"><button onClick={() => setConfirmStudentId(selectedStudent.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${selectedStudent.ativo === false ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}><Power size={16} /> {selectedStudent.ativo === false ? "Ativar aluno" : "Desativar aluno"}</button></div></div></div>}
      {confirmStudentId && (() => { const student = users.find((item) => item.id === confirmStudentId); if (!student) return null; const activating = student.ativo === false; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-semibold text-gray-900">Confirmar alteração de status</h2><p className="mt-2 text-sm text-gray-600">Tem certeza que você deseja {activating ? "ativar" : "desativar"} o aluno <strong>{student.nome}</strong>?</p><div className="mt-5 flex justify-end gap-3"><button onClick={() => setConfirmStudentId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button><button onClick={() => handleStatusChange(student.id)} disabled={busy} className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${activating ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>{busy ? "Salvando..." : activating ? "Ativar" : "Desativar"}</button></div></div></div>; })()}
    </StaffLayout>
  );
}
