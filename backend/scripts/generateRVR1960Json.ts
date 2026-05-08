import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPO_URL = 'https://api.github.com/repos/aruljohn/Reina-Valera/contents';

const FILE_TO_SLUG: Record<string, { slug: string; name: string }> = {
  'Génesis.json':           { slug: 'genesis',           name: 'Génesis' },
  'Éxodo.json':             { slug: 'exodo',             name: 'Éxodo' },
  'Levítico.json':          { slug: 'levitico',          name: 'Levítico' },
  'Números.json':           { slug: 'numeros',           name: 'Números' },
  'Deuteronomio.json':      { slug: 'deuteronomio',      name: 'Deuteronomio' },
  'Josué.json':             { slug: 'josue',             name: 'Josué' },
  'Jueces.json':            { slug: 'jueces',            name: 'Jueces' },
  'Rut.json':               { slug: 'rut',               name: 'Rut' },
  '1 Samuel.json':          { slug: '1-samuel',          name: '1 Samuel' },
  '2 Samuel.json':          { slug: '2-samuel',          name: '2 Samuel' },
  '1 Reyes.json':           { slug: '1-reyes',           name: '1 Reyes' },
  '2 Reyes.json':           { slug: '2-reyes',           name: '2 Reyes' },
  '1 Crónicas.json':        { slug: '1-cronicas',        name: '1 Crónicas' },
  '2 Crónicas.json':        { slug: '2-cronicas',        name: '2 Crónicas' },
  'Esdras.json':            { slug: 'esdras',            name: 'Esdras' },
  'Nehemías.json':          { slug: 'nehemias',          name: 'Nehemías' },
  'Ester.json':             { slug: 'ester',             name: 'Ester' },
  'Job.json':               { slug: 'job',               name: 'Job' },
  'Salmos.json':            { slug: 'salmos',            name: 'Salmos' },
  'Proverbios.json':        { slug: 'proverbios',        name: 'Proverbios' },
  'Eclesiastés.json':       { slug: 'eclesiastes',       name: 'Eclesiastés' },
  'Cantares.json':          { slug: 'cantares',          name: 'Cantares' },
  'Isaías.json':            { slug: 'isaias',            name: 'Isaías' },
  'Jeremías.json':          { slug: 'jeremias',          name: 'Jeremías' },
  'Lamentaciones.json':     { slug: 'lamentaciones',     name: 'Lamentaciones' },
  'Ezequiel.json':          { slug: 'ezequiel',          name: 'Ezequiel' },
  'Daniel.json':            { slug: 'daniel',            name: 'Daniel' },
  'Oseas.json':             { slug: 'oseas',             name: 'Oseas' },
  'Joel.json':              { slug: 'joel',              name: 'Joel' },
  'Amós.json':              { slug: 'amos',              name: 'Amós' },
  'Abdías.json':            { slug: 'abdias',            name: 'Abdías' },
  'Jonás.json':             { slug: 'jonas',             name: 'Jonás' },
  'Miqueas.json':           { slug: 'miqueas',           name: 'Miqueas' },
  'Nahúm.json':             { slug: 'nahum',             name: 'Nahúm' },
  'Habacuc.json':           { slug: 'habacuc',           name: 'Habacuc' },
  'Sofonías.json':          { slug: 'sofonias',          name: 'Sofonías' },
  'Hageo.json':             { slug: 'hageo',             name: 'Hageo' },
  'Zacarías.json':          { slug: 'zacarias',          name: 'Zacarías' },
  'Malaquías.json':         { slug: 'malaquias',         name: 'Malaquías' },
  'San Mateo.json':         { slug: 'mateo',             name: 'Mateo' },
  'San Marcos.json':        { slug: 'marcos',            name: 'Marcos' },
  'San Lucas.json':         { slug: 'lucas',             name: 'Lucas' },
  'San Juan.json':          { slug: 'juan',              name: 'Juan' },
  'Hechos.json':            { slug: 'hechos',            name: 'Hechos' },
  'Romanos.json':           { slug: 'romanos',           name: 'Romanos' },
  '1 Corintios.json':       { slug: '1-corintios',       name: '1 Corintios' },
  '2 Corintios.json':       { slug: '2-corintios',       name: '2 Corintios' },
  'Gálatas.json':           { slug: 'galatas',           name: 'Gálatas' },
  'Efesios.json':           { slug: 'efesios',           name: 'Efesios' },
  'Filipenses.json':        { slug: 'filipenses',        name: 'Filipenses' },
  'Colosenses.json':        { slug: 'colosenses',        name: 'Colosenses' },
  '1 Tesalonicenses.json':  { slug: '1-tesalonicenses',  name: '1 Tesalonicenses' },
  '2 Tesalonicenses.json':  { slug: '2-tesalonicenses',  name: '2 Tesalonicenses' },
  '1 Timoteo.json':         { slug: '1-timoteo',         name: '1 Timoteo' },
  '2 Timoteo.json':         { slug: '2-timoteo',         name: '2 Timoteo' },
  'Tito.json':              { slug: 'tito',              name: 'Tito' },
  'Filemón.json':           { slug: 'filemon',           name: 'Filemón' },
  'Hebreos.json':           { slug: 'hebreos',           name: 'Hebreos' },
  'Santiago.json':          { slug: 'santiago',          name: 'Santiago' },
  '1 San Pedro.json':       { slug: '1-pedro',           name: '1 Pedro' },
  '2 San Pedro.json':       { slug: '2-pedro',           name: '2 Pedro' },
  '1 San Juan.json':        { slug: '1-juan',            name: '1 Juan' },
  '2 San Juan.json':        { slug: '2-juan',            name: '2 Juan' },
  '3 San Juan.json':        { slug: '3-juan',            name: '3 Juan' },
  'San Judas.json':         { slug: 'judas',             name: 'Judas' },
  'Apocalipsis.json':       { slug: 'apocalipsis',       name: 'Apocalipsis' },
  // Aliases
  'Aggeo.json':             { slug: 'hageo',             name: 'Hageo' },
  'San Márcos.json':        { slug: 'marcos',            name: 'Marcos' },
  'San Lúcas.json':         { slug: 'lucas',             name: 'Lucas' },
  'Los Actos.json':         { slug: 'hechos',            name: 'Hechos' },
  'Miquéas.json':           { slug: 'miqueas',           name: 'Miqueas' },
  'Nahum.json':             { slug: 'nahum',             name: 'Nahúm' },
  'Oséas.json':             { slug: 'oseas',             name: 'Oseas' },
  'Eclesiástes.json':       { slug: 'eclesiastes',       name: 'Eclesiastés' },
  'Ésdras.json':            { slug: 'esdras',            name: 'Esdras' },
  'San Júdas.json':         { slug: 'judas',             name: 'Judas' },
  'Revelación.json':        { slug: 'apocalipsis',       name: 'Apocalipsis' },
};

