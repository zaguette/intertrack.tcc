import "dotenv/config";
import bcrypt from "bcrypt";
import { v5 as uuidv5 } from "uuid";
import { prisma } from "../src/config/prisma.js";

const PASSWORD = "Senha123@";
const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const STATUS = {
  recebida: {
    id: "00000000-0000-4000-8000-000000000001",
    codigo: "RECEBIDA",
    nome_status: "Recebida",
    descricao: "Encomenda chegou no UNASP"
  },
  disponivel: {
    id: "00000000-0000-4000-8000-000000000002",
    codigo: "DISPONIVEL",
    nome_status: "Disponível",
    descricao: "Aluno pode retirar"
  },
  entregue: {
    id: "00000000-0000-4000-8000-000000000003",
    codigo: "ENTREGUE",
    nome_status: "Entregue",
    descricao: "Encomenda retirada"
  }
};

const studentNames = [
  "Sabriny Veloso", "Ana Beatriz Martins", "Bruno Henrique Costa", "Camila Fernanda Alves",
  "Daniel Augusto Ribeiro", "Eduarda Vitória Souza", "Felipe Gabriel Oliveira", "Gabriela Mendes Santos",
  "Henrique Lucas Carvalho", "Isabela Cristina Lima", "João Pedro Nogueira", "Karina Letícia Ferreira",
  "Leonardo Matheus Rocha", "Mariana Cecília Gomes", "Nicolas Eduardo Barros", "Olivia Valentina Dias",
  "Paulo Ricardo Teixeira", "Rafaela Luiza Moreira", "Samuel Vinicius Correia", "Talita Beatriz Araújo",
  "Vitor Hugo Cardoso", "Yasmin Vitória Freitas", "André Luiz Monteiro", "Bianca Lorena Moraes",
  "Caio César Martins", "Débora Caroline Pires", "Enzo Miguel Tavares", "Flávia Regina Castro",
  "Gustavo Henrique Neves", "Helena Isabel Farias", "Igor Gabriel Peixoto", "Juliana Alves Ramos",
  "Kevin Douglas Cunha", "Larissa Manuela Batista", "Marcelo Vinicius Reis", "Natália Vitória Brito",
  "Otávio Felipe Azevedo", "Patrícia Helena Duarte", "Ruan Gabriel Macedo", "Sarah Eloá Campos",
  "Thiago Augusto Vieira", "Úrsula Beatriz Fonseca", "Valentina Maria Lopes", "Wesley Jonathan Moraes",
  "Alice Gabriela Pinto", "Bernardo Rafael Dantas", "Clara Vitória Siqueira", "Diego Fernando Paiva",
  "Eloá Cristina Sales", "Murilo Henrique Guimarães"
];

const surnames = [
  "Almeida", "Barbosa", "Cavalcanti", "Diniz", "Esteves", "Figueiredo", "Gonçalves",
  "Leal", "Macedo", "Nascimento", "Pereira", "Queiroz", "Ramos", "Silveira", "Torres"
];

const alternativePatterns = [
  (name) => name.split(" ").slice(0, 2).join(" "),
  (name) => `${name.split(" ")[0]} ${surnames[0]}`,
  (name) => `${name.split(" ")[0]} ${surnames[1]}`
];

const parentNames = [
  "Carlos Eduardo Costa", "Cássia Silva de Miranda", "José Iran Mendes", "Marilene Alves da Silva",
  "Roberto Gonçalves", "Lúcia Helena Pereira", "Marcos Vinícius Souza", "Patrícia Cristina Lima",
  "Antônio Carlos Ribeiro", "Sandra Maria Oliveira"
];

const authorizedRelations = ["pai", "mae", "irmao", "irma", "responsavel", "outro"];

const idFor = (type, index) =>
  uuidv5(`${type}:${index}`, UUID_NAMESPACE);

const emailFor = (name, index) => {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".");
  return index % 3 === 0
    ? `${normalized}@gmail.com`
    : `${normalized}@unasp.br`;
};

