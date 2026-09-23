import { PackageItem } from "./types";

/**
 * TODO: Esta função é um placeholder temporário.
 * O backend ainda não expõe rotas para resolver:
 * - RA do aluno -> destinatario_usuario_id
 * - status em texto -> status_atual_id
 * - funcionário logado -> funcionario_id
 *
 * Até essas rotas existirem, o cadastro via API vai falhar
 * (ou usar IDs inválidos). O fallback local em addPackage()
 * continua sendo o caminho funcional por enquanto.
 */
export function toEncomendaPayload(pkg: PackageItem) {
  return {
    codigo_rastreio: pkg.codigo ?? pkg.code ?? "",
    descricao: pkg.aluno ?? pkg.studentName ?? "",
    destinatario_usuario_id: "", // TODO: resolver a partir de pkg.ra
    funcionario_id: "", // TODO: resolver a partir do usuário logado
    status_atual_id: "", // TODO: resolver a partir de pkg.status
  };
}