import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  // O resto do código (createMany) continua igual...
  await prisma.tiposUsuario.createMany({
    data: [
      { id: 1, nome_tipo: 'Administrador' },
      { id: 2, nome_tipo: 'Funcionario' },
      { id: 3, nome_tipo: 'Aluno' },
    ],
    skipDuplicates: true,
  });

  await prisma.statusEncomenda.createMany({
    data: [
      { id: 1, nome_status: 'Recebido', descricao: 'Encomenda chegou no UNASP' },
      { id: 2, nome_status: 'Em Processamento', descricao: 'Sendo triada' },
      { id: 3, nome_status: 'Disponível para Retirada', descricao: 'Aluno pode buscar' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Banco populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });