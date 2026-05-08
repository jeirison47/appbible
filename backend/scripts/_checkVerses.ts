import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient() as any;

async function main() {
  const book = await prisma.book.findUnique({ where: { slug: 'genesis' } });
  const ch1 = await prisma.chapter.findUnique({ where: { bookId_number: { bookId: book.id, number: 1 } } });
  const cv1 = await prisma.chapterVersion.findUnique({
    where: { chapterId_versionCode: { chapterId: ch1.id, versionCode: 'RVR1960' } },
  });

  const v1 = cv1?.verses as any[];
  console.log('Gen 1 - total versiculos en DB:', v1.length);
  console.log('Gen 1 - ultimo versículo:', JSON.stringify(v1[v1.length - 1]));
  console.log('Gen 1 - primer versículo:', JSON.stringify(v1[0]));

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
