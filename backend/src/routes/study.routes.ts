import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware';
import { StudyController } from '../controllers/study.controller';

const study = new Hono();

study.use('/*', authMiddleware);

study.get('/books', StudyController.getBooks);
study.get('/books/:bookSlug', StudyController.getBook);
study.get('/books/:bookSlug/:chapterNumber/lesson', StudyController.getLesson);
study.post('/complete-lesson', StudyController.completeLesson);

export default study;
