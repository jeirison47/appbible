import { PrismaClient } from '@prisma/client';
import { XpService } from '../src/services/xp.service';

const prisma = new PrismaClient();

async function recalculateUserLevels() {
  console.log('🔄 Recalculando niveles de usuarios...\n');

  try {
    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
        totalXp: true,
        currentLevel: true,
      },
    });

    console.log(`📊 Encontrados ${users.length} usuarios\n`);

    let updated = 0;
    let unchanged = 0;

    for (const user of users) {
      // Calcular el nivel correcto basado en el XP total
      const correctLevel = XpService.calculateLevel(user.totalXp);

      if (user.currentLevel !== correctLevel) {
        console.log(`🔧 Actualizando usuario: ${user.displayName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   XP: ${user.totalXp}`);
        console.log(`   Nivel actual: ${user.currentLevel} → Nivel correcto: ${correctLevel}\n`);

        await prisma.user.update({
          where: { id: user.id },
          data: { currentLevel: correctLevel },
        });

        updated++;
      } else {
        unchanged++;
      }
    }

    console.log('\n✅ Proceso completado');
    console.log(`   Usuarios actualizados: ${updated}`);
    console.log(`   Usuarios sin cambios: ${unchanged}`);
    console.log(`   Total procesados: ${users.length}\n`);
  } catch (error) {
    console.error('❌ Error al recalcular niveles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recalculateUserLevels();
