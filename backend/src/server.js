require('dotenv').config();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import encomendaRoutes from './routes/encomendaRoutes.js';
import nomeEntregaRoutes from './routes/nomeEntregaRoutes.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Rotas
app.use('/usuarios', userRoutes);
app.use('/nomes-entrega', nomeEntregaRoutes);
app.use('/encomendas', encomendaRoutes);

// Rota teste
app.get('/', (req, res) => {
  res.json({ mensagem: "Intertrack API online! 🚀" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});