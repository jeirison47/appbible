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
   * Obtener todos los libros con información de completado para el usuario
   */
  static async getBooksWithCompletion(c: Context) {
    try {
      const userId = c.get('userId');

      // Obtener todos los libros
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

      // Obtener todos los capítulos completados por el usuario en una sola consulta
      const completedChapters = await prisma.chapterRead.findMany({
        where: { userId },
        select: {
          chapter: {
            select: {
              bookId: true,
            },
          },
        },
      });

      // Contar capítulos completados por libro
      const completedCountByBook = completedChapters.reduce((acc, read) => {
        const bookId = read.chapter.bookId;
        acc[bookId] = (acc[bookId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Agregar campo completed a cada libro
      const booksWithCompletion = books.map((book) => ({
        ...book,
        completed: (completedCountByBook[book.id] || 0) === book.totalChapters,
      }));

      return c.json({ books: booksWithCompletion });
    } catch (error) {
      console.error('Get books with completion error:', error);
      return c.json({ error: 'Failed to get books with completion' }, 500);
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
   * Selecciona un versículo diferente cada día sin repetirse
   */
  static async getVerseOfTheDay(c: Context) {
    try {
      const version = c.req.query('version') || 'RV1960';

      // Validar versión
      const validVersions = ['RV1960', 'KJV'];
      if (!validVersions.includes(version)) {
        return c.json({ error: 'Invalid Bible version' }, 400);
      }

      // Obtener fecha actual (solo fecha, sin hora)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar si ya existe un versículo para hoy
      const existingDailyVerse = await prisma.dailyVerse.findUnique({
        where: { date: today },
      });

      if (existingDailyVerse) {
        // Ya existe un versículo para hoy, devolverlo
        const textMap: Record<string, string> = {
          RV1960: existingDailyVerse.textRV1960,
          KJV: existingDailyVerse.textKJV,
        };

        return c.json({
          verse: {
            text: textMap[version],
            reference: {
              book: existingDailyVerse.bookName,
              bookSlug: existingDailyVerse.bookSlug,
              chapter: existingDailyVerse.chapterNumber,
              verse: existingDailyVerse.verseNumber,
              fullReference: `${existingDailyVerse.bookName} ${existingDailyVerse.chapterNumber}:${existingDailyVerse.verseNumber}`,
            },
            version,
            date: today.toISOString().split('T')[0],
          },
        });
      }

      // No existe versículo para hoy, seleccionar uno nuevo
      // Contar total de versículos mostrados
      const shownVersesCount = await prisma.dailyVerse.count();

      // Obtener todos los capítulos para calcular versículos totales aproximados
      const totalChapters = await prisma.chapter.count();
      const avgVersesPerChapter = 26; // Promedio aproximado de versículos por capítulo
      const estimatedTotalVerses = totalChapters * avgVersesPerChapter;

      // Si ya mostramos todos los versículos (o cerca), reiniciar
      if (shownVersesCount >= estimatedTotalVerses * 0.95) {
        // Eliminar versículos antiguos para reiniciar el ciclo (mantener últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        await prisma.dailyVerse.deleteMany({
          where: {
            date: {
              lt: thirtyDaysAgo,
            },
          },
        });
      }

      // Obtener versículos ya mostrados (últimos 365 días para no repetir recientes)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const shownVerses = await prisma.dailyVerse.findMany({
        where: {
          date: {
            gte: oneYearAgo,
          },
        },
        select: {
          chapterId: true,
          verseNumber: true,
        },
      });

      // Seleccionar un capítulo aleatorio
      let attempts = 0;
      let selectedVerse = null;

      while (!selectedVerse && attempts < 50) {
        attempts++;

        // Seleccionar capítulo aleatorio
        const randomSkip = Math.floor(Math.random() * totalChapters);
        const randomChapter = await prisma.chapter.findMany({
          take: 1,
          skip: randomSkip,
          include: {
            book: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        });

        if (!randomChapter || randomChapter.length === 0) {
          continue;
        }

        const chapter = randomChapter[0];

        // Seleccionar versículo aleatorio del capítulo
        const randomVerseNumber = Math.floor(Math.random() * chapter.verseCount) + 1;

        // Verificar si este versículo ya fue mostrado
        const alreadyShown = shownVerses.some(
          (sv) => sv.chapterId === chapter.id && sv.verseNumber === randomVerseNumber
        );

        if (!alreadyShown) {
          const versesRV1960: Record<string, string> = chapter.versesRV1960 as any;
          const versesKJV: Record<string, string> = chapter.versesKJV as any;

          const textRV1960 = versesRV1960[randomVerseNumber.toString()] || '';
          const textKJV = versesKJV[randomVerseNumber.toString()] || '';

          // Guardar el versículo del día en la base de datos
          const dailyVerse = await prisma.dailyVerse.create({
            data: {
              date: today,
              chapterId: chapter.id,
              verseNumber: randomVerseNumber,
              bookName: chapter.book.name,
              bookSlug: chapter.book.slug,
              chapterNumber: chapter.number,
              textRV1960,
              textKJV,
            },
          });

          selectedVerse = dailyVerse;
        }
      }

      if (!selectedVerse) {
        return c.json({ error: 'Failed to select a verse' }, 500);
      }

      const textMap: Record<string, string> = {
        RV1960: selectedVerse.textRV1960,
        KJV: selectedVerse.textKJV,
      };

      return c.json({
        verse: {
          text: textMap[version],
          reference: {
            book: selectedVerse.bookName,
            bookSlug: selectedVerse.bookSlug,
            chapter: selectedVerse.chapterNumber,
            verse: selectedVerse.verseNumber,
            fullReference: `${selectedVerse.bookName} ${selectedVerse.chapterNumber}:${selectedVerse.verseNumber}`,
          },
          version,
          date: today.toISOString().split('T')[0],
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
