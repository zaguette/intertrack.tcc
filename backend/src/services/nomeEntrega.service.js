
export {};

import { getPrisma } from '../../prisma.client.js';

export const criar = async (dados) => {
  const prisma = await getPrisma();
  return await prisma.nomesEntrega.create({
    data: dados
  });
};

