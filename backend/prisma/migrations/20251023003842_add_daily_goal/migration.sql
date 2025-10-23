-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dailyGoal" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lastReadAt" TIMESTAMP(3);
