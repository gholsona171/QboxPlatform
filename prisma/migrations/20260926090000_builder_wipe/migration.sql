-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BuilderItemKind" ADD VALUE 'emoji';
ALTER TYPE "BuilderItemKind" ADD VALUE 'sticker';

-- AlterEnum
ALTER TYPE "BuilderItemStatus" ADD VALUE 'kept';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BuilderRunMode" ADD VALUE 'wipe';
ALTER TYPE "BuilderRunMode" ADD VALUE 'wipe_and_build';

-- AlterTable
ALTER TABLE "builder_runs" ADD COLUMN     "snapshot" JSONB;
