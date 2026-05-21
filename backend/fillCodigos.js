import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function atualizarUsuarios() {
  const usuarios = await prisma.usuario.findMany()

  for (const usuario of usuarios) {
    if (!usuario.codigo) {
      await prisma.usuario.update({
        where: {
          id: usuario.id
        },
        data: {
          codigo: crypto.randomUUID()
        }
      })

      console.log(`Usuário ${usuario.id} atualizado`)
    }
  }
}

async function atualizarFuncionarios() {
  const funcionarios = await prisma.funcionario.findMany()

  for (const funcionario of funcionarios) {
    if (!funcionario.codigo) {
      await prisma.funcionario.update({
        where: {
          id: funcionario.id
        },
        data: {
          codigo: crypto.randomUUID()
        }
      })

      console.log(`Funcionário ${funcionario.id} atualizado`)
    }
  }
}

async function main() {
  await atualizarUsuarios()
  await atualizarFuncionarios()

  console.log('Finalizado!')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
  