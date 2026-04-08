import { ShieldUser, Users } from "lucide-react";
import { StaffLayout } from "../../components/StaffLayout";
import { Card } from "../../components/ui/Card";

const profiles = [
  { role: "Administrador", description: "Acesso total ao cadastro, gráficos e perfis." },
  { role: "Aluno", description: "Consulta histórico, status e notificações." },
];

export function StaffPerfis() {
  return (
    <StaffLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--app-text)]">Perfis e permissões</h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          Separação clara entre as permissões do administrador e do aluno.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((item) => (
          <Card key={item.role} className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
            <div className="flex items-center gap-3">
              {item.role === "Administrador" ? (
                <ShieldUser size={20} className="text-[var(--muted-text)]" />
              ) : (
                <Users size={20} className="text-[var(--muted-text)]" />
              )}
              <h2 className="text-base font-semibold text-[var(--app-text)]">{item.role}</h2>
            </div>
            <p className="mt-3 text-sm text-[var(--muted-text)]">{item.description}</p>
          </Card>
        ))}
      </div>
    </StaffLayout>
  );
}
