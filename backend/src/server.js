import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import encomendaRoutes from './routes/encomendaRoutes.js';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
// Boa prática: usa a porta do .env se existir, senão usa a 3000
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Registrando as rotas
app.use('/usuarios', userRoutes);
app.use('/encomendas', encomendaRoutes);

// Rota principal (Health Check)
app.get('/', (req, res) => {
    res.json({ mensagem: "Intertrack API online! 🚀" });
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});