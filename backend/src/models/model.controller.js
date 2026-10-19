import { prisma } from '../config/prisma.js'
import { gerarId } from '../models/id.models.js'

export async function criarUsuario(req, res) {
    try {
        const { nome, email } = req.body

        const usuario = await prisma.usuario.create({
            data: {
                id: gerarId(),
                nome,
                email
            }
        })

        res.status(201).json(usuario)

    } catch (error) {
        res.status(500).json({
            erro: "Não foi possível concluir a operação."
        })
    }
}