async function main() {
  const senha = await bcrypt.hash(PASSWORD, 12);

  await prisma.$transaction(async (tx) => {
    for (const status of Object.values(STATUS)) {
      await tx.statusEncomenda.upsert({
        where: { id: status.id },
        update: {
          codigo: status.codigo,
          nome_status: status.nome_status,
          descricao: status.descricao
        },
        create: status
      });
    }

    const funcionario = await tx.funcionario.upsert({
      where: { email: "seed@intertrack.com" },
      update: { ativo: true, nome: "Funcionário Seed" },
      create: {
        id: idFor("funcionario", 1),
        nome: "Funcionário Seed",
        email: "seed@intertrack.com",
        senha,
        cargo: "recebimento"
      }
    });

    const remetentes = await Promise.all([
      tx.remetente.upsert({
        where: { id: idFor("remetente", 1) },
        update: {},
        create: {
          id: idFor("remetente", 1),
          nome: "Shopee",
          tipo: "ecommerce",
          site: "https://shopee.com.br"
        }
      }),
      tx.remetente.upsert({
        where: { id: idFor("remetente", 2) },
        update: {},
        create: {
          id: idFor("remetente", 2),
          nome: "Shein",
          tipo: "ecommerce",
          site: "https://br.shein.com"
        }
      }),
      tx.remetente.upsert({
        where: { id: idFor("remetente", 3) },
        update: {},
        create: {
          id: idFor("remetente", 3),
          nome: "Correios",
          tipo: "correios"
        }
      })
    ]);

    const users = [];
    for (let index = 0; index < studentNames.length; index += 1) {
      const ra = String(100001 + index);
      const usuario = await tx.usuario.upsert({
        where: { ra },
        update: {
          nome: studentNames[index],
          email: emailFor(studentNames[index], index),
          senha,
          ativo: index >= 45
        },
        create: {
          id: idFor("usuario", index),
          ra,
          nome: studentNames[index],
          email: emailFor(studentNames[index], index),
          senha,
          ativo: index >= 45 ? false : true
        }
      });
      users.push(usuario);

      const alternatives = index === 0
        ? [
          { nome_completo: "Cássia Silva de Miranda", parentesco: "mae" },
          { nome_completo: "José Iran Mendes", parentesco: "pai" }
        ]
        : [
          {
            nome_completo: alternativePatterns[index % alternativePatterns.length](studentNames[index]),
            parentesco: "outro"
          },
          {
            nome_completo: parentNames[index % parentNames.length],
            parentesco: authorizedRelations[index % authorizedRelations.length]
          }
        ];
      if (index % 4 === 0) {
        alternatives.push({
          nome_completo: `${studentNames[index].split(" ")[0]} ${surnames[(index + 3) % surnames.length]}`,
          parentesco: "outro"
        });
      }

      for (let alternativeIndex = 0; alternativeIndex < alternatives.length; alternativeIndex += 1) {
        const alternative = alternatives[alternativeIndex];
        await tx.nomeAlternativo.upsert({
          where: { id: idFor(`nome-alternativo:${index}`, alternativeIndex) },
          update: {
            nome_completo: alternative.nome_completo,
            parentesco: alternative.parentesco,
            tipo: alternativeIndex === 0 ? "alternativo" : "autorizado",
            ativo: true
          },
          create: {
            id: idFor(`nome-alternativo:${index}`, alternativeIndex),
            usuario_id: usuario.id,
            nome_completo: alternative.nome_completo,
            parentesco: alternative.parentesco,
            tipo: alternativeIndex === 0 ? "alternativo" : "autorizado"
          }
        });
      }
    }

    for (let index = 0; index < users.length; index += 1) {
      const usuario = users[index];
      const packageId = idFor("encomenda", index);
      const isDelivered = index % 2 === 1;
      const status = isDelivered ? STATUS.entregue : STATUS.disponivel;
      const authorized = await tx.nomeAlternativo.findFirst({
        where: { usuario_id: usuario.id, tipo: "autorizado", ativo: true },
        orderBy: { created_at: "asc" }
      });

      await tx.encomenda.upsert({
        where: { id: packageId },
        update: {
          descricao: `Pedido de teste ${index + 1} - ${index % 2 === 0 ? "acessórios" : "material acadêmico"}`,
          destinatario_usuario_id: usuario.id,
          remetente_id: remetentes[index % remetentes.length].id,
          funcionario_id: funcionario.id,
          status_atual_id: status.id,
          data_entrega: isDelivered ? new Date() : null,
          retirado_por: isDelivered && authorized ? authorized.nome_completo : null,
          autorizado_terceiros: Boolean(isDelivered && authorized)
        },
        create: {
          id: packageId,
          codigo_rastreio: `BRSEED${String(index + 1).padStart(9, "0")}`,
          descricao: `Pedido de teste ${index + 1} - ${index % 2 === 0 ? "acessórios" : "material acadêmico"}`,
          destinatario_usuario_id: usuario.id,
          remetente_id: remetentes[index % remetentes.length].id,
          funcionario_id: funcionario.id,
          status_atual_id: status.id,
          data_entrega: isDelivered ? new Date() : null,
          retirado_por: isDelivered && authorized ? authorized.nome_completo : null,
          autorizado_terceiros: Boolean(isDelivered && authorized)
        }
      });

      if (isDelivered && authorized) {
        await tx.autorizacao.upsert({
          where: { id: idFor("autorizacao", index) },
          update: {
            destinatario_id: authorized.id,
            autorizado_por: usuario.id,
            utilizada: true
          },
          create: {
            id: idFor("autorizacao", index),
            encomenda_id: packageId,
            destinatario_id: authorized.id,
            autorizado_por: usuario.id,
            utilizada: true,
            validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
      }
    }
  }, {
    maxWait: 10000,
    timeout: 120000
  });

  console.log("Seed concluído: 50 alunos, nomes alternativos/autorizados e 50 encomendas.");
  console.log(`Senha padrão dos alunos: ${PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
