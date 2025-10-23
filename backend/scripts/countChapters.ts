import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countChapters() {
  const total = await prisma.chapter.count();
  const withKJV = await prisma.chapter.count({
    where: { NOT: { contentKJV: '' } }
  });
  const withRV = await prisma.chapter.count({
    where: { NOT: { contentRV1960: '' } }
  });

  console.log('Total capitulos: ' + total);
  console.log('Con contenido RV1960: ' + withRV);
  console.log('Con contenido KJV: ' + withKJV);

  const sample = await prisma.chapter.findFirst({
    where: { bookId: 1, number: 1 },
    select: {
      title: true,
      verseCount: true,
      contentRV1960: true,
      contentKJV: true
    }
  });

  if (sample) {
    console.log('\nEjemplo (Genesis 1):');
    console.log('Versiculos: ' + sample.verseCount);
    console.log('RV1960 tiene contenido: ' + (sample.contentRV1960.length > 0 ? 'SI' : 'NO'));
    console.log('KJV tiene contenido: ' + (sample.contentKJV.length > 0 ? 'SI' : 'NO'));
  }

  await prisma.$disconnect();
}

countChapters();
