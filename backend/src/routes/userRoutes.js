import express from 'express';
import { userController } from '../controllers/userController.js';

const router = express.Router();

// Registro
router.post('/register', userController.create);

// Login
router.post('/login', userController.login);

export default router;