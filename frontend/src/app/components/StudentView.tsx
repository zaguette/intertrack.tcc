import { useMemo } from "react";
import { PackageItem, User } from "../lib/types";
import { formatDateTime } from "../lib/utils";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { Package } from "lucide-react";

const sections = [
  {
    title: "📦 Disponíveis para retirada",
    status: "available" as const,
  },
  {
    title: "⏳ Aguardando processamento",
    status: "pending" as const,
  },
  {
    title: "✅ Já retiradas",
    status: "collected" as const,
  },
];

const statusLabels = {
  pending: "Aguardando",
  available: "Disponível",
  collected: "Retirada",
} as const;

type StudentViewProps = {
  packages: PackageItem[];
  user: User;
};

export default function StudentView({ packages, user }: StudentViewProps) {
  const normalizedName = user.name.trim().toLowerCase();
  const normalizedUsername = user.username.trim().toLowerCase();

  const studentPackages = packages.filter((item) => {
    const itemName = item.studentName.trim().toLowerCase();
    return itemName === normalizedName || itemName === normalizedUsername;
  });

  const grouped = useMemo(() => {
    return {
      available: studentPackages.filter((item) => item.status === "available"),
      pending: studentPackages.filter((item) => item.status === "pending"),
      collected: studentPackages.filter((item) => item.status === "collected"),
    };
  }, [studentPackages]);

  if (studentPackages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-6">
          <Package size={48} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          Nenhuma encomenda encontrada
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Você não possui encomendas cadastradas no momento.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          UNASP - Centro Universitário Adventista de São Paulo<br />
          Sistema de Correio Interno do Internato
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {sections.map((section) => {
        const items = studentPackages.filter(
          (item) => item.status === section.status
        );

        return (
          <div key={section.status} className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {section.title}
              </h3>
              <Badge variant={section.status}>{items.length}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.length === 0 ? (
                <Card className="border-dashed text-sm text-slate-500">
                  Nenhuma encomenda nesta categoria.
                </Card>
              ) : (
                items.map((item) => (
                  <Card key={item.id} className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Código/Protocolo
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {item.code}
                        </p>
                      </div>
                      <Badge variant={item.status}>
                        {statusLabels[item.status]}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-600">{item.description}</p>
                    )}
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>Chegada: {formatDateTime(item.createdAt)}</p>
                      {item.availableAt && (
                        <p>Disponível: {formatDateTime(item.availableAt)}</p>
                      )}
                      {item.collectedAt && (
                        <p>Retirada: {formatDateTime(item.collectedAt)}</p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
