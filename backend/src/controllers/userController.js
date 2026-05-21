import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { gerarId } from '../models/id.models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_mestra_unasp_2024';

export async function criarUsuario(req, res) {

        try {

            const {
                nome,
                email,
                senha,
                telefone
            } = req.body;

            const hashedPassword = await bcrypt.hash(senha, 10);

            const novoUsuario = await prisma.usuario.create({
                data: {
                    id: gerarId(),
                    nome,
                    email,
                    senha: hashedPassword,
                    telefone
                }
            });

            res.status(201).json({
                mensagem: "Usuário criado com sucesso!",
                usuario: novoUsuario
            });

        } catch (error) {

            console.log(error);

            res.status(400).json({
                erro: "Erro ao cadastrar."
            });
        }
    }

export const userController = {

    // async criarUsuario(req, res) {

    //     try {

    //         const {
    //             nome,
    //             email,
    //             senha,
    //             telefone
    //         } = req.body;

    //         const hashedPassword = await bcrypt.hash(senha, 10);

    //         const novoUsuario = await prisma.usuario.create({
    //             data: {
    //                 id: gerarId(),
    //                 nome,
    //                 email,
    //                 senha: hashedPassword,
    //                 telefone
    //             }
    //         });

    //         res.status(201).json({
    //             mensagem: "Usuário criado com sucesso!",
    //             usuario: novoUsuario
    //         });

    //     } catch (error) {

    //         console.log(error);

    //         res.status(400).json({
    //             erro: "Erro ao cadastrar."
    //         });
    //     }
    // },

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
                    id: usuario.id
                },
                JWT_SECRET,
                {
                    expiresIn: '8h'
                }
            );

            res.json({
                auth: true,
                token,
                user: {
                    nome: usuario.nome
                }
            });

        } catch (error) {

            res.status(500).json({
                erro: "Erro interno no servidor."
            });
        }
    }
};