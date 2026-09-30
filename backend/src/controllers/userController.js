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

            const usuarios = await prisma.usuario.findMany({
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
                    created_at: true
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

            // Verifica se o usuário existe
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

            // Desativa o usuário
            const usuarioDesativado = await prisma.usuario.update({
                where: {
                    id
                },
                data: {
                    ativo: false
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
                mensagem: "Usuário desativado com sucesso!",
                usuario: usuarioDesativado
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: "Erro ao desativar usuário."
            });

                }
        }
};