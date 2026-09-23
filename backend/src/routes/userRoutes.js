// src/routes/userRoutes.js

import express from "express";
import { userController } from "../controllers/userController.js";
import { verificarToken } from "../middlewares/auth.js";
import {
    apenasFuncionario,
    apenasCargos,
    verificarDonoOuFuncionario
} from "../middlewares/autorizacao.js";

const router = express.Router();

// =========================
// ROTAS PÚBLICAS
// =========================

// Cadastro de usuário
router.post("/register", userController.create);

// Login
router.post("/login", userController.login);


// =========================
// ROTAS PROTEGIDAS
// =========================

// Perfil do usuário autenticado
router.get("/perfil", verificarToken, (req, res) => {
    return res.status(200).json({
        mensagem: "Usuário autenticado com sucesso!",
        usuario: req.user
    });
});

// =========================
// CRUD DE USUÁRIOS
// =========================

// Listar todos os usuários — apenas funcionários
router.get("/", verificarToken, apenasFuncionario, userController.findAll);

// Buscar usuário por ID — o próprio aluno ou qualquer funcionário
router.get("/:id", verificarToken, verificarDonoOuFuncionario, userController.findById);

// Atualizar usuário — o próprio aluno ou qualquer funcionário
router.put("/:id", verificarToken, verificarDonoOuFuncionario, userController.update);

// Desativar usuário — apenas administrador
router.delete("/:id", verificarToken, apenasCargos("administrador"), userController.delete);

export default router;