// Helper para uso em runtime com Prisma Client
// - Não importa @prisma/client estaticamente para evitar conflitos com `prisma generate`
// - Usa import dinâmico para criar uma instância única do PrismaClient

import dotenv from 'dotenv';

dotenv.config();

let _prisma = null;

export async function getPrisma() {
  if (!_prisma) {
    const { PrismaClient } = await import('@prisma/client');
    _prisma = new PrismaClient();
  }
  return _prisma;
}

export async function connect() {
  const prisma = await getPrisma();
  try {
    await prisma.$connect();
  } catch (err) {
    throw err;
  }
}

export async function disconnect() {
  if (!_prisma) return;
  try {
    await _prisma.$disconnect();
  } catch (err) {
    console.error('Erro ao desconectar do Prisma:', err);
  }
}

export { _prisma as prisma };
