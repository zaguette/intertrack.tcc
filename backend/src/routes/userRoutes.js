import express from 'express';
import { userController } from '../controllers/userController.js';

const router = express.Router();

// Rotas de Usuário
router.get('/', userController.listAll);
router.post('/register', userController.create);
router.post('/nomes', userController.addDeliveryName);

export default router;