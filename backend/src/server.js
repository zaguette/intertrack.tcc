import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connect, disconnect } from '../prisma.client.js';

// import userRoutes from './routes/userRoutes.js';
// import encomendaRoutes from './routes/encomendaRoutes.js';
// import nomeEntregaRoutes from './routes/nomeEntregaRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Rotas
// app.use('/usuarios', userRoutes);
// app.use('/nomes-entrega', nomeEntregaRoutes);
// app.use('/encomendas', encomendaRoutes);

// Rota teste
app.get('/', (req, res) => {
  res.json({ mensagem: "Intertrack API online! 🚀" });
});

let server;

async function startServer() {
  try {
    await connect();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();

function gracefulShutdown() {
  console.log('\n🛑 Encerrando servidor...');
  if (server) {
    server.close(() => {
      disconnect()
        .then(() => {
          console.log('✅ Conexão com banco de dados encerrada.');
          process.exit(0);
        })
        .catch((err) => {
          console.error('Erro ao encerrar conexão:', err);
          process.exit(1);
        });
    });
  } else {
    disconnect()
      .then(() => {
        console.log('✅ Conexão com banco de dados encerrada.');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Erro ao encerrar conexão:', err);
        process.exit(1);
      });
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);