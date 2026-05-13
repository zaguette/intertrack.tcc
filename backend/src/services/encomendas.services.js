import prisma from '../../prisma.client.js';

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
        codigo_rastreio,
        descricao,
        destinatario_usuario_id: Number(destinatario_usuario_id),
        remetente_id: remetente_id ? Number(remetente_id) : null,
        funcionario_id: Number(funcionario_id),
        status_atual_id: Number(status_atual_id),
        observacoes
      }
    });

    await tx.historicoStatus.create({
      data: {
        encomenda_id: encomenda.id,
        status_id: Number(status_atual_id),
        alterado_por: Number(funcionario_id)
      }
    });

    return encomenda;
  });
};

export const listarEncomendas = async (busca) => {
  return await prisma.encomenda.findMany({
    where: busca
      ? {
          OR: [
            {
              codigo_rastreio: {
                contains: busca,
                mode: 'insensitive'
              }
            },
            {
              destinatario: {
                nome: {
                  contains: busca,
                  mode: 'insensitive'
                }
              }
            }
          ]
        }
      : {},

    include: {
      statusAtual: true,

      destinatario: {
        select: {
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
      id: Number(id)
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
        id: Number(id)
      },

      data: {
        status_atual_id: Number(status_atual_id)
      }
    });

    await tx.historicoStatus.create({
      data: {
        encomenda_id: Number(id),
        status_id: Number(status_atual_id),
        alterado_por: Number(funcionario_id)
      }
    });

    return encomenda;
  });
};

export const deletarEncomenda = async (id) => {

  return await prisma.encomenda.delete({
    where: {
      id: Number(id)
    }
  });
};
