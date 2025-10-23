import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  permissions: string[];
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    c.set('userId', decoded.userId);
    c.set('permissions', decoded.permissions || []);
    await next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return c.json({ error: 'Token expired' }, 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    return c.json({ error: 'Authentication failed' }, 401);
  }
}
