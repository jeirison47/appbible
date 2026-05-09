import { Hono } from 'hono';
import { ReadingController } from '../controllers/reading.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const reading = new Hono();

// GET /books/with-completion - requiere auth (usa datos del usuario)
reading.get(
  '/books/with-completion',
  authMiddleware,
  requirePermission('read:chapters'),
  ReadingController.getBooksWithCompletion
);

// GET /versions - público
reading.get('/versions', optionalAuthMiddleware, ReadingController.getBibleVersions);

// GET /books - público
reading.get('/books', optionalAuthMiddleware, ReadingController.getBooks);

// GET /books/:bookSlug - público
reading.get('/books/:bookSlug', optionalAuthMiddleware, ReadingController.getBook);

// GET /books/:bookSlug/:chapterNumber - público
reading.get('/books/:bookSlug/:chapterNumber', optionalAuthMiddleware, ReadingController.getChapter);

// GET /verse-of-the-day - público
reading.get('/verse-of-the-day', optionalAuthMiddleware, ReadingController.getVerseOfTheDay);

// GET /search - público
reading.get('/search', optionalAuthMiddleware, ReadingController.searchVerses);

export default reading;