interface GitHubFile {
  name: string;
  download_url: string;
}

interface SourceVerse {
  verse: number;
  text: string;
}

interface SourceChapter {
  chapter: number;
  verses: SourceVerse[];
}

interface SourceBook {
  book: string;
  chapters: SourceChapter[];
}

interface OutputVerse {
  number: number;
  text: string;
}

interface OutputChapter {
  number: number;
  verseCount: number;
  verses: OutputVerse[];
}

interface OutputBook {
  slug: string;
  name: string;
  chapters: OutputChapter[];
}

async function main() {
  console.log('📖 Descargando RVR1960 desde GitHub (aruljohn/Reina-Valera)...\n');

  const repoRes = await fetch(REPO_URL, {
    headers: { 'User-Agent': 'manah-bible-importer' },
  });
  if (!repoRes.ok) throw new Error(`GitHub API error: ${repoRes.status}`);
  const files: GitHubFile[] = await repoRes.json();

  const jsonFiles = files.filter((f) => f.name.endsWith('.json'));
  console.log(`✓ ${jsonFiles.length} archivos JSON encontrados en el repo\n`);

  const processedSlugs = new Set<string>();
  const books: OutputBook[] = [];
  let totalChapters = 0;
  let totalVerses = 0;
  let skipped = 0;

  for (const file of jsonFiles) {
    const meta = FILE_TO_SLUG[file.name];
    if (!meta) {
      console.log(`⚠️  Sin mapeo: ${file.name}`);
      skipped++;
      continue;
    }

    // Skip aliases if primary already processed
    if (processedSlugs.has(meta.slug)) {
      console.log(`⏭️  Alias saltado: ${file.name} (${meta.slug} ya procesado)`);
      continue;
    }

    process.stdout.write(`📘 ${meta.name}... `);

    const bookRes = await fetch(file.download_url);
    if (!bookRes.ok) {
      console.log(`❌ HTTP ${bookRes.status}`);
      continue;
    }

    const source: SourceBook = await bookRes.json();
    const outputChapters: OutputChapter[] = source.chapters.map((ch) => {
      const verses: OutputVerse[] = ch.verses.map((v) => ({
        number: v.verse,
        text: v.text.trim(),
      }));
      return {
        number: ch.chapter,
        verseCount: verses.length,
        verses,
      };
    });

    books.push({ slug: meta.slug, name: meta.name, chapters: outputChapters });
    processedSlugs.add(meta.slug);

    const chCount = outputChapters.length;
    const vCount = outputChapters.reduce((s, c) => s + c.verseCount, 0);
    totalChapters += chCount;
    totalVerses += vCount;

    console.log(`✓ ${chCount} caps, ${vCount} versículos`);

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }

  // Sort books by slug order (as they appear in the Bible)
  const slugOrder = Object.values(FILE_TO_SLUG)
    .map((m) => m.slug)
    .filter((s, i, arr) => arr.indexOf(s) === i);
  books.sort((a, b) => slugOrder.indexOf(a.slug) - slugOrder.indexOf(b.slug));

  const output = {
    version: 'RVR1960',
    source: 'https://github.com/aruljohn/Reina-Valera',
    generatedAt: new Date().toISOString(),
    stats: {
      books: books.length,
      chapters: totalChapters,
      verses: totalVerses,
    },
    books,
  };

  const outPath = path.join(__dirname, '..', '..', '..', 'Scrapping', 'exports', 'RVR1960_github.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ GENERACIÓN COMPLETA');
  console.log(`📚 Libros:     ${books.length}`);
  console.log(`📖 Capítulos:  ${totalChapters}`);
  console.log(`📝 Versículos: ${totalVerses}`);
  console.log(`⚠️  Saltados:   ${skipped}`);
  console.log(`💾 Guardado en: ${outPath}`);
  console.log('='.repeat(60));
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
