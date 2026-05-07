import "dotenv/config";
import express from "express";
import cors from "cors";

import { prisma } from "./config/prisma.js";

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
app.get("/", (req, res) => {
  res.json({ mensagem: "Intertrack API online! 🚀" });
});

let server;

async function main() {
  try {
    await prisma.$connect();
    console.log("Conexão bem-sucedida com o banco de dados!");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
