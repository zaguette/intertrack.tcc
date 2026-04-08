import { PieChart, TrendingUp } from "lucide-react";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { StaffLayout } from "../../components/StaffLayout";
import { Card } from "../../components/ui/Card";
import { useApp } from "../../context/AppContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const stats = [
  { label: "Encomendas por dia", value: "Em breve" },
  { label: "Tempo médio de retirada", value: "Em breve" },
  { label: "Encomendas por mês", value: "Em breve" },
];

export function StaffGraficos() {
  const { packages } = useApp();

  const entregues = packages.filter((item) => item.status === "entregue").length;
  const naoEntregues = packages.length - entregues;

  const chartData = {
    labels: ["Entregues", "Não Entregues"],
    datasets: [
      {
        data: [entregues, naoEntregues],
        backgroundColor: ["#22c55e", "#f59e0b"],
        borderColor: ["#16a34a", "#d97706"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <StaffLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--app-text)]">Gráficos e estatísticas</h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          Base visual para os gráficos de desempenho do sistema.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="min-h-[320px] border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--app-text)]">Proporção geral</h2>
              <p className="text-sm text-[var(--muted-text)]">Entregues x Não entregues</p>
            </div>
            <PieChart className="text-[var(--muted-text)]" size={20} />
          </div>
          <div className="mt-6 min-h-[260px] rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
            <div className="h-[220px] w-full">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </Card>

        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--muted-text)]" />
            <h2 className="text-base font-semibold text-[var(--app-text)]">Resumo rápido</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <p className="text-sm font-semibold text-[var(--app-text)]">Entregues</p>
              <p className="mt-1 text-xl font-bold text-emerald-500">{entregues}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <p className="text-sm font-semibold text-[var(--app-text)]">Não Entregues</p>
              <p className="mt-1 text-xl font-bold text-amber-500">{naoEntregues}</p>
            </div>
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
                <p className="text-sm font-semibold text-[var(--app-text)]">{item.label}</p>
                <p className="mt-1 text-sm text-[var(--muted-text)]">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </StaffLayout>
  );
}
