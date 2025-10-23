-- AlterTable: Simplificar sistema de metas diarias
-- Pasar de sistema dual (systemDailyGoal + personalDailyGoal) a un solo campo (dailyGoal)

-- Paso 1: Agregar la nueva columna dailyGoal con valor por defecto
ALTER TABLE "user_settings" ADD COLUMN "dailyGoal" INTEGER NOT NULL DEFAULT 1;

-- Paso 2: Migrar datos existentes
-- Si personalDailyGoal tiene valor, usar ese; si no, usar systemDailyGoal
UPDATE "user_settings"
SET "dailyGoal" = COALESCE("personalDailyGoal", "systemDailyGoal", 1);

-- Paso 3: Eliminar las columnas antiguas
ALTER TABLE "user_settings" DROP COLUMN "personalDailyGoal";
ALTER TABLE "user_settings" DROP COLUMN "systemDailyGoal";
