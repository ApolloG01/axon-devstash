-- Migration: per_user_tags
-- Tags become per-user; existing global tag data is cleared since this is a dev database.

-- Step 1: Clear existing tag relationships and tags (dev data reset)
DELETE FROM "_ItemTags";
DELETE FROM "tags";

-- Step 2: Add user_id column as nullable initially
ALTER TABLE "tags" ADD COLUMN "user_id" TEXT;

-- Step 3: Make NOT NULL now that table is empty
ALTER TABLE "tags" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Step 5: Drop the old global unique constraint on name
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_name_key";

-- Step 6: Add per-user unique constraint
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");
