import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const getSecret = () => process.env.JWT_SECRET;

export const userController = {

    async profile(req, res) {
        try {
            const isFuncionario = req.user.tipo === "funcionario";
            const model = isFuncionario ? prisma.funcionario : prisma.usuario;
            const select = isFuncionario
                ? { id: true, nome: true, email: true, cargo: true, ativo: true }
                : { id: true, nome: true, email: true, ra: true, ativo: true };
            const usuario = await model.findUnique({ where: { id: req.user.id }, select });
            if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
            return res.status(200).json({ mensagem: "Perfil carregado.", usuario: { ...usuario, tipo: req.user.tipo } });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao carregar perfil." });
        }
    },

    // =========================
    // CADASTRO DE USUÁRIO
    // =========================
    async create(req, res) {
        try {

            const { ra, nome, email, senha, telefone } = req.body;

            if (!/^\d{6}$/.test(String(ra ?? ""))) {
                return res.status(400).json({
                    erro: "O RA deve conter exatamente 6 dígitos numéricos."
                });
            }

            const usuarioExiste = await prisma.usuario.findUnique({
                where: {
                    email
                }
            });

            if (usuarioExiste) {
                return res.status(409).json({
                    erro: "E-mail já cadastrado."
                });
            }

            const raExiste = await prisma.usuario.findUnique({
                where: {
                    ra
                }
            });

            if (raExiste) {
                return res.status(409).json({
                    erro: "RA já cadastrado."
                });
            }

            const hashedPassword = await bcrypt.hash(senha, 10);

            await prisma.usuario.create({
                data: {
                    id: uuidv4(),
                    ra,
                    nome,
                    email,
                    senha: hashedPassword,
                    telefone
                }
            });

            return res.status(201).json({
                mensagem: "Usuário criado com sucesso!"
            });

        } catch (error) {

            console.error(error);

            return res.status(400).json({
                erro: "Erro ao cadastrar usuário."
            });

        }
    },

    // =========================
    // LOGIN
    // =========================
    async login(req, res) {
        try {
            // O identificador pode ser RA (aluno) ou e-mail (aluno/funcionário).
            // Aceita "ra", "identificador" ou "email" no corpo da requisição.
            const identificador = String(
                req.body.ra ?? req.body.identificador ?? req.body.email ?? ""
            ).trim();
            const senha = String(req.body.senha ?? "");

            if (!identificador || !senha) {
                return res.status(400).json({ erro: "Informe o RA/e-mail e a senha." });
            }

            // ==========================================
            // TENTA LOGIN COMO USUÁRIO/ALUNO
            // ==========================================
            const usuario = await prisma.usuario.findFirst({
                where: {
                    OR: [{ ra: identificador }, { email: identificador }]
                }
            });

            if (usuario) {
                if (!usuario.ativo) {
                    return res.status(403).json({
                        erro: "Usuário desativado."
                    });
                }

                const senhaValida = await bcrypt.compare(
                    senha,
                    usuario.senha
                );

                if (!senhaValida) {
                    return res.status(401).json({
                        erro: "E-mail ou senha inválidos."
                    });
                }

                const token = jwt.sign(
                    {
                        id: usuario.id,
                        email: usuario.email,
                        tipo: "aluno"
                    },
                    getSecret(),
                    {
                        expiresIn: "8h"
                    }
                );

                return res.json({
                    auth: true,
                    token,
                    user: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        ra: usuario.ra,
                        tipo: "aluno"
                    }
                });
            }

            // ==========================================
            // TENTA LOGIN COMO FUNCIONÁRIO (por e-mail)
            // ==========================================
            const funcionario = await prisma.funcionario.findUnique({
                where: {
                    email: identificador
                }
            });

            if (funcionario) {
                if (!funcionario.ativo) {
                    return res.status(403).json({
                        erro: "Funcionário desativado."
                    });
                }

                const senhaValida = await bcrypt.compare(
                    senha,
                    funcionario.senha
                );

                if (!senhaValida) {
                    return res.status(401).json({
                        erro: "E-mail ou senha inválidos."
                    });
                }

                const token = jwt.sign(
                    {
                        id: funcionario.id,
                        email: funcionario.email,
                        tipo: "funcionario",
                        cargo: funcionario.cargo
                    },
                    getSecret(),
                    {
                        expiresIn: "8h"
                    }
                );

                return res.json({
                    auth: true,
                    token,
                    user: {
                        id: funcionario.id,
                        nome: funcionario.nome,
                        email: funcionario.email,
                        tipo: "funcionario",
                        cargo: funcionario.cargo
                    }
                });
            }

            return res.status(401).json({
                erro: "E-mail ou senha inválidos."
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "Erro interno do servidor."
            });
        }
    },

    // =========================
    // LISTAR TODOS OS USUÁRIOS
    // =========================
    async findAll(req, res) {
        try {
            if (req.query.busca !== undefined && typeof req.query.busca !== "string") {
                return res.status(400).json({ erro: "O parâmetro busca deve ser um texto." });
            }
            const busca = req.query.busca?.trim();

            const usuarios = await prisma.usuario.findMany({
                where: busca ? {
                    ativo: true,
                    OR: [
                        { nome: { contains: busca } },
                        { ra: { contains: busca } },
                        {
                            nomesAlternativos: {
                                some: {
                                    nome_completo: { contains: busca },
                                    ativo: true,
                                    tipo: "alternativo"
                                }
                            }
                        }
                    ]
                } : {},
                orderBy: {
                    created_at: "desc"
                },
                select: {
                    id: true,
                    codigo: true,
                    ra: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                    created_at: true,
                    nomesAlternativos: {
                        where: { ativo: true },
                        select: {
                            id: true,
                            nome_completo: true,
                            documento: true,
                            parentesco: true,
                            tipo: true,
                            ativo: true
                        }
                    }
                }
            });

            return res.status(200).json(usuarios);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: "Erro ao listar usuários."
            });

        }
    },

    // =========================
    // BUSCAR USUÁRIO POR ID
    // =========================
    async findById(req, res) {

        try {

            const { id } = req.params;

            const usuario = await prisma.usuario.findUnique({
                where: {
                    id
                },
                select: {
                    id: true,
                    codigo: true,
                    ra: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                    created_at: true,
                    updated_at: true
                }
            });

            if (!usuario) {
                return res.status(404).json({
                    erro: "Usuário não encontrado."
                });
            }

            return res.status(200).json(usuario);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: "Erro ao buscar usuário."
            });
        }

    },

    // =========================
    // ATUALIZAR USUÁRIO
    // =========================
    async update(req, res) {

        try {

            const { id } = req.params;

            const { nome, email, ra, telefone, senha } = req.body;

            const usuario = await prisma.usuario.findUnique({
                where: {
                    id
                }
            });

            if (!usuario) {
                return res.status(404).json({
                    erro: "Usuário não encontrado."
                });
            }

            let senhaAtualizada = usuario.senha;

            // Caso o usuário queira trocar a senha
            if (senha) {
                senhaAtualizada = await bcrypt.hash(senha, 10);
            }

            const usuarioAtualizado = await prisma.usuario.update({

                where: {
                    id
                },

                data: {
                    nome,
                    email,
                    ra,
                    telefone,
                    senha: senhaAtualizada
                },

                select: {
                    id: true,
                    codigo: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                    updated_at: true
                }

            });

            return res.status(200).json({
                mensagem: "Usuário atualizado com sucesso!",
                usuario: usuarioAtualizado
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: "Erro ao atualizar usuário."
            });

        }

    },

    // =========================
    // DESATIVAR USUÁRIO
    // =========================
    async delete(req, res) {
        try {
            const { id } = req.params;
            const usuario = await prisma.usuario.findUnique({
                where: { id }
            });
            if (!usuario) {
                return res.status(404).json({ erro: "Usuário não encontrado." });
            }

            const usuarioDesativado = await prisma.usuario.update({
                where: { id },
                data: { ativo: false },
                select: {
                    id: true,
                    codigo: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                    updated_at: true
                }
            });

            return res.status(200).json({
                mensagem: "Usuário desativado com sucesso!",
                usuario: usuarioDesativado
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao desativar usuário." });
        }
    },

    async updateStatus(req, res) {
        try {
            const usuario = await prisma.usuario.update({
                where: { id: req.params.id },
                data: { ativo: Boolean(req.body.ativo) },
                select: { id: true, codigo: true, nome: true, email: true, ra: true, ativo: true, updated_at: true }
            });
            return res.json({ mensagem: usuario.ativo ? "Usuário ativado com sucesso!" : "Usuário desativado com sucesso!", usuario });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ erro: "Não foi possível alterar o status do usuário." });
        }
    },

        async listAlternatives(req, res) {
            try {
                const usuario = await prisma.usuario.findUnique({ where: { id: req.params.id }, select: { id: true } });
                if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

                const nomes = await prisma.nomeAlternativo.findMany({
                    where: { usuario_id: req.params.id },
                    orderBy: { created_at: "asc" }
                });
                return res.json(nomes);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao listar nomes autorizados." });
            }
        },

        async createAlternative(req, res) {
            try {
                const { nome_completo, documento, parentesco, tipo = "autorizado", ativo = true } = req.body;
                if (!String(nome_completo ?? "").trim()) {
                    return res.status(400).json({ erro: "Informe o nome autorizado." });
                }

                const usuario = await prisma.usuario.findUnique({ where: { id: req.params.id }, select: { id: true } });
                if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

                const nome = await prisma.nomeAlternativo.create({
                    data: {
                        id: uuidv4(),
                        usuario_id: req.params.id,
                        nome_completo: String(nome_completo).trim(),
                        documento: documento ? String(documento).trim() : null,
                        parentesco: parentesco || "outro",
                        tipo: tipo === "alternativo" ? "alternativo" : "autorizado",
                        ativo: Boolean(ativo)
                    }
                });
                return res.status(201).json(nome);
            } catch (error) {
                console.error(error);
                return res.status(400).json({ erro: "Erro ao cadastrar nome autorizado." });
            }
        },

        async updateAlternative(req, res) {
            try {
                const nome = await prisma.nomeAlternativo.findUnique({ where: { id: req.params.nomeId } });
                if (!nome || nome.usuario_id !== req.params.id) return res.status(404).json({ erro: "Nome autorizado não encontrado." });

                const atualizado = await prisma.nomeAlternativo.update({
                    where: { id: req.params.nomeId },
                    data: {
                        ...(req.body.nome_completo !== undefined ? { nome_completo: String(req.body.nome_completo).trim() } : {}),
                        ...(req.body.documento !== undefined ? { documento: req.body.documento ? String(req.body.documento).trim() : null } : {}),
                        ...(req.body.parentesco !== undefined ? { parentesco: req.body.parentesco } : {}),
                        ...(req.body.tipo !== undefined ? { tipo: req.body.tipo === "alternativo" ? "alternativo" : "autorizado" } : {}),
                        ...(req.body.ativo !== undefined ? { ativo: Boolean(req.body.ativo) } : {})
                    }
                });
                return res.json(atualizado);
            } catch (error) {
                console.error(error);
                return res.status(400).json({ erro: "Erro ao atualizar autorização." });
            }
        },

        async deleteAlternative(req, res) {
            try {
                const nome = await prisma.nomeAlternativo.findUnique({ where: { id: req.params.nomeId } });
                if (!nome || nome.usuario_id !== req.params.id) return res.status(404).json({ erro: "Nome autorizado não encontrado." });
                await prisma.nomeAlternativo.delete({ where: { id: req.params.nomeId } });
                return res.json({ mensagem: "Nome autorizado removido." });
            } catch (error) {
                console.error(error);
                return res.status(400).json({ erro: "Erro ao remover nome autorizado." });
            }
        }
};
