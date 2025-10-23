import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReadingController {
  /**
   * Obtener todos los libros de la Biblia
   */
  static async getBooks(c: Context) {
    try {
      const books = await prisma.book.findMany({
        orderBy: { order: 'asc' },
        select: {
          id: true,
          testament: true,
          category: true,
          name: true,
          slug: true,
          order: true,
          totalChapters: true,
          isAvailableInPath: true,
        },
      });

      return c.json({ books });
    } catch (error) {
      console.error('Get books error:', error);
      return c.json({ error: 'Failed to get books' }, 500);
    }
  }

  /**
   * Obtener un capítulo específico de un libro
   */
  static async getChapter(c: Context) {
    try {
      const bookSlug = c.req.param('bookSlug');
      const chapterNumber = c.req.param('chapterNumber');
      const version = c.req.query('version') || 'RV1960';
      const userId = c.get('userId'); // Del middleware de autenticación

      // Validar versión (solo RV1960 y KJV disponibles)
      const validVersions = ['RV1960', 'KJV'];
      if (!validVersions.includes(version)) {
        return c.json({ error: 'Invalid Bible version' }, 400);
      }

      // Buscar libro
      const book = await prisma.book.findUnique({
        where: { slug: bookSlug },
      });

      if (!book) {
        return c.json({ error: 'Book not found' }, 404);
      }

      // Buscar capítulo
      const chapter = await prisma.chapter.findUnique({
        where: {
          bookId_number: {
            bookId: book.id,
            number: parseInt(chapterNumber),
          },
        },
      });

      if (!chapter) {
        return c.json({ error: 'Chapter not found' }, 404);
      }

      // Verificar si el capítulo ya fue completado
      const chapterRead = await prisma.chapterRead.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId: chapter.id,
          },
        },
      });

      // Buscar siguiente capítulo si existe
      let nextChapter = null;
      if (chapter.number < book.totalChapters) {
        const next = await prisma.chapter.findUnique({
          where: {
            bookId_number: {
              bookId: book.id,
              number: chapter.number + 1,
            },
          },
          select: {
            number: true,
            title: true,
          },
        });
        if (next) {
          nextChapter = next;
        }
      }

      // Mapear contenido según versión (solo RV1960 y KJV disponibles)
      const contentMap: Record<string, string> = {
        RV1960: chapter.contentRV1960,
        KJV: chapter.contentKJV,
      };

      const versesMap: Record<string, any> = {
        RV1960: chapter.versesRV1960,
        KJV: chapter.versesKJV,
      };

      return c.json({
        book: {
          id: book.id,
          name: book.name,
          slug: book.slug,
          testament: book.testament,
          category: book.category,
          totalChapters: book.totalChapters,
        },
        chapter: {
          id: chapter.id,
          number: chapter.number,
          title: chapter.title,
          content: contentMap[version],
          verses: versesMap[version],
          verseCount: chapter.verseCount,
        },
        version,
        isCompleted: !!chapterRead,
        nextChapter,
      });
    } catch (error) {
      console.error('Get chapter error:', error);
      return c.json({ error: 'Failed to get chapter' }, 500);
    }
  }

  /**
   * Obtener información de un libro específico
   */
  static async getBook(c: Context) {
    try {
      const bookSlug = c.req.param('bookSlug');

      const book = await prisma.book.findUnique({
        where: { slug: bookSlug },
        include: {
          chapters: {
            select: {
              number: true,
              title: true,
              verseCount: true,
            },
            orderBy: { number: 'asc' },
          },
        },
      });

      if (!book) {
        return c.json({ error: 'Book not found' }, 404);
      }

      return c.json({ book });
    } catch (error) {
      console.error('Get book error:', error);
      return c.json({ error: 'Failed to get book' }, 500);
    }
  }

  /**
   * Obtener el versículo del día
   * Selecciona un versículo diferente cada día basado en la fecha
   */
  static async getVerseOfTheDay(c: Context) {
    try {
      const version = c.req.query('version') || 'RV1960';

      // Validar versión
      const validVersions = ['RV1960', 'KJV'];
      if (!validVersions.includes(version)) {
        return c.json({ error: 'Invalid Bible version' }, 400);
      }

      // Obtener fecha actual (YYYY-MM-DD)
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Crear un número pseudo-aleatorio basado en la fecha
      // Esto garantiza que el mismo día siempre retorne el mismo versículo
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      const seed = Math.abs(hash);

      // Obtener el total de capítulos para seleccionar uno al azar
      const totalChapters = await prisma.chapter.count();
      const selectedChapterIndex = seed % totalChapters;

      // Obtener el capítulo seleccionado
      const chapter = await prisma.chapter.findMany({
        take: 1,
        skip: selectedChapterIndex,
        include: {
          book: {
            select: {
              name: true,
              slug: true,
              testament: true,
            },
          },
        },
      });

      if (!chapter || chapter.length === 0) {
        return c.json({ error: 'No chapter found' }, 404);
      }

      const selectedChapter = chapter[0];

      // Seleccionar un versículo aleatorio del capítulo
      const verseIndex = (seed * 7) % selectedChapter.verseCount; // Multiplicar por un primo para más variación
      const verseNumber = verseIndex + 1;

      const versesMap: Record<string, any> = {
        RV1960: selectedChapter.versesRV1960,
        KJV: selectedChapter.versesKJV,
      };

      const verses = versesMap[version];
      const verseText = verses[verseNumber.toString()];

      return c.json({
        verse: {
          text: verseText,
          reference: {
            book: selectedChapter.book.name,
            bookSlug: selectedChapter.book.slug,
            chapter: selectedChapter.number,
            verse: verseNumber,
            fullReference: `${selectedChapter.book.name} ${selectedChapter.number}:${verseNumber}`,
          },
          version,
          date: dateStr,
        },
      });
    } catch (error) {
      console.error('Get verse of the day error:', error);
      return c.json({ error: 'Failed to get verse of the day' }, 500);
    }
  }

  /**
   * Buscar versículos por referencia o palabra clave
   */
  static async searchVerses(c: Context) {
    try {
      const query = c.req.query('q');
      const version = c.req.query('version') || 'RV1960';
      const limit = parseInt(c.req.query('limit') || '50');

      if (!query) {
        return c.json({ error: 'Query parameter is required' }, 400);
      }

      // Validar versión
      const validVersions = ['RV1960', 'KJV'];
      if (!validVersions.includes(version)) {
        return c.json({ error: 'Invalid Bible version' }, 400);
      }

      // Intentar parsear como referencia (ej: "Juan 3:16" o "Genesis 1")
      const referenceRegex = /^([a-záéíóúñ\s]+)\s+(\d+)(?::(\d+))?$/i;
      const match = query.match(referenceRegex);

      if (match) {
        // Búsqueda por referencia
        const bookName = match[1].trim();
        const chapterNumber = parseInt(match[2]);
        const verseNumber = match[3] ? parseInt(match[3]) : null;

        // Buscar libro por nombre (insensible a mayúsculas/minúsculas)
        const book = await prisma.book.findFirst({
          where: {
            name: {
              contains: bookName,
              mode: 'insensitive',
            },
          },
        });

        if (!book) {
          return c.json({
            success: false,
            message: 'Libro no encontrado',
            results: [],
          });
        }

        // Buscar capítulo
        const chapter = await prisma.chapter.findUnique({
          where: {
            bookId_number: {
              bookId: book.id,
              number: chapterNumber,
            },
          },
          include: {
            book: true,
          },
        });

        if (!chapter) {
          return c.json({
            success: false,
            message: 'Capítulo no encontrado',
            results: [],
          });
        }

        const versesMap: Record<string, any> = {
          RV1960: chapter.versesRV1960,
          KJV: chapter.versesKJV,
        };

        const verses = versesMap[version];

        if (verseNumber) {
          // Búsqueda de versículo específico
          const verseText = verses[verseNumber.toString()];
          if (!verseText) {
            return c.json({
              success: false,
              message: 'Versículo no encontrado',
              results: [],
            });
          }

          return c.json({
            success: true,
            type: 'reference',
            results: [
              {
                book: chapter.book.name,
                bookSlug: chapter.book.slug,
                chapter: chapter.number,
                verse: verseNumber,
                text: verseText,
                reference: `${chapter.book.name} ${chapter.number}:${verseNumber}`,
              },
            ],
          });
        } else {
          // Retornar todo el capítulo
          const verseResults = Object.entries(verses).map(([num, text]) => ({
            book: chapter.book.name,
            bookSlug: chapter.book.slug,
            chapter: chapter.number,
            verse: parseInt(num),
            text: text as string,
            reference: `${chapter.book.name} ${chapter.number}:${num}`,
          }));

          return c.json({
            success: true,
            type: 'reference',
            results: verseResults,
          });
        }
      } else {
        // Búsqueda por palabra clave en el contenido
        const searchTerm = query.toLowerCase();

        // Buscar en el contenido de los capítulos
        const chapters = await prisma.chapter.findMany({
          where: {
            OR: [
              {
                contentRV1960: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              version === 'KJV'
                ? {
                    contentKJV: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    },
                  }
                : {},
            ],
          },
          include: {
            book: true,
          },
          take: 20, // Limitar a 20 capítulos para evitar sobrecarga
        });

        const results: any[] = [];

        // Buscar en los versículos de cada capítulo
        for (const chapter of chapters) {
          const versesMap: Record<string, any> = {
            RV1960: chapter.versesRV1960,
            KJV: chapter.versesKJV,
          };

          const verses = versesMap[version];

          Object.entries(verses).forEach(([num, text]) => {
            const verseText = text as string;
            if (verseText.toLowerCase().includes(searchTerm)) {
              results.push({
                book: chapter.book.name,
                bookSlug: chapter.book.slug,
                chapter: chapter.number,
                verse: parseInt(num),
                text: verseText,
                reference: `${chapter.book.name} ${chapter.number}:${num}`,
              });
            }
          });

          // Limitar resultados
          if (results.length >= limit) {
            break;
          }
        }

        return c.json({
          success: true,
          type: 'keyword',
          query: searchTerm,
          results: results.slice(0, limit),
          total: results.length,
        });
      }
    } catch (error) {
      console.error('Search verses error:', error);
      return c.json({ error: 'Failed to search verses' }, 500);
    }
  }
}
