import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de nombres de archivos de GitHub a slugs de nuestra DB
const FILE_TO_SLUG_MAP: Record<string, string> = {
  'Génesis.json': 'genesis',
  'Éxodo.json': 'exodo',
  'Levítico.json': 'levitico',
  'Números.json': 'numeros',
  'Deuteronomio.json': 'deuteronomio',
  'Josué.json': 'josue',
  'Jueces.json': 'jueces',
  'Rut.json': 'rut',
  '1 Samuel.json': '1-samuel',
  '2 Samuel.json': '2-samuel',
  '1 Reyes.json': '1-reyes',
  '2 Reyes.json': '2-reyes',
  '1 Crónicas.json': '1-cronicas',
  '2 Crónicas.json': '2-cronicas',
  'Esdras.json': 'esdras',
  'Nehemías.json': 'nehemias',
  'Ester.json': 'ester',
  'Job.json': 'job',
  'Salmos.json': 'salmos',
  'Proverbios.json': 'proverbios',
  'Eclesiastés.json': 'eclesiastes',
  'Cantares.json': 'cantares',
  'Isaías.json': 'isaias',
  'Jeremías.json': 'jeremias',
  'Lamentaciones.json': 'lamentaciones',
  'Ezequiel.json': 'ezequiel',
  'Daniel.json': 'daniel',
  'Oseas.json': 'oseas',
  'Joel.json': 'joel',
  'Amós.json': 'amos',
  'Abdías.json': 'abdias',
  'Jonás.json': 'jonas',
  'Miqueas.json': 'miqueas',
  'Nahúm.json': 'nahum',
  'Habacuc.json': 'habacuc',
  'Sofonías.json': 'sofonias',
  'Hageo.json': 'hageo',
  'Aggeo.json': 'hageo',
  'Zacarías.json': 'zacarias',
  'Malaquías.json': 'malaquias',
  'San Mateo.json': 'mateo',
  'San Marcos.json': 'marcos',
  'San Márcos.json': 'marcos',
  'San Lucas.json': 'lucas',
  'San Lúcas.json': 'lucas',
  'San Juan.json': 'juan',
  'Hechos.json': 'hechos',
  'Los Actos.json': 'hechos',
  'Romanos.json': 'romanos',
  '1 Corintios.json': '1-corintios',
  '2 Corintios.json': '2-corintios',
  'Gálatas.json': 'galatas',
  'Efesios.json': 'efesios',
  'Filipenses.json': 'filipenses',
  'Colosenses.json': 'colosenses',
  '1 Tesalonicenses.json': '1-tesalonicenses',
  '2 Tesalonicenses.json': '2-tesalonicenses',
  '1 Timoteo.json': '1-timoteo',
  '2 Timoteo.json': '2-timoteo',
  'Tito.json': 'tito',
  'Filemón.json': 'filemon',
  'Hebreos.json': 'hebreos',
  'Santiago.json': 'santiago',
  '1 San Pedro.json': '1-pedro',
  '2 San Pedro.json': '2-pedro',
  '1 San Juan.json': '1-juan',
  '2 San Juan.json': '2-juan',
  '3 San Juan.json': '3-juan',
  'San Judas.json': 'judas',
  'San Júdas.json': 'judas',
  'Apocalipsis.json': 'apocalipsis',
  'Revelación.json': 'apocalipsis',
  'Miquéas.json': 'miqueas',
  'Nahum.json': 'nahum',
  'Oséas.json': 'oseas',
  'Eclesiástes.json': 'eclesiastes',
  'Ésdras.json': 'esdras',
};

interface GitHubFile {
  name: string;
  download_url: string;
}

interface BibleBook {
  book: string;
  chapters: {
    chapter: number;
    verses: {
      verse: number;
      text: string;
    }[];
  }[];
}

async function importBibleFromGithub() {
  console.log('📖 Importando Biblia RV1960 desde GitHub...\n');

  try {
    // 1. Obtener lista de archivos
    console.log('📂 Obteniendo lista de archivos...');
    const repoResponse = await fetch(
      'https://api.github.com/repos/aruljohn/Reina-Valera/contents'
    );
    const files: GitHubFile[] = await repoResponse.json();

    const jsonFiles = files.filter(f => f.name.endsWith('.json'));
    console.log(`✓ ${jsonFiles.length} archivos JSON encontrados\n`);

    let totalChapters = 0;
    let totalVerses = 0;
    let booksProcessed = 0;

    // 2. Procesar cada libro
    for (const file of jsonFiles) {
      const slug = FILE_TO_SLUG_MAP[file.name];
      if (!slug) {
        console.log(`⚠️  Saltando: ${file.name} (no mapeado)`);
        continue;
      }

      // Buscar el libro en la DB
      const book = await prisma.book.findUnique({ where: { slug } });
      if (!book) {
        console.log(`⚠️  Libro no encontrado en DB: ${slug}`);
        continue;
      }

      console.log(`📖 ${book.name}...`);

      try {
        // Descargar el archivo JSON
        const bookResponse = await fetch(file.download_url);
        const bookData: BibleBook = await bookResponse.json();

        // Procesar cada capítulo
        for (const chapterData of bookData.chapters) {
          const chapterNum = chapterData.chapter;

          // Crear objeto de versículos
          const versesObject: Record<string, string> = {};
          chapterData.verses.forEach(v => {
            versesObject[String(v.verse)] = v.text;
          });

          // Crear contenido completo
          const fullContent = chapterData.verses
            .map(v => `${v.verse} ${v.text}`)
            .join(' ');

          // Buscar o crear capítulo
          let chapter = await prisma.chapter.findFirst({
            where: { bookId: book.id, number: chapterNum },
          });

          const chapterDataDB = {
            contentRV1960: fullContent,
            versesRV1960: versesObject,
            verseCount: chapterData.verses.length,
          };

          if (chapter) {
            await prisma.chapter.update({
              where: { id: chapter.id },
              data: chapterDataDB,
            });
          } else {
            await prisma.chapter.create({
              data: {
                bookId: book.id,
                number: chapterNum,
                title: `Capítulo ${chapterNum}`,
                contentKJV: '',
                versesKJV: {},
                ...chapterDataDB,
              },
            });
          }

          totalChapters++;
          totalVerses += chapterData.verses.length;
        }

        booksProcessed++;
        console.log(`  ✅ ${bookData.chapters.length} capítulos`);

      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORTACIÓN COMPLETA!');
    console.log(`📚 Libros: ${booksProcessed} / 66`);
    console.log(`📊 Capítulos: ${totalChapters}`);
    console.log(`📊 Versículos: ${totalVerses}`);
    console.log(`🇪🇸 Versión: RV1960`);
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importBibleFromGithub();
