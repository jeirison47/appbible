import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando datos de progreso...\n');

  // 1. Eliminar progreso de libros
  const deletedBookProgress = await prisma.bookProgress.deleteMany({});
  console.log(`✅ Eliminados ${deletedBookProgress.count} registros de progreso de libros`);

  // 2. Eliminar lecturas de capítulos
  const deletedChapterReads = await prisma.chapterRead.deleteMany({});
  console.log(`✅ Eliminados ${deletedChapterReads.count} registros de lecturas de capítulos`);

  // 3. Eliminar progreso diario
  const deletedDailyProgress = await prisma.dailyProgress.deleteMany({});
  console.log(`✅ Eliminados ${deletedDailyProgress.count} registros de progreso diario`);

  // 4. Resetear estadísticas de gamificación en usuarios
  const updatedUsers = await prisma.user.updateMany({
    data: {
      totalXp: 0,
      currentLevel: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadAt: null,
      lastActiveAt: null,
    },
  });
  console.log(`✅ Reseteadas estadísticas de ${updatedUsers.count} usuarios`);

  console.log('\n🎉 Limpieza completada!');
  console.log('✨ Los usuarios y sus configuraciones se mantienen intactos.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
