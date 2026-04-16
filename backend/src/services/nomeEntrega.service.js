import prisma from '../../prisma/client.js';

export const criar = async (dados) => {
  return await prisma.nomesEntrega.create({
    data: dados
  });
};