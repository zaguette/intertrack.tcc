import { PackageItem, PackageStatus } from "./types";

// IDs fixos criados pelo backend/prisma/seed.js
export const STATUS_IDS: Record<string, string> = {
  recebida: "00000000-0000-4000-8000-000000000001",
  disponivel: "00000000-0000-4000-8000-000000000002",
  entregue: "00000000-0000-4000-8000-000000000003",
};

export function toStatusId(status?: string): string {
  return STATUS_IDS[(status ?? "").toLowerCase()] ?? STATUS_IDS.recebida;
}

// "28/09/2026 às 19:38"
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const data = d.toLocaleDateString("pt-BR");
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data} às ${hora}`;
}

// Front -> API (POST /encomendas). O funcionário vem do JWT no back-end.
export function toEncomendaPayload(pkg: PackageItem, destinatarioUsuarioId: string) {
  return {
    codigo_rastreio: (pkg.codigo ?? "").trim(),
    destinatario_usuario_id: destinatarioUsuarioId,
    status_atual_id: toStatusId(pkg.status),
  };
}

function statusFromApi(e: any): PackageStatus {
  const raw = String(e?.statusAtual?.codigo ?? e?.statusAtual?.nome_status ?? "").toLowerCase();
  if (raw.includes("entreg")) return "entregue" as PackageStatus;
  if (raw.includes("dispon")) return "disponivel" as PackageStatus;
  return "pending" as PackageStatus;
}

function historyFromApi(e: any) {
  return Array.isArray(e.historicos)
    ? e.historicos.map((item: any) => ({
        id: item.id,
        status: item.status?.nome_status ?? item.status?.codigo ?? item.status_id,
        createdAt: item.data_alteracao,
      }))
    : [];
}

function toLocalDate(value?: string | null) {
  if (!value) return undefined;
  return new Date(value).toLocaleDateString("sv-SE"); // yyyy-mm-dd
}

// API (Prisma) -> formato usado pelas telas
export function fromEncomendaApi(e: any): PackageItem {
  const chegada = e.created_at ? new Date(e.created_at) : null;
  const retirada = e.data_entrega ? new Date(e.data_entrega) : null;

  return {
    id: e.id,
    codigo: e.codigo_rastreio ?? e.codigo ?? "",
    destinatario: e.destinatario?.nome ?? "",
    aluno: e.destinatario?.nome ?? "",
    ra: e.destinatario?.ra ?? "",
    dataChegada: toLocalDate(e.created_at) ?? "",
    horarioChegada: chegada && !Number.isNaN(chegada.getTime())
      ? chegada.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : undefined,
    createdAt: e.created_at ?? undefined, // data + hora exatas do cadastro
    dataRetirada: toLocalDate(e.data_entrega),
    horarioRetirada: retirada && !Number.isNaN(retirada.getTime())
      ? retirada.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : undefined,
    retiradoPor: e.retirado_por ?? undefined,
    collectedAt: e.data_entrega ?? undefined,
    collectedBy: e.retirado_por ?? undefined,
    history: historyFromApi(e),
    status: statusFromApi(e),
  } as PackageItem;
}