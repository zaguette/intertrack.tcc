
export {};

import prisma from '../config/prisma.js';

export const criar = async (dados) => {
  return await prisma.nomesEntrega.create({
    data: dados
  });
};

