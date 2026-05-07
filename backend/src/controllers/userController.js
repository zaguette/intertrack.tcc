import { getPrisma } from '../../prisma.client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_mestra_unasp_2024';

export const userController = {
    // Registro com senha protegida
    async create(req, res) {
        try {
            const prisma = await getPrisma();
            const { nome, email, senha, tipo_id, telefone } = req.body;
            const hashedPassword = await bcrypt.hash(senha, 10);

            const novoUsuario = await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    senha: hashedPassword,
                    tipo_id: Number(tipo_id),
                    telefone
                }
            });
            res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
        } catch (error) {
            res.status(400).json({ erro: "Erro ao cadastrar. E-mail já existe." });
        }
    },

    // Login e Geração de Token
    async login(req, res) {
        try {
            const prisma = await getPrisma();
            const { email, senha } = req.body;
            const usuario = await prisma.usuario.findUnique({ where: { email } });

            if (!usuario) return res.status(401).json({ erro: "E-mail ou senha inválidos." });

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) return res.status(401).json({ erro: "E-mail ou senha inválidos." });

            // Gera o token com o ID e o Tipo do usuário (admin/func/aluno)
            const token = jwt.sign(
                { id: usuario.id, tipo: usuario.tipo_id },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({
                auth: true,
                token,
                user: { nome: usuario.nome, tipo: usuario.tipo_id }
            });
        } catch (error) {
            res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }
};