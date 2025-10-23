-- AlterTable
ALTER TABLE "chapters" ADD COLUMN     "contentKJV" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "versesKJV" JSONB NOT NULL DEFAULT '{}';
