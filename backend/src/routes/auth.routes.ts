import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const auth = new Hono();

// Rutas públicas
auth.post('/register', AuthController.register);
auth.post('/login', AuthController.login);

// Rutas protegidas
auth.get('/me', authMiddleware, AuthController.me);

export default auth;
