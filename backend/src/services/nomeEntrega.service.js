import { prisma } from "../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

export const criarNomeAlternativo = async (dados, usuario_id) => {
  const { nome, tipo } = dados;

  return await prisma.nomeAlternativo.create({
    data: {
      id: uuidv4(),
      nome,
      tipo,
      usuario_id
    }
  });
};

export const listarNomesAlternativos = async (usuario_id) => {
  return await prisma.nomeAlternativo.findMany({
    where: {
      usuario_id
    }
  });
};

export const deletarNomeAlternativo = async (id) => {
  return await prisma.nomeAlternativo.delete({
    where: {
      id
    }
  });
};
