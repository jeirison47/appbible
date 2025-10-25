import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding app configuration...');

  const appConfigData = [
    { key: 'app_name', value: 'Manah', type: 'string' },
    { key: 'app_short_name', value: 'Manah', type: 'string' },
    { key: 'app_description', value: 'Descubre la Biblia de forma interactiva con gamificación. Gana XP, mantén rachas diarias y completa tu camino de lectura.', type: 'string' },
    { key: 'theme_color', value: '#4F46E5', type: 'string' },
    { key: 'background_color', value: '#ffffff', type: 'string' },
    { key: 'default_bible_version', value: 'RV1960', type: 'string' },
    { key: 'default_daily_goal', value: '1', type: 'number' },
    { key: 'streak_xp_required', value: '100', type: 'number' },
    { key: 'xp_per_chapter', value: '100', type: 'number' },
    { key: 'xp_per_minute_reading', value: '10', type: 'number' },
    { key: 'bonus_streak_multiplier', value: '1.5', type: 'number' },
  ];

  for (const config of appConfigData) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, type: config.type },
      create: config,
    });
  }

  console.log('✅ Created/Updated app configuration (Manah)');
  console.log('\n🎉 App config seeding completed!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
