import express from 'express';

import { nomeEntregaController }
from '../controllers/nomeEntregaController.js';

import { verificarToken }
from '../middlewares/auth.js';

const router = express.Router();

router.post(
  '/',
  verificarToken,
  nomeEntregaController.create
);

router.get(
  '/',
  verificarToken,
  nomeEntregaController.list
);

router.delete(
  '/:id',
  verificarToken,
  nomeEntregaController.delete
);

export default router;