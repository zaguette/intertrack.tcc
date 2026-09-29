import { prisma } from "../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

export const criarNomeAlternativo = async (dados, usuario_id) => {
  const nome_completo = String(dados.nome_completo ?? dados.nome ?? "").trim();
  const parentesco = dados.parentesco ?? dados.tipo ?? "outro";

  if (!nome_completo) {
    throw new Error("Informe o nome completo.");
  }

  return await prisma.nomeAlternativo.create({
    data: {
      id: uuidv4(),
      nome_completo,
      parentesco,
      documento: dados.documento ? String(dados.documento).trim() : null,
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

export const deletarNomeAlternativo = async (id, usuario_id) => {
  const nome = await prisma.nomeAlternativo.findFirst({
    where: { id, usuario_id }
  });

  if (!nome) {
    throw new Error("Nome alternativo não encontrado.");
  }

  return await prisma.nomeAlternativo.delete({ where: { id: nome.id } });
};
