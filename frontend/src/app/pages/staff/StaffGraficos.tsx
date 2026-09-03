import { Bar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { BarChart3, Clock3, Package, PieChart, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { StaffLayout } from "../../components/StaffLayout";
import { Card } from "../../components/ui/Card";
import { useApp } from "../../context/AppContext";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

function getArrivalDate(pkg: any): string | null {
  return pkg.dataChegada ?? pkg.createdAt ?? pkg.created_at ?? pkg.availableAt ?? null;
}

function getPickupDate(pkg: any): string | null {
  return pkg.dataRetirada ?? pkg.collectedAt ?? pkg.data_entrega ?? null;
}

function getStatus(pkg: any): string {
  const status = pkg.status ?? pkg.statusAtual?.nome_status ?? pkg.status_atual?.nome_status ?? "";
  const normalized = String(status).toLowerCase();
  return normalized === "entregue" || normalized === "collected" ? "entregue" : "disponivel";
}

function formatDay(date: string) {
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date.slice(0, 10);
  return parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  const parsed = new Date(Number(year), Number(month) - 1, 1);
  return parsed.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

function hoursBetween(start: string, end: string) {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  if (Number.isNaN(startDate) || Number.isNaN(endDate) || endDate < startDate) return null;
  return (endDate - startDate) / (1000 * 60 * 60);
}

export function StaffGraficos() {
  const { packages } = useApp();

  const report = useMemo(() => {
    const total = packages.length;
    const entregues = packages.filter((pkg) => getStatus(pkg) === "entregue").length;
    const disponiveis = total - entregues;

    const dailyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    const pickupTimes: number[] = [];

    packages.forEach((pkg) => {
      const arrival = getArrivalDate(pkg);
      if (arrival) {
        const day = arrival.slice(0, 10);
        dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);

        const month = day.slice(0, 7);
        monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
      }

      const pickup = getPickupDate(pkg);
      if (arrival && pickup) {
        const hours = hoursBetween(arrival, pickup);
        if (hours !== null) pickupTimes.push(hours);
      }
    });

    const daily = [...dailyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-7);
    const monthly = [...monthlyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    const averagePickup = pickupTimes.length
      ? pickupTimes.reduce((sum, value) => sum + value, 0) / pickupTimes.length
      : null;

    return { total, entregues, disponiveis, daily, monthly, averagePickup };
  }, [packages]);

  const statusData = {
    labels: ["Entregues", "Não entregues"],
    datasets: [
      {
        data: [report.entregues, report.disponiveis],
        backgroundColor: ["#22c55e", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  const dailyData = {
    labels: report.daily.map(([date]) => formatDay(date)),
    datasets: [
      {
        label: "Encomendas",
        data: report.daily.map(([, value]) => value),
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: report.monthly.map(([month]) => formatMonth(month)),
    datasets: [
      {
        label: "Encomendas",
        data: report.monthly.map(([, value]) => value),
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" as const } },
  };

  return (
    <StaffLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--app-text)]">Relatórios de encomendas</h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          Acompanhe a quantidade, os status e o tempo médio de retirada das encomendas.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-[var(--accent-text)]" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Total</p>
              <p className="text-2xl font-bold text-[var(--app-text)]">{report.total}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-emerald-500" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Entregues</p>
              <p className="text-2xl font-bold text-emerald-500">{report.entregues}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-amber-500" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Não entregues</p>
              <p className="text-2xl font-bold text-amber-500">{report.disponiveis}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-3">
            <Clock3 size={20} className="text-[var(--accent-text)]" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Tempo médio de retirada</p>
              <p className="text-2xl font-bold text-[var(--app-text)]">
                {report.averagePickup === null ? "—" : `${report.averagePickup.toFixed(1)} h`}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-[var(--muted-text)]" />
            <div>
              <h2 className="text-base font-semibold text-[var(--app-text)]">Status das encomendas</h2>
              <p className="text-sm text-[var(--muted-text)]">Entregues x não entregues</p>
            </div>
          </div>
          <div className="mt-4 h-[280px]">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </Card>

        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[var(--muted-text)]" />
            <div>
              <h2 className="text-base font-semibold text-[var(--app-text)]">Encomendas por dia</h2>
              <p className="text-sm text-[var(--muted-text)]">Últimos 7 dias com registros</p>
            </div>
          </div>
          <div className="mt-4 h-[280px]">
            {report.daily.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[var(--muted-text)]">
                Nenhuma encomenda com data registrada.
              </div>
            ) : (
              <Bar data={dailyData} options={barOptions} />
            )}
          </div>
        </Card>

        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)] lg:col-span-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--muted-text)]" />
            <div>
              <h2 className="text-base font-semibold text-[var(--app-text)]">Encomendas por mês</h2>
              <p className="text-sm text-[var(--muted-text)]">Últimos 6 meses com registros</p>
            </div>
          </div>
          <div className="mt-4 h-[300px]">
            {report.monthly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[var(--muted-text)]">
                Nenhuma encomenda com data registrada.
              </div>
            ) : (
              <Bar data={monthlyData} options={barOptions} />
            )}
          </div>
        </Card>
      </div>
    </StaffLayout>
  );
}
