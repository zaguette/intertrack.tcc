// Helper para uso em runtime com Prisma Client
// - Não importa @prisma/client estaticamente para evitar conflitos com `prisma generate`
// - Usa import dinâmico para criar uma instância única do PrismaClient

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

export default prisma;
