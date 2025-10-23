import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const genesis = await prisma.book.findUnique({
    where: { slug: 'genesis' },
    include: {
      chapters: {
        orderBy: { number: 'asc' }
      }
    }
  });

  console.log(`Capítulos de Génesis: ${genesis?.chapters.length || 0} de 50`);

  if (genesis && genesis.chapters.length > 0) {
    const sample = genesis.chapters[0];
    const verses = sample.versesRV1960 as Record<string, string>;
    console.log(`\nCapítulo 1 tiene ${Object.keys(verses).length} versículos`);
    console.log(`Primer versículo: ${verses['1'].substring(0, 100)}...`);
  }

  await prisma.$disconnect();
}

run();
