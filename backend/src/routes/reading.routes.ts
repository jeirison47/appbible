import { Hono } from 'hono';
import { ReadingController } from '../controllers/reading.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const reading = new Hono();

// Todas las rutas requieren autenticación
reading.use('*', authMiddleware);

// GET /books - Listar todos los libros
reading.get(
  '/books',
  requirePermission('read:chapters'),
  ReadingController.getBooks
);

// GET /books/:bookSlug - Obtener información de un libro
reading.get(
  '/books/:bookSlug',
  requirePermission('read:chapters'),
  ReadingController.getBook
);

// GET /books/:bookSlug/:chapterNumber - Leer un capítulo específico
reading.get(
  '/books/:bookSlug/:chapterNumber',
  requirePermission('read:chapters'),
  ReadingController.getChapter
);

// GET /verse-of-the-day - Obtener el versículo del día
reading.get(
  '/verse-of-the-day',
  requirePermission('read:chapters'),
  ReadingController.getVerseOfTheDay
);

// GET /search - Buscar versículos
reading.get(
  '/search',
  requirePermission('read:chapters'),
  ReadingController.searchVerses
);

export default reading;
