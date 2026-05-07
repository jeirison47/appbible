import { neon, types } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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

async function run() {
  console.log('Creando tabla study_progress...');

  await sql`
    CREATE TABLE IF NOT EXISTS study_progress (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId"    TEXT NOT NULL,
      "chapterId" TEXT NOT NULL,
      score       INTEGER NOT NULL,
      "maxScore"  INTEGER NOT NULL,
      "xpEarned"  INTEGER NOT NULL DEFAULT 0,
      "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "study_progress_userId_chapterId_key" UNIQUE ("userId", "chapterId"),
      CONSTRAINT "study_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT "study_progress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES chapters(id) ON DELETE CASCADE
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS "study_progress_userId_idx" ON study_progress ("userId")`;

  console.log('Tabla study_progress creada exitosamente.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
