import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const total = await prisma.chapter.count();
  const withContent = await prisma.chapter.count({
    where: { NOT: { contentRV1960: '' } }
  });

  console.log(`Total: ${total}`);
  console.log(`Con contenido RV1960: ${withContent}`);

  await prisma.$disconnect();
}

run();
