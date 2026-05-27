import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const JWT_SECRET =
  process.env.JWT_SECRET || 'chave_mestra_unasp_2024';

export const userController = {

  // REGISTRO
  async create(req, res) {
    try {

      const {
        nome,
        email,
        senha,
        telefone
      } = req.body;

      const hashedPassword = await bcrypt.hash(senha, 10);

      await prisma.usuario.create({
        data: {
          id: uuidv4(), // <- FALTAVA ISSO
          nome,
          email,
          senha: hashedPassword,
          telefone
        }
      });

      res.status(201).json({
        mensagem: 'Usuário criado com sucesso!'
      });

    } catch (error) {

      console.log(error);

      res.status(400).json({
        erro: 'Erro ao cadastrar usuário'
      });
    }
  },

  // LOGIN
  async login(req, res) {

    try {

      const {
        email,
        senha
      } = req.body;

      const usuario = await prisma.usuario.findUnique({
        where: {
          email
        }
      });

      if (!usuario) {
        return res.status(401).json({
          erro: 'E-mail ou senha inválidos'
        });
      }

      const senhaValida = await bcrypt.compare(
        senha,
        usuario.senha
      );

      if (!senhaValida) {
        return res.status(401).json({
          erro: 'E-mail ou senha inválidos'
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
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        erro: 'Erro interno do servidor'
      });
    }
  }
};