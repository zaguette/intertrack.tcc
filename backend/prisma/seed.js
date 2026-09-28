import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../src/config/prisma.js";

// IDs FIXOS: o front-end usa estes mesmos IDs (frontend/src/app/lib/adapters.ts).
// Se mudar aqui, mude lá também.
const STATUS = [
  { id: "00000000-0000-4000-8000-000000000001", codigo: "RECEBIDA", nome_status: "Recebida", descricao: "Encomenda chegou no UNASP" },
  { id: "00000000-0000-4000-8000-000000000002", codigo: "DISPONIVEL", nome_status: "Disponível", descricao: "Aluno pode retirar" },
  { id: "00000000-0000-4000-8000-000000000003", codigo: "ENTREGUE", nome_status: "Entregue", descricao: "Encomenda retirada" },
];

async function main() {
  for (const s of STATUS) {
    await prisma.statusEncomenda.upsert({
      where: { id: s.id },
      update: { codigo: s.codigo, nome_status: s.nome_status, descricao: s.descricao },
      create: s,
    });
  }

  // Funcionário de teste (troque a senha depois)
  await prisma.funcionario.upsert({
    where: { email: "admin@intertrack.com" },
    update: {},
    create: {
      id: uuidv4(),
      nome: "Administrador",
      email: "admin@intertrack.com",
      senha: await bcrypt.hash("admin123", 10),
      cargo: "administrador",
    },
  });

  // Aluno de teste
  await prisma.usuario.upsert({
    where: { email: "aluno@intertrack.com" },
    update: {},
    create: {
      id: uuidv4(),
      ra: "123456",
      nome: "Aluno Teste",
      email: "aluno@intertrack.com",
      senha: await bcrypt.hash("aluno123", 10),
    },
  });

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