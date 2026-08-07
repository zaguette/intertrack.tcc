import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET;

export const userController = {

    // =========================
    // CADASTRO DE USUÁRIO
    // =========================
    async create(req, res) {
    try {

        const { nome, email, senha, telefone } = req.body;

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

        const hashedPassword = await bcrypt.hash(senha, 10);

        await prisma.usuario.create({
            data: {
                id: uuidv4(),
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

            const { email, senha } = req.body;

            const usuario = await prisma.usuario.findUnique({
                where: {
                    email
                }
            });

            if (!usuario) {
                return res.status(401).json({
                    erro: "E-mail ou senha inválidos."
                });
            }

            // Impede login de usuários desativados
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
                    email: usuario.email
                },
                JWT_SECRET,
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
                    email: usuario.email
                }
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: "Erro interno do servidor."
            });

        }

    },
 // LISTAR TODOS OS USUÁRIOS
// LISTAR TODOS OS USUÁRIOS
async findAll(req, res) {
    try {

        const usuarios = await prisma.usuario.findMany({
            orderBy: {
                created_at: "desc"
            },
            select: {
                id: true,
                codigo: true,
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

    },// =========================
// ATUALIZAR USUÁRIO
// =========================
async update(req, res) {

    try {

        const { id } = req.params;

        const { nome, email, telefone, senha } = req.body;


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

};