import express from 'express';

import { encomendaController } from '../controllers/encomendaController.js';

import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

// Criar encomenda
router.post(
  '/',
  verificarToken,
  encomendaController.create
);

// Listar encomendas
router.get(
  '/',
  verificarToken,
  encomendaController.list
);

// Buscar encomenda por ID
router.get(
  '/:id',
  verificarToken,
  encomendaController.getById
);

// Atualizar status
router.patch(
  '/:id/status',
  verificarToken,
  encomendaController.updateStatus
);

// Deletar encomenda
router.delete(
  '/:id',
  verificarToken,
  encomendaController.delete
);

export default router;