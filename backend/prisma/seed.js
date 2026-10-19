import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../src/config/prisma.js";

// IDs FIXOS: o front-end usa estes mesmos IDs (frontend/src/app/lib/adapters.ts).
// Se mudar aqui, mude lá também.
const STATUS = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    codigo: "RECEBIDA",
    nome_status: "Recebida",
    descricao: "Encomenda chegou no UNASP"
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    codigo: "DISPONIVEL",
    nome_status: "Disponível",
    descricao: "Aluno pode retirar"
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    codigo: "ENTREGUE",
    nome_status: "Entregue",
    descricao: "Encomenda retirada"
  }
];

async function main() {
  if (Boolean(process.env.SEED_ADMIN_EMAIL) !== Boolean(process.env.SEED_ADMIN_PASSWORD)) {
    throw new Error("Informe SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD juntos.");
  }
  if (process.env.SEED_ADMIN_PASSWORD && process.env.SEED_ADMIN_PASSWORD.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.");
  }
  for (const s of STATUS) {
    await prisma.statusEncomenda.upsert({
      where: { id: s.id },
      update: {
        codigo: s.codigo,
        nome_status: s.nome_status,
        descricao: s.descricao
      },
      create: s
    });
  }

  // Administração inicial opcional, sem sobrescrever contas existentes.
  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    await prisma.funcionario.upsert({
      where: { email: process.env.SEED_ADMIN_EMAIL }, update: {},
      create: {
        id: uuidv4(), nome: "Administrador",
        email: process.env.SEED_ADMIN_EMAIL,
        senha: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10),
        cargo: "administrador"
      }
    });
  }

  console.log("✅ Banco populado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
