import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

import authRoutes from './routes/auth.routes';
import readingRoutes from './routes/reading.routes';
import adminRoutes from './routes/admin.routes';
import progressRoutes from './routes/progress.routes';
import configRoutes from './routes/config.routes';
import { tutorialRoutes } from './routes/tutorial.routes';
import { initializeDefaultConfig } from './scripts/init-config';

const app = new Hono();

// CORS Configuration - Supports both development and production
const allowedOrigins = process.env.FRONTEND_URL
  ? [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL
    ]
  : ['http://localhost:5173', 'http://localhost:5174'];

// Middleware global
app.use('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Health check
app.get('/health', (c) => c.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  service: 'Manah API',
}));

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/reading', readingRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/progress', progressRoutes);
app.route('/api/config', configRoutes);
app.route('/api/tutorials', tutorialRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Initialize default configuration
initializeDefaultConfig().catch(console.error);

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log('\n🚀 Manah Backend API');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Server: http://localhost:${port}`);
console.log(`🏥 Health: http://localhost:${port}/health`);
console.log(`📖 Docs: http://localhost:${port}/api`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0', // Required for Render/Docker containers
});
