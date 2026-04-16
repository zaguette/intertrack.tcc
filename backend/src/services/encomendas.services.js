import prisma from '../../prisma/client.js';

export const criarEncomenda = async (dados, funcionario_id) => {
  const {
    codigo_rastreio,
    descricao,
    nome_entrega_id,
    status_atual_id,
    observacoes
  } = dados;

  return await prisma.$transaction(async (tx) => {
    const encomenda = await tx.encomenda.create({
      data: {
        codigo_rastreio,
        descricao,
        nome_entrega_id: Number(nome_entrega_id),
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
            { codigo_rastreio: { contains: busca } },
            {
              nomeEntrega: {
                nome_completo: { contains: busca }
              }
            }
          ]
        }
      : {},
    include: {
      statusAtual: true,
      nomeEntrega: {
        select: { nome_completo: true }
      }
    }
  });
};