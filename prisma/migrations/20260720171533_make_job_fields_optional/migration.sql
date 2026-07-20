-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "department" SET DEFAULT '',
ALTER COLUMN "responsibilities" SET DEFAULT '',
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
