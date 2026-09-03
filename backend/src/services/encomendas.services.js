import { prisma } from "../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

export const criarEncomenda = async (dados, funcionario_id) => {
  const {
    codigo_rastreio,
    descricao,
    destinatario_usuario_id,
    remetente_id,
    status_atual_id,
    observacoes
  } = dados;

  return await prisma.$transaction(async (tx) => {
    const encomenda = await tx.encomenda.create({
      data: {
        id: uuidv4(),

        codigo_rastreio,

        descricao,

        destinatario_usuario_id,

        remetente_id: remetente_id || null,

        funcionario_id,

        status_atual_id,

        observacoes
      }
    });

    await tx.historicoStatus.create({
      data: {
        id: uuidv4(),

        encomenda_id: encomenda.id,

        status_id: status_atual_id,

        alterado_por: funcionario_id
      }
    });

    return encomenda;
  });
};

export const listarEncomendas = async (
  busca,
  usuario_id,
  tipo
) => {

  const where = {};

  // ==========================================
  // FILTRO DE ACESSO
  // ==========================================

  // Se for aluno, só pode ver suas próprias encomendas
  if (tipo === "aluno") {
    where.destinatario_usuario_id = usuario_id;
  }

  // ==========================================
  // FILTRO DE BUSCA
  // ==========================================

  if (busca) {
    where.OR = [
      {
        codigo_rastreio: {
          contains: busca,
          mode: "insensitive"
        }
      },
      {
        destinatario: {
          nome: {
            contains: busca,
            mode: "insensitive"
          }
        }
      }
    ];
  }

  return await prisma.encomenda.findMany({
    where,

    include: {
      statusAtual: true,

      destinatario: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      },

      remetente: true
    }
  });
};

export const buscarEncomendaPorId = async (id) => {
  return await prisma.encomenda.findUnique({
    where: {
      id
    },

    include: {
      statusAtual: true,

      destinatario: true,

      remetente: true,

      funcionario: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      },

      historicos: {
        include: {
          status: true,

          funcionario: {
            select: {
              nome: true
            }
          }
        }
      }
    }
  });
};

export const atualizarStatusEncomenda = async (
  id,
  status_atual_id,
  funcionario_id
) => {
  return await prisma.$transaction(async (tx) => {
    const encomenda = await tx.encomenda.update({
      where: {
        id
      },

      data: {
        status_atual_id
      }
    });

    await tx.historicoStatus.create({
      data: {
        id: uuidv4(),

        encomenda_id: id,

        status_id: status_atual_id,

        alterado_por: funcionario_id
      }
    });

    return encomenda;
  });
};

export const deletarEncomenda = async (id) => {
  return await prisma.encomenda.delete({
    where: {
      id
    }
  });
};
