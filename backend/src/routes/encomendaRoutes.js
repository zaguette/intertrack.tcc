import express from 'express';
import { criarNomeEntrega } from '../controllers/nomeEntregaController.js';

const router = express.Router();

router.post('/', criarNomeEntrega);

export default router;