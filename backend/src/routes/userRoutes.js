// src/routes/userRoutes.js

import express from "express";
import { userController } from "../controllers/userController.js";
import { verificarToken } from "../middlewares/auth.js";

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

export default router;