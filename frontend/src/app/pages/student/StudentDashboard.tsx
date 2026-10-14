import { Calendar, Lock, Package, PackageCheck, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { StudentLayout } from "../../components/StudentLayout";
import { useApp } from "../../context/AppContext";
import { formatDateTime } from "../../lib/adapters";

export function StudentDashboard() {
  const { user, packages, togglePackageThirdPartyAuthorization } = useApp();
  const navigate = useNavigate();

  // A API já retorna somente as encomendas do aluno logado
  const myPackages = packages;
  const total = myPackages.length;
  const disponivel = myPackages.filter((p) => p.status === "disponivel").length;
  const entregues = myPackages.filter((p) => p.status === "entregue").length;

  const recent = myPackages.slice(0, 6);

  return (
    <StudentLayout>
      <div className="mx-auto max-w-7xl px-0 py-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.nome}!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe suas encomendas pelo Correio Interno do UNASP
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total de Encomendas"
            value={total}
            icon={<Package size={22} className="text-blue-900" />}
            iconBg="bg-blue-100"
          />
          <StatCard
            title="Disponiveis"
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
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="title-highlight">
              <h2 className="text-base font-semibold text-gray-900 m-0">Minhas Encomendas</h2>
            </div>
            <button
              onClick={() => navigate("/aluno/historico")}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
            >
              Ver todas -&gt;
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700">Nenhuma encomenda</h3>
              <p className="mt-1 text-sm text-gray-400">
                Voce nao possui encomendas registradas no momento.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Codigo
                      </p>
                      <p className="mt-0.5 truncate text-base font-bold text-gray-900">
                        {pkg.codigo}
                      </p>
                    </div>
                    {pkg.status !== "entregue" && pkg.status !== "collected" ? <button
                      type="button"
                      onClick={async () => {
                        const nextValue = !pkg.autorizadoParaTerceiros;
                        const result = await togglePackageThirdPartyAuthorization(pkg.id, nextValue);
                        if (!result.ok) {
                          toast.error(result.error ?? "Não foi possível alterar a autorização.");
                          return;
                        }
                        toast.success(nextValue ? "Retirada por terceiros autorizada para esta encomenda." : "Retirada restrita apenas ao titular.");
                      }}
                      className={`group flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition ${pkg.autorizadoParaTerceiros ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}
                      title={pkg.autorizadoParaTerceiros ? "Retirada por terceiros autorizada" : "Autorizar retirada por terceiros"}
                      aria-label={pkg.autorizadoParaTerceiros ? "Restringir retirada ao titular" : "Autorizar retirada por terceiros"}
                    >
                      {pkg.autorizadoParaTerceiros ? <Unlock size={19} /> : <Lock size={19} />}
                    </button> : <Package size={20} className="mt-1 flex-shrink-0 text-blue-400" />}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{formatDateTime(pkg.createdAt)}</span>
                  </div>
                  <div className="mt-3">
                    <StatusBadge status={pkg.status} />
                  </div>
                  {pkg.autorizadoParaTerceiros && <span className="mt-1 text-xs font-medium text-emerald-600">Retirada por terceiros autorizada</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}