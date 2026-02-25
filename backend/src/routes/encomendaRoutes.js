import express from 'express';
import { encomendaController } from '../controllers/encomendaController.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verificarToken, encomendaController.create);
router.get('/', verificarToken, encomendaController.list);

export default router;