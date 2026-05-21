// src/routes/userRoutes.js

import { Router } from 'express';

import {
  criarUsuario
} from '../controllers/userController.js';

const router = Router();

router.post('/', criarUsuario);

export default router;