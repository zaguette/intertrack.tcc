import { CalendarDays, Package, PackageCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StudentLayout } from "../../components/StudentLayout";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/ui/Card";

type StudentProfileData = {
  fullName: string;
  birthDate: string;
  ra: string;
};

function getProfileStorageKey(ra: string) {
  return `intertrack_student_profile_v1_${ra}`;
}

export function StudentPerfil() {
  const { user, packages } = useApp();
  const myPackages = packages.filter((pkg) => pkg.ra === user?.ra);

  const [profile, setProfile] = useState<StudentProfileData>({
    fullName: user?.nome ?? "",
    birthDate: "",
    ra: user?.ra ?? "",
  });
  const [draft, setDraft] = useState<StudentProfileData>(profile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user?.ra) return;

    const fallback: StudentProfileData = {
      fullName: user.nome,
      birthDate: "",
      ra: user.ra,
    };

    const raw = localStorage.getItem(getProfileStorageKey(user.ra));
    if (!raw) {
      setProfile(fallback);
      setDraft(fallback);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StudentProfileData;
      const normalized: StudentProfileData = {
        fullName: parsed.fullName || fallback.fullName,
        birthDate: parsed.birthDate || "",
        ra: parsed.ra || fallback.ra,
      };
      setProfile(normalized);
      setDraft(normalized);
    } catch {
      setProfile(fallback);
      setDraft(fallback);
    }
  }, [user]);

  function formatBirthDate(date: string) {
    if (!date) return "Não informado";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  function handleSaveProfile() {
    if (!user?.ra) return;
    if (!draft.fullName.trim()) {
      toast.error("Informe o nome completo.");
      return;
    }
    if (!draft.ra.trim()) {
      toast.error("Informe o RA.");
      return;
    }

    const nextProfile: StudentProfileData = {
      fullName: draft.fullName.trim(),
      birthDate: draft.birthDate,
      ra: draft.ra.trim(),
    };

    localStorage.setItem(getProfileStorageKey(user.ra), JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setDraft(nextProfile);
    setIsEditing(false);
    toast.success("Perfil atualizado com sucesso.");
  }

  function handleCancelEdit() {
    setDraft(profile);
    setIsEditing(false);
  }

  return (
    <StudentLayout>
      <div className="mx-auto max-w-4xl px-0 py-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--app-text)]">Perfil do aluno</h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Informações básicas e resumo da atividade do usuário.
          </p>
        </div>

        <Card className="border border-[var(--app-border)] bg-[var(--panel-bg)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 text-[var(--app-text)]">
                <UserRound size={26} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--app-text)]">{profile.fullName}</h2>
                <p className="mt-1 text-sm text-[var(--muted-text)]">RA: {profile.ra}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-medium text-[var(--muted-text)] transition hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-medium text-[var(--muted-text)] transition hover:bg-black/5"
              >
                Editar perfil
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-text)]">Nome completo</p>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.fullName}
                  onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-[var(--app-text)]">{profile.fullName}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                <CalendarDays size={16} />
                Data de nascimento
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={draft.birthDate}
                  onChange={(e) => setDraft((prev) => ({ ...prev, birthDate: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <p className="mt-2 text-sm text-[var(--muted-text)]">{formatBirthDate(profile.birthDate)}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                <UserRound size={16} />
                RA
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.ra}
                  onChange={(e) => setDraft((prev) => ({ ...prev, ra: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-[var(--app-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <p className="mt-2 text-sm text-[var(--muted-text)]">{profile.ra}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                <Package size={16} />
                Encomendas
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">{myPackages.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-black/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text)]">
                <PackageCheck size={16} />
                Disponíveis
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">
                {myPackages.filter((pkg) => pkg.status === "disponivel").length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
