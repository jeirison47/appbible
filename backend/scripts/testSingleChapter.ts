import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_ES = 'https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api';

async function test() {
  try {
    console.log('Fetching Exodus 1...');
    const response = await fetch(`${API_ES}/books/spa-RVR1960:Exod/verses/1`);
    console.log('Response status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    const text = await response.text();
    console.log('Response length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));

    const verses = JSON.parse(text);
    console.log('Parsed! Verses:', verses.length);

    const versesObject: Record<string, string> = {};
    verses.forEach((v: any, i: number) => {
      versesObject[String(i + 1)] = v.cleanText;
    });

    console.log('Verses object keys:', Object.keys(versesObject).length);
    console.log('First verse:', versesObject['1']);

  } catch (error: any) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
