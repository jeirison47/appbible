import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, types } from '@neondatabase/serverless';

// Return timestamps as raw strings so Prisma's query engine receives ISO strings
types.setTypeParser(1082, (val: string) => val); // DATE
types.setTypeParser(1114, (val: string) => val); // TIMESTAMP
types.setTypeParser(1184, (val: string) => val); // TIMESTAMPTZ

const sql = neon(process.env.DATABASE_URL!);
const adapter = new PrismaNeonHTTP(sql);
const prisma = new PrismaClient({ adapter } as any);

export default prisma;
