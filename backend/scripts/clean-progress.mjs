import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, types } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Cargar .env manualmente
try {
  const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [key, ...val] = line.split('=');
    if (key && val.length) {
      const v = val.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = v;
    }
  }
} catch {}

types.setTypeParser(1082, (val) => val);
types.setTypeParser(1114, (val) => val);
types.setTypeParser(1184, (val) => val);

const sql = neon(process.env.DATABASE_URL);
const adapter = new PrismaNeonHTTP(sql);
const prisma = new PrismaClient({ adapter });

async function cleanProgress() {
  console.log('Limpiando progreso...');

  const chapterReads = await prisma.chapterRead.deleteMany({});
  console.log(`chapterRead eliminados: ${chapterReads.count}`);

  const bookProgress = await prisma.bookProgress.deleteMany({});
  console.log(`bookProgress eliminados: ${bookProgress.count}`);

  console.log('Listo.');
  await prisma.$disconnect();
}

cleanProgress().catch((e) => {
  console.error(e);
  process.exit(1);
});
