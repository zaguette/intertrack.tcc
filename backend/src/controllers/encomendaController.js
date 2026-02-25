import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const encomendaController = {
    // Registrar nova encomenda + Histórico (Auditoria)
    async create(req, res) {
        const { codigo_rastreio, descricao, nome_entrega_id, status_atual_id, observacoes } = req.body;
        const funcionario_id = req.user.id; // Pegamos o ID do token de quem está logado

        try {
            const resultado = await prisma.$transaction(async (tx) => {
                const encomenda = await tx.encomenda.create({
                    data: {
                        codigo_rastreio,
                        descricao,
                        nome_entrega_id: Number(nome_entrega_id),
                        funcionario_id: Number(funcionario_id),
                        status_atual_id: Number(status_atual_id),
                        observacoes
                    }
                });

                await tx.historicoStatus.create({
                    data: {
                        encomenda_id: encomenda.id,
                        status_id: Number(status_atual_id),
                        alterado_por: Number(funcionario_id)
                    }
                });

                return encomenda;
            });
            res.status(201).json(resultado);
        } catch (error) {
            res.status(400).json({ erro: "Erro ao registrar encomenda." });
        }
    },

    // Busca avançada (Nome do aluno, código ou status)
    async list(req, res) {
        const { busca } = req.query;
        try {
            const encomendas = await prisma.encomenda.findMany({
                where: busca ? {
                    OR: [
                        { codigo_rastreio: { contains: busca } },
                        { nomeEntrega: { nome_completo: { contains: busca } } }
                    ]
                } : {},
                include: {
                    statusAtual: true,
                    nomeEntrega: { select: { nome_completo: true } }
                }
            });
            res.json(encomendas);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar encomendas." });
        }
    }
};