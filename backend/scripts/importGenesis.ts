import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para importar Génesis completo
 *
 * NOTA: En producción, esto se haría con una API como API.Bible
 * Para el MVP, vamos a crear solo el capítulo 1 como ejemplo
 */

const genesisChapter1 = {
  number: 1,
  title: 'La Creación',
  verseCount: 31,

  // Reina Valera 1960
  contentRV1960: `En el principio creó Dios los cielos y la tierra. Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas. Y dijo Dios: Sea la luz; y fue la luz. Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas. Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.`,

  versesRV1960: {
    "1": "En el principio creó Dios los cielos y la tierra.",
    "2": "Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.",
    "3": "Y dijo Dios: Sea la luz; y fue la luz.",
    "4": "Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.",
    "5": "Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día."
  },

  // Nueva Versión Internacional
  contentNVI: `Dios, en el principio, creó los cielos y la tierra. La tierra era un caos total, las tinieblas cubrían el abismo, y el Espíritu de Dios iba y venía sobre la superficie de las aguas. Y dijo Dios: "¡Que exista la luz!" Y la luz llegó a existir. Dios consideró que la luz era buena y la separó de las tinieblas. Dios llamó a la luz "día", y a las tinieblas, "noche". Y vino la noche, y llegó la mañana: ése fue el primer día.`,

  versesNVI: {
    "1": "Dios, en el principio, creó los cielos y la tierra.",
    "2": "La tierra era un caos total, las tinieblas cubrían el abismo, y el Espíritu de Dios iba y venía sobre la superficie de las aguas.",
    "3": "Y dijo Dios: \"¡Que exista la luz!\" Y la luz llegó a existir.",
    "4": "Dios consideró que la luz era buena y la separó de las tinieblas.",
    "5": "Dios llamó a la luz \"día\", y a las tinieblas, \"noche\". Y vino la noche, y llegó la mañana: ése fue el primer día."
  },

  // Traducción en Lenguaje Actual
  contentTLA: `Cuando Dios comenzó a crear los cielos y la tierra, no había nada. No se veía nada, todo estaba oscuro y cubierto de agua, pero el espíritu de Dios se movía sobre el agua. Entonces Dios dijo: "Que haya luz". Y hubo luz. Al ver Dios que la luz era buena, la separó de la oscuridad. A la luz la llamó "día", y a la oscuridad la llamó "noche". De este modo se completó el primer día.`,

  versesTLA: {
    "1": "Cuando Dios comenzó a crear los cielos y la tierra,",
    "2": "no había nada. No se veía nada, todo estaba oscuro y cubierto de agua, pero el espíritu de Dios se movía sobre el agua.",
    "3": "Entonces Dios dijo: \"Que haya luz\". Y hubo luz.",
    "4": "Al ver Dios que la luz era buena, la separó de la oscuridad.",
    "5": "A la luz la llamó \"día\", y a la oscuridad la llamó \"noche\". De este modo se completó el primer día."
  },

  // Nueva Traducción Viviente
  contentNTV: `En el principio, Dios creó los cielos y la tierra. La tierra no tenía forma y estaba vacía, y la oscuridad cubría las aguas profundas; y el Espíritu de Dios se movía en el aire sobre la superficie de las aguas. Entonces Dios dijo: «Que haya luz»; y hubo luz. Y Dios vio que la luz era buena. Luego separó la luz de la oscuridad. Dios llamó a la luz «día» y a la oscuridad «noche». Y pasó la tarde y llegó la mañana, así se cumplió el primer día.`,

  versesNTV: {
    "1": "En el principio, Dios creó los cielos y la tierra.",
    "2": "La tierra no tenía forma y estaba vacía, y la oscuridad cubría las aguas profundas; y el Espíritu de Dios se movía en el aire sobre la superficie de las aguas.",
    "3": "Entonces Dios dijo: «Que haya luz»; y hubo luz.",
    "4": "Y Dios vio que la luz era buena. Luego separó la luz de la oscuridad.",
    "5": "Dios llamó a la luz «día» y a la oscuridad «noche». Y pasó la tarde y llegó la mañana, así se cumplió el primer día."
  }
};

async function main() {
  console.log('📖 Importando Génesis...\n');

  // Buscar libro de Génesis
  const genesis = await prisma.book.findUnique({
    where: { slug: 'genesis' },
  });

  if (!genesis) {
    throw new Error('Libro de Génesis no encontrado');
  }

  // Verificar si el capítulo ya existe
  const existing = await prisma.chapter.findUnique({
    where: {
      bookId_number: {
        bookId: genesis.id,
        number: 1,
      },
    },
  });

  if (existing) {
    console.log('⚠️  Génesis 1 ya existe, saltando...');
    return;
  }

  // Crear capítulo 1 de Génesis
  await prisma.chapter.create({
    data: {
      bookId: genesis.id,
      ...genesisChapter1,
    },
  });

  console.log('✅ Génesis 1 importado correctamente');
  console.log('\n📊 Resumen:');
  console.log(`  - Libro: Génesis`);
  console.log(`  - Capítulo: 1 - ${genesisChapter1.title}`);
  console.log(`  - Versículos: ${genesisChapter1.verseCount}`);
  console.log(`  - Versiones: 4 (RV1960, NVI, TLA, NTV)`);
  console.log('\n💡 Nota: Para importar los 49 capítulos restantes,');
  console.log('   necesitarás usar una API como API.Bible o un archivo completo.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
