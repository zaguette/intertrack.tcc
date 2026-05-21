// src/server.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import prisma from './config/prisma.js';

import userRoutes from './routes/userRoutes.js';
import encomendaRoutes from './routes/encomendaRoutes.js';
import nomeEntregaRoutes from './routes/nomeEntregaRoutes.js';

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Rotas
app.use('/usuarios', userRoutes);
// app.use('/nomes-entrega', nomeEntregaRoutes);
// app.use('/encomendas', encomendaRoutes);

// Rota teste
app.get('/', (req, res) => {
  res.json({
    mensagem: 'Intertrack API online! 🚀'
  });
});

let server;

async function startServer() {

  try {

    await prisma.$connect();

    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');

    server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {

    console.error('❌ Erro ao conectar ao banco de dados:', error.message);

    process.exit(1);
  }
}

startServer();

async function gracefulShutdown() {

  console.log('\n🛑 Encerrando servidor...');

  try {

    if (server) {

      server.close(async () => {

        await prisma.$disconnect();

        console.log('✅ Conexão com banco encerrada.');

        process.exit(0);
      });

    } else {

      await prisma.$disconnect();

      process.exit(0);
    }

  } catch (error) {

    console.error('❌ Erro ao encerrar servidor:', error);

    process.exit(1);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);