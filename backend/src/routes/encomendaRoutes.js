import express from 'express';

import { encomendaController } from '../controllers/encomendaController.js';

import { verificarToken } from '../middlewares/auth.js';
import { apenasFuncionario, apenasCargos } from '../middlewares/autorizacao.js';

const router = express.Router();

// Criar encomenda — apenas funcionários
router.post(
  '/',
  verificarToken,
  apenasFuncionario,
  encomendaController.create
);

// Listar encomendas — aluno vê só as suas, funcionário vê todas (filtro já é feito no service)
router.get(
  '/',
  verificarToken,
  encomendaController.list
);

// Buscar encomenda por ID — aluno só a própria, funcionário qualquer uma (checagem no controller)
router.get(
  '/:id',
  verificarToken,
  encomendaController.getById
);

// Atualizar status — apenas funcionários
router.patch(
  '/:id/status',
  verificarToken,
  apenasFuncionario,
  encomendaController.updateStatus
);

// Excluir encomenda — apenas administrador e supervisor
router.delete(
  '/:id',
  verificarToken,
  apenasCargos("administrador", "supervisor"),
  encomendaController.delete
);

export default router;