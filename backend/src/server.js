import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import encomendaRoutes from './routes/encomendaRoutes.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Registrando as rotas (Apenas uma vez cada!)
app.use('/usuarios', userRoutes);
app.use('/encomendas', encomendaRoutes);

app.get('/', (req, res) => {
    res.json({ mensagem: "Intertrack API online! 🚀" });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